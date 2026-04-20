<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

header('Content-Type: application/json');

function ensureReviewColumns(PDO $pdo): void
{
    $requiredColumns = [
        'owner_user_id' => "ALTER TABLE reviews ADD COLUMN owner_user_id INT NULL AFTER user_id",
        'owner_username' => "ALTER TABLE reviews ADD COLUMN owner_username VARCHAR(50) NULL AFTER owner_user_id",
    ];

    foreach ($requiredColumns as $column => $statement) {
        $check = $pdo->prepare("SHOW COLUMNS FROM reviews LIKE ?");
        $check->execute([$column]);

        if (!$check->fetch()) {
            $pdo->exec($statement);
        }
    }
}

function canDeleteReview(PDO $pdo, int $reviewId, ?int $requesterUserId): bool
{
    if ($requesterUserId === null) {
        return false;
    }

    $userStmt = $pdo->prepare("SELECT username, role FROM users WHERE id = ? LIMIT 1");
    $userStmt->execute([$requesterUserId]);
    $requester = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$requester) {
        return false;
    }

    if (($requester['role'] ?? '') === 'admin') {
        return true;
    }

    $reviewStmt = $pdo->prepare("SELECT owner_user_id, owner_username, username FROM reviews WHERE id = ? LIMIT 1");
    $reviewStmt->execute([$reviewId]);
    $review = $reviewStmt->fetch(PDO::FETCH_ASSOC);

    if (!$review) {
        return false;
    }

    if (!empty($review['owner_user_id']) && (int) $review['owner_user_id'] === (int) $requesterUserId) {
        return true;
    }

    $reviewOwnerName = $review['owner_username'] ?? $review['username'] ?? '';

    return $reviewOwnerName !== '' && strcasecmp($reviewOwnerName, $requester['username'] ?? '') === 0;
}

ensureReviewColumns($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'add') {
        try {
            $stmt = $pdo->prepare("INSERT INTO reviews (user_id, owner_user_id, owner_username, username, rating, comment) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['user_id'],
                $data['user_id'],
                $data['username'],
                $data['username'],
                $data['rating'] ?? 5,
                $data['comment']
            ]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $reviewId = (int) ($data['id'] ?? 0);
        $requesterUserId = isset($data['requester_user_id']) ? (int) $data['requester_user_id'] : null;

        if ($reviewId <= 0) {
            echo json_encode(["status" => "error", "message" => "Review ID is required."]);
            exit;
        }

        if (!canDeleteReview($pdo, $reviewId, $requesterUserId)) {
            echo json_encode(["status" => "error", "message" => "You can only delete your own review."]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
            $stmt->execute([$reviewId]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
} else {
    // GET reviews
    try {
        $stmt = $pdo->query("SELECT id, user_id, owner_user_id, owner_username, username, rating, comment, created_at FROM reviews ORDER BY created_at DESC LIMIT 10");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
