<?php
require_once __DIR__ . '/../Core/Model.php';

class Gallery extends Model {
    public function getAllItems() {
        $stmt = $this->db->query("SELECT id, url as image_url, title as caption, type, owner_user_id, owner_username, created_at FROM gallery ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function getItemById($id) {
        $stmt = $this->db->prepare("SELECT * FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function createItem($url, $title, $type, $owner_user_id = null, $owner_username = null) {
        $stmt = $this->db->prepare("INSERT INTO gallery (url, title, type, owner_user_id, owner_username) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$url, $title, $type, $owner_user_id, $owner_username]);
    }

    public function deleteItem($id) {
        $stmt = $this->db->prepare("DELETE FROM gallery WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
