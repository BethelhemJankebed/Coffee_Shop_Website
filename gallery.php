<?php
/**
 * Abyssinia Coffee - Gallery API
 */

require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        $stmt = $pdo->query("SELECT * FROM gallery ORDER BY created_at DESC");
        $items = $stmt->fetchAll();
        echo json_encode(['success' => true, 'items' => $items]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = JSON_DECODE(file_get_contents('php://input'), true);

    if ($action === 'add') {
        $image_url = $data['image_url'] ?? '';
        $caption = $data['caption'] ?? '';

        if (!$image_url) {
            echo json_encode(['error' => 'Image URL is required.']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO gallery (image_url, caption) VALUES (?, ?)");
            $stmt->execute([$image_url, $caption]);
            echo json_encode(['success' => true, 'message' => 'Gallery item added!']);
        } catch (Exception $e) {
            echo json_encode(['error' => 'Failed to add gallery item: ' . $e->getMessage()]);
        }
    } else if ($action === 'delete') {
        $id = $data['id'] ?? '';
        try {
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['error' => 'Failed to delete gallery item: ' . $e->getMessage()]);
        }
    }
}
?>
