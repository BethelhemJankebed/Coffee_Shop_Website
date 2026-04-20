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
        owner_user_id INT NULL,
        owner_username VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    try {
        $pdo->exec("ALTER TABLE gallery MODIFY url LONGTEXT NOT NULL");
    } catch (PDOException $e) {
        // Ignore if the column is already LONGTEXT or the engine doesn't support MODIFY here.
    }

    try {
        $pdo->exec("ALTER TABLE gallery ADD COLUMN owner_user_id INT NULL AFTER type");
    } catch (PDOException $e) {
        // Ignore if the column already exists.
    }

    try {
        $pdo->exec("ALTER TABLE gallery ADD COLUMN owner_username VARCHAR(50) DEFAULT NULL AFTER owner_user_id");
    } catch (PDOException $e) {
        // Ignore if the column already exists.
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

function validateUploadedImage(array $file): array
{
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        return [false, 'Upload failed.'];
    }

    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return [false, 'Invalid upload source.'];
    }

    $maxSize = 5 * 1024 * 1024;
    if (($file['size'] ?? 0) > $maxSize) {
        return [false, 'File too large (max 5MB).'];
    }

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];

    $imageInfo = @getimagesize($file['tmp_name']);
    if (!$imageInfo || empty($imageInfo['mime'])) {
        return [false, 'File is not a valid image.'];
    }

    $mime = $imageInfo['mime'];
    if (!isset($allowed[$mime])) {
        return [false, 'Unsupported image type.'];
    }

    return [true, $allowed[$mime]];
}

function reencodeImage(string $destination, string $extension): void
{
    if (!function_exists('imagecreatefromstring')) {
        return;
    }

    $raw = @file_get_contents($destination);
    if ($raw === false) {
        return;
    }

    $image = @imagecreatefromstring($raw);
    if (!$image) {
        return;
    }

    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            if (function_exists('imagejpeg')) {
                imagejpeg($image, $destination, 85);
            }
            break;
        case 'png':
            if (function_exists('imagepng')) {
                imagepng($image, $destination, 6);
            }
            break;
        case 'gif':
            if (function_exists('imagegif')) {
                imagegif($image, $destination);
            }
            break;
        case 'webp':
            if (function_exists('imagewebp')) {
                imagewebp($image, $destination, 85);
            }
            break;
    }

    imagedestroy($image);
}

function uploadImage(array $file, string $uploadDir = 'uploads/'): array
{
    [$isValid, $result] = validateUploadedImage($file);

    if (!$isValid) {
        return [false, $result];
    }

    $extension = $result;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $newFileName = uniqid('img_', true) . '.' . $extension;
    $destination = rtrim($uploadDir, '/') . '/' . $newFileName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return [false, 'Failed to store uploaded file.'];
    }

    reencodeImage($destination, $extension);

    return [true, $newFileName];
}

function resolveOwner(PDO $pdo, $ownerUserId, string $ownerUsername): array
{
    $ownerUserId = is_numeric($ownerUserId) ? (int) $ownerUserId : null;
    $ownerUsername = trim($ownerUsername);

    if ($ownerUserId !== null && $ownerUsername === '') {
        $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$ownerUserId]);
        $ownerUsername = (string) ($stmt->fetchColumn() ?: '');
    }

    return [$ownerUserId, $ownerUsername !== '' ? $ownerUsername : null];
}

function canDeleteGalleryItem(PDO $pdo, int $galleryId, ?int $requesterUserId): bool
{
    if ($requesterUserId === null) {
        return false;
    }

    $galleryStmt = $pdo->prepare("SELECT owner_user_id FROM gallery WHERE id = ? LIMIT 1");
    $galleryStmt->execute([$galleryId]);
    $ownerUserId = $galleryStmt->fetchColumn();

    if ($ownerUserId === false) {
        return false;
    }

    $roleStmt = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
    $roleStmt->execute([$requesterUserId]);
    $requesterRole = $roleStmt->fetchColumn();

    if ($requesterRole === 'admin') {
        return true;
    }

    return (string) $ownerUserId === (string) $requesterUserId;
}

ensureGalleryTable($pdo);
ensureGalleryUploadDir();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT id, url as image_url, title as caption, type, owner_user_id, owner_username, created_at FROM gallery ORDER BY created_at DESC");
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
        [$ownerUserId, $ownerUsername] = resolveOwner($pdo, $data['owner_user_id'] ?? null, (string) ($data['owner_username'] ?? ''));

        if ($isMultipart && isset($_FILES['image_file'])) {
            [$ok, $result] = uploadImage($_FILES['image_file'], ensureGalleryUploadDir());

            if (!$ok) {
                echo json_encode(['error' => $result]);
                exit;
            }

            $url = buildGalleryUrl($result);
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
            $stmt = $pdo->prepare("INSERT INTO gallery (url, title, type, owner_user_id, owner_username) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$url, $title, $type, $ownerUserId, $ownerUsername]);
            echo json_encode([
                'success' => true,
                'message' => 'Gallery item added successfully.',
                'owner_user_id' => $ownerUserId,
                'owner_username' => $ownerUsername,
            ]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? '';
        $requesterUserId = isset($data['requester_user_id']) ? (int) $data['requester_user_id'] : null;
        if (!$id) {
            echo json_encode(['error' => 'Item ID is required.']);
            exit;
        }

        if (!canDeleteGalleryItem($pdo, (int) $id, $requesterUserId)) {
            echo json_encode(['error' => 'You can only delete your own post.']);
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
