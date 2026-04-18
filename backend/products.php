<?php
/**
 * Abyssinia Coffee - Products API
 */
require_once 'config.php';

$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT id, name, price, stock, description, image_url FROM products ORDER BY created_at DESC");
            $products = $stmt->fetchAll();
            echo json_encode(['success' => true, 'products' => $products]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create') {
        $id = $data['id'] ?? uniqid(); // Use provided ID or generate a unique one
        $name = $data['name'] ?? '';
        $price = $data['price'] ?? 0;
        $description = $data['description'] ?? '';
        $image_url = $data['image_url'] ?? '';

        if (!$name || $price <= 0) {
            echo json_encode(['error' => 'Valid name and price are required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO products (id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $name, $price, $description, $image_url]);
            echo json_encode(['success' => true, 'message' => 'Product created successfully']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'update') {
        $id = $data['id'] ?? '';
        $name = $data['name'] ?? '';
        $price = $data['price'] ?? 0;
        $description = $data['description'] ?? '';
        $image_url = $data['image_url'] ?? '';

        if (!$id) {
            echo json_encode(['error' => 'Product ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE products SET name = ?, price = ?, description = ?, image_url = ? WHERE id = ?");
            $stmt->execute([$name, $price, $description, $image_url, $id]);
            echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'update_stock') {
        $id = $data['id'] ?? '';
        $stock = $data['stock'] ?? 0;

        if (!$id) {
            echo json_encode(['error' => 'Product ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
            $stmt->execute([$stock, $id]);
            echo json_encode(['success' => true, 'message' => 'Stock updated successfully']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? '';

        if (!$id) {
            echo json_encode(['error' => 'Product ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
