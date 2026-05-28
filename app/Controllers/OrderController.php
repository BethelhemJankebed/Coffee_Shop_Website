<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Order.php';

class OrderController extends Controller {
    private $orderModel;

    public function __construct() {
        $this->orderModel = new Order();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? '';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'list') {
                $this->listOrders();
            } elseif ($action === 'user_orders') {
                $this->userOrders();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            if ($action === 'create') {
                $this->createOrder($data);
            } elseif ($action === 'delete') {
                $this->deleteOrder($data);
            }
        }
    }

    private function listOrders() {
        // listing all orders requires admin
        $this->requireAdmin();
        try {
            $orders = $this->orderModel->getAllOrders();
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
            }
            $this->jsonResponse(['success' => true, 'orders' => $orders]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function userOrders() {
        // If non-admin, return only the session user's orders; admin may pass user_id
        $sessionUser = $this->currentUser();
        if (!$sessionUser) {
            $user_id = $_GET['user_id'] ?? 0;
        } elseif (isset($sessionUser['role']) && $sessionUser['role'] === 'admin') {
            $user_id = $_GET['user_id'] ?? 0;
        } else {
            $user_id = $sessionUser['id'];
        }
        try {
            $orders = $this->orderModel->getUserOrders($user_id);
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
            }
            $this->jsonResponse(['success' => true, 'orders' => $orders]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function createOrder($data) {
        // Prefer server-side session user when available
        $sessionUser = $this->currentUser();
        $user_id  = $sessionUser['id'] ?? $data['user_id'] ?? null;
        $username = $sessionUser['username'] ?? $data['username'] ?? 'Guest';
        $items_array = $data['items'] ?? [];
        $items_json  = json_encode($items_array);
        $total    = $data['total'] ?? 0;
        $source   = $data['source'] ?? 'UNKNOWN';
        $d_name   = $data['delivery_name'] ?? '';
        $d_phone  = $data['delivery_phone'] ?? '';
        $d_addr   = $data['delivery_address'] ?? '';

        if (empty($items_array)) {
            $this->jsonResponse(['error' => 'Order must contain items.'], 400);
        }

        try {
            $this->orderModel->createOrder($user_id, $username, $items_json, $total, $source, $d_name, $d_phone, $d_addr, $items_array);
            $this->jsonResponse(['success' => true, 'message' => 'Order placed successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function deleteOrder($data) {
        // only admins may delete orders
        $this->requireAdmin();
        $id = $data['id'] ?? '';
        if (!$id) {
            $this->jsonResponse(['error' => 'Order ID is required.'], 400);
        }

        try {
            $this->orderModel->deleteOrder($id);
            $this->jsonResponse(['success' => true, 'message' => 'Order deleted successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
?>
