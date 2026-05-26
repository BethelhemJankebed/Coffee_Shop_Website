<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/User.php';

class AuthController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? '';

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            switch ($action) {
                case 'signup':
                    $this->signup($data);
                    break;
                case 'login':
                    $this->login($data);
                    break;
                default:
                    $this->jsonResponse(['error' => 'Invalid action'], 400);
            }
        } else {
            $this->jsonResponse(['status' => 'Authentication API running.'], 200);
        }
    }

    private function signup($data) {
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');
        $email = trim($data['email'] ?? '');

        if (!$username || !$password) {
            $this->jsonResponse(['error' => 'Username and password are required.'], 400);
        }

        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['error' => 'Invalid email address.'], 400);
        }

        // Check if user exists
        $existingUser = $this->userModel->findByUsername($username);
        if ($existingUser) {
            $this->jsonResponse(['error' => 'Username already exists.'], 400);
        }

        $hashed_password = password_hash($password, PASSWORD_BCRYPT);

        try {
            $this->userModel->createUser($username, $hashed_password, $email);
            $this->jsonResponse(['success' => 'Signup successful!']);
        } catch (\Exception $e) {
            // Log error internally, do not expose raw DB exceptions to the user
            error_log($e->getMessage());
            $this->jsonResponse(['error' => 'Signup failed due to a server error. Please try again later.'], 500);
        }
    }

    private function login($data) {
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$username || !$password) {
            $this->jsonResponse(['error' => 'Username and password are required.'], 400);
        }

        $user = $this->userModel->findByUsername($username);

        if ($user) {
            // Check password (considering both hashed and plain text for backward compatibility)
            if (password_verify($password, $user['password']) || $password === $user['password']) {
                // Update to hashed if plain text
                if ($password === $user['password'] && !password_verify($password, $user['password'])) {
                    $new_hash = password_hash($password, PASSWORD_BCRYPT);
                    $this->userModel->updatePassword($user['id'], $new_hash);
                }

                unset($user['password']); // Don't return password
                $this->jsonResponse([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'role' => $user['role'],
                        'initials' => strtoupper(substr($user['username'], 0, 1))
                    ]
                ]);
            } else {
                $this->jsonResponse(['error' => 'Invalid credentials.'], 401);
            }
        } else {
            $this->jsonResponse(['error' => 'User not found.'], 404);
        }
    }
}
?>
