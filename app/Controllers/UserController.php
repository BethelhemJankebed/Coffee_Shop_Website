<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/User.php';

class UserController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? '';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'list') {
                $this->listUsers();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            if ($action === 'delete') {
                $this->deleteUser($data);
            }
        }
    }

    private function listUsers() {
        try {
            $users = $this->userModel->getAllUsers();
            $this->jsonResponse(['success' => true, 'users' => $users]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function deleteUser($data) {
        $id = $data['id'] ?? '';
        if (!$id) {
            $this->jsonResponse(['error' => 'User ID is required.'], 400);
        }

        try {
            $this->userModel->deleteUser($id);
            $this->jsonResponse(['success' => true, 'message' => 'User deleted successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
?>
