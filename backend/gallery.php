<?php
/**
 * Abyssinia Coffee - Gallery API
 */
require_once 'config.php';

$action = $_GET['action'] ?? '';

function ensureGalleryTable(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url LONGTEXT NOT NULL,
        title VARCHAR(255) DEFAULT '',
        type VARCHAR(20) DEFAULT 'image',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    try {
        $pdo->exec("ALTER TABLE gallery MODIFY url LONGTEXT NOT NULL");
    } catch (PDOException $e) {
        // Ignore if the column is already LONGTEXT or the engine doesn't support MODIFY here.
    }
}

function ensureGalleryUploadDir(): string
{
    $uploadDir = __DIR__ . '/../frontend/img/gallery_uploads';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    return $uploadDir;
}

function buildGalleryUrl(string $fileName): string
{
    return 'img/gallery_uploads/' . $fileName;
}

ensureGalleryTable($pdo);
ensureGalleryUploadDir();

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
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    $isMultipart = stripos($contentType, 'multipart/form-data') !== false;
    $data = $isMultipart ? $_POST : json_decode(file_get_contents('php://input'), true);

    if ($action === 'create' || $action === 'add') {
        $title = $data['title'] ?? $data['caption'] ?? '';
        $type = $data['type'] ?? 'image';
        $url = $data['url'] ?? $data['image_url'] ?? '';

        if ($isMultipart && isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['image_file'];
            $mime = mime_content_type($file['tmp_name']);
            $allowedMimes = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
            ];

            if (!isset($allowedMimes[$mime])) {
                echo json_encode(['error' => 'Please upload a valid image file.']);
                exit;
            }

            $uploadDir = ensureGalleryUploadDir();
            $fileName = 'gallery_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $allowedMimes[$mime];
            $targetPath = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                echo json_encode(['error' => 'Could not save uploaded image.']);
                exit;
            }

            $url = buildGalleryUrl($fileName);
            $type = 'image';
        }

        if (empty($url)) {
            echo json_encode(['error' => 'URL is required.']);
            exit;
        }

        if (empty($title)) {
            $title = 'Gallery Post';
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
