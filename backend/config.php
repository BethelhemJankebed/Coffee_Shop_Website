<?php
/**
 * Abyssinia Coffee - Backend Configuration
 * Database connection using PDO for security
 */

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'coffee_shop');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $dsnCandidates = [
        "mysql:host=127.0.0.1;port=3307;dbname=" . DB_NAME . ";charset=utf8mb4",
        "mysql:host=127.0.0.1;port=3306;dbname=" . DB_NAME . ";charset=utf8mb4",
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    ];

    $lastException = null;
    foreach ($dsnCandidates as $dsn) {
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $lastException = null;
            break;
        } catch (PDOException $e) {
            $lastException = $e;
        }
    }

    if ($lastException) {
        throw $lastException;
    }
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Global headers for API usage
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
