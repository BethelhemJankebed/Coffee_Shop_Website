<?php
require_once __DIR__ . '/../Core/Model.php';

class Gallery extends Model {
    public function getAllItems() {
        $stmt = $this->db->query("SELECT id, url as image_url, title as caption, type, created_at FROM gallery ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function createItem($url, $title, $type) {
        $stmt = $this->db->prepare("INSERT INTO gallery (url, title, type) VALUES (?, ?, ?)");
        return $stmt->execute([$url, $title, $type]);
    }

    public function deleteItem($id) {
        $stmt = $this->db->prepare("DELETE FROM gallery WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
