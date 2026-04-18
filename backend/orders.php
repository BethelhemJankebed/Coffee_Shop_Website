<?php
/**
 * Abyssinia Coffee - Orders API
 */
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT id, user_id, username, items, total as total_amount, source, order_date FROM orders ORDER BY order_date DESC");
            $orders = $stmt->fetchAll();
            // Decode JSON items for frontend
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'user_orders') {
        $user_id = $_GET['user_id'] ?? 0;
        try {
            $stmt = $pdo->prepare("SELECT id, user_id, username, items, total as total_amount, source, order_date FROM orders WHERE user_id = ? ORDER BY order_date DESC");
            $stmt->execute([$user_id]);
            $orders = $stmt->fetchAll();
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create') {
        $user_id = $data['user_id'] ?? null;
        $username = $data['username'] ?? 'Guest';
        $items_array = $data['items'] ?? [];
        $items_json = json_encode($items_array);
        $total = $data['total'] ?? 0;
        $source = $data['source'] ?? 'UNKNOWN';

        if (empty($items_array)) {
            echo json_encode(['error' => 'Order must contain items.']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // 1. Insert Order
            $stmt = $pdo->prepare("INSERT INTO orders (user_id, username, items, total, source) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $username, $items_json, $total, $source]);

            // 2. Update Stock for each product
            $update_stmt = $pdo->prepare("UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0");
            foreach ($items_array as $item) {
                // Assuming each item in the array is a unit purchase
                // If the item itself has a quantity, we'd adjust accordingly
                $update_stmt->execute([$item['id']]);
                if ($update_stmt->rowCount() == 0) {
                     // Optionally handle out of stock situation here mid-transaction
                }
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Order placed successfully.']);
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? '';
        if (!$id) {
            echo json_encode(['error' => 'Order ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Order deleted successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
