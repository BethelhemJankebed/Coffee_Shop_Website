<?php
/**
 * Abyssinia Coffee - Authentication API
 * Handling Login and Signup
 */

require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = JSON_DECODE(file_get_contents('php://input'), true);

    if ($action === 'signup') {
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');
        $email = trim($data['email'] ?? '');

        if (!$username || !$password) {
            echo json_encode(['error' => 'Username and password are required.']);
            exit();
        }

        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'Username already exists.']);
            exit();
        }

        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        
        try {
            $stmt = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
            $stmt->execute([$username, $hashed_password, $email]);
            echo json_encode(['success' => 'Signup successful!']);
        } catch (Exception $e) {
            echo json_encode(['error' => 'Signup failed: ' . $e->getMessage()]);
        }

    } else if ($action === 'login') {
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$username || !$password) {
            echo json_encode(['error' => 'Username and password are required.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user) {
            // Check password (considering both hashed and plain text for backward compatibility if needed)
            if (password_verify($password, $user['password']) || $password === $user['password']) {
                // If it was plain text, update to hashed for security
                if ($password === $user['password'] && !password_verify($password, $user['password'])) {
                    $new_hash = password_hash($password, PASSWORD_BCRYPT);
                    $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$new_hash, $user['id']]);
                }

                unset($user['password']); // Don't return password
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'role' => $user['role'],
                        'initials' => strtoupper(substr($user['username'], 0, 1))
                    ]
                ]);
            } else {
                echo json_encode(['error' => 'Invalid credentials.']);
            }
        } else {
            echo json_encode(['error' => 'User not found.']);
        }
    }
} else {
    echo json_encode(['status' => 'Authentication API running.']);
}
?>
