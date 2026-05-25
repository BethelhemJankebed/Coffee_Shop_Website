<?php
require_once __DIR__ . '/../Core/Model.php';

class Product extends Model {
    public function getAllProducts() {
        $stmt = $this->db->query("SELECT id, name, price, stock, description, image_url FROM products ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function createProduct($id, $name, $price, $description, $image_url) {
        $stmt = $this->db->prepare("INSERT INTO products (id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$id, $name, $price, $description, $image_url]);
    }

    public function updateProduct($id, $name, $price, $stock, $description, $image_url) {
        $stmt = $this->db->prepare("UPDATE products SET name = ?, price = ?, stock = ?, description = ?, image_url = ? WHERE id = ?");
        return $stmt->execute([$name, $price, $stock, $description, $image_url, $id]);
    }

    public function updateStock($id, $stock) {
        $stmt = $this->db->prepare("UPDATE products SET stock = ? WHERE id = ?");
        return $stmt->execute([$stock, $id]);
    }

    public function deleteProduct($id) {
        $stmt = $this->db->prepare("DELETE FROM products WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
