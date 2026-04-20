<?php
/**
 * Abyssinia Coffee - Products API
 */
require_once 'config.php';

$action = $_GET['action'] ?? 'list';

header('Content-Type: application/json');

function uploadProductImage(): void
{
    if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
        echo json_encode(['error' => 'Image file is required.']);
        return;
    }

    $file = $_FILES['image'];

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        echo json_encode(['error' => 'Image upload failed.']);
        return;
    }

    if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
        echo json_encode(['error' => 'Image is too large. Max size is 5MB.']);
        return;
    }

    $tmpName = $file['tmp_name'] ?? '';
    if (!$tmpName || !is_uploaded_file($tmpName)) {
        echo json_encode(['error' => 'Invalid upload source.']);
        return;
    }

    $imageInfo = @getimagesize($tmpName);
    $mime = $imageInfo['mime'] ?? '';
    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];

    if (!isset($allowedMimes[$mime])) {
        echo json_encode(['error' => 'Unsupported image format. Use JPG, PNG, GIF, or WEBP.']);
        return;
    }

    $uploadDir = __DIR__ . '/../frontend/img/products';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        echo json_encode(['error' => 'Could not prepare image directory.']);
        return;
    }

    $extension = $allowedMimes[$mime];
    $fileName = 'product_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $destination = $uploadDir . '/' . $fileName;

    if (!move_uploaded_file($tmpName, $destination)) {
        echo json_encode(['error' => 'Could not save uploaded image.']);
        return;
    }

    echo json_encode([
        'success' => true,
        'image_url' => 'img/products/' . $fileName,
    ]);
}

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
    if ($action === 'upload_image') {
        uploadProductImage();
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        $data = [];
    }

    if ($action === 'create') {
        $id = $data['id'] ?? uniqid(); // Use provided ID or generate a unique one
        $name = $data['name'] ?? '';
        $price = isset($data['price']) ? (float) $data['price'] : 0;
        $stock = isset($data['stock']) ? (int) $data['stock'] : 50;
        $description = $data['description'] ?? '';
        $image_url = $data['image_url'] ?? '';

        if (!$name || $price <= 0 || $stock < 0) {
            echo json_encode(['error' => 'Valid name, price, and stock are required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO products (id, name, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $name, $price, $stock, $description, $image_url]);
            echo json_encode(['success' => true, 'message' => 'Product created successfully']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'update') {
        $id = $data['id'] ?? '';
        $name = $data['name'] ?? '';
        $price = isset($data['price']) ? (float) $data['price'] : 0;
        $stock = isset($data['stock']) ? (int) $data['stock'] : 0;
        $description = $data['description'] ?? '';
        $image_url = $data['image_url'] ?? '';

        if (!$id || !$name || $price <= 0 || $stock < 0) {
            echo json_encode(['error' => 'Valid product id, name, price, and stock are required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE products SET name = ?, price = ?, stock = ?, description = ?, image_url = ? WHERE id = ?");
            $stmt->execute([$name, $price, $stock, $description, $image_url, $id]);
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
