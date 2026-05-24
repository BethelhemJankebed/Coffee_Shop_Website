<?php
require_once __DIR__ . '/../Core/Model.php';

class Review extends Model {
    public function getLatestReviews() {
        $stmt = $this->db->query("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 10");
        return $stmt->fetchAll();
    }

    public function createReview($user_id, $username, $rating, $comment) {
        $stmt = $this->db->prepare("INSERT INTO reviews (user_id, username, rating, comment) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$user_id, $username, $rating, $comment]);
    }

    public function deleteReview($id) {
        $stmt = $this->db->prepare("DELETE FROM reviews WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
