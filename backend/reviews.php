<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'add') {
        try {
            $stmt = $pdo->prepare("INSERT INTO reviews (user_id, username, rating, comment) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['user_id'],
                $data['username'],
                $data['rating'] ?? 5,
                $data['comment']
            ]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        try {
            $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
} else {
    // GET reviews
    try {
        $stmt = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 10");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
