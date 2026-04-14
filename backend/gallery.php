<?php
/**
 * Abyssinia Coffee - Gallery API
 */
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT id, url as image_url, title as caption, type, created_at FROM gallery ORDER BY created_at DESC");
            $items = $stmt->fetchAll();
            echo json_encode(['success' => true, 'items' => $items]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create') {
        $url = $data['url'] ?? '';
        $title = $data['title'] ?? '';
        $type = $data['type'] ?? 'image';

        if (empty($url)) {
            echo json_encode(['error' => 'URL is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO gallery (url, title, type) VALUES (?, ?, ?)");
            $stmt->execute([$url, $title, $type]);
            echo json_encode(['success' => true, 'message' => 'Gallery item added successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? '';
        if (!$id) {
            echo json_encode(['error' => 'Item ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Gallery item deleted successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
