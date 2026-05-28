<?php
/**
 * Base Controller Class
 */
abstract class Controller {
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    protected function getPostData() {
        return json_decode(file_get_contents('php://input'), true);
    }
    
    protected function setHeaders() {
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    // Session / Auth helpers
    protected function currentUser() {
        if (session_status() === PHP_SESSION_NONE) {
            // session may be started already in api.php, but be defensive
            @session_start();
        }
        return $_SESSION['user'] ?? null;
    }

    protected function requireAuth() {
        $user = $this->currentUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Authentication required.'], 401);
        }
        return $user;
    }

    protected function requireAdmin() {
        $user = $this->currentUser();
        if (!$user || !isset($user['role']) || $user['role'] !== 'admin') {
            $this->jsonResponse(['error' => 'Admin privileges required.'], 403);
        }
        return $user;
    }
}
?>
