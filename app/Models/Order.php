<?php
require_once __DIR__ . '/../Core/Model.php';

class Order extends Model {
    public function getAllOrders() {
        $stmt = $this->db->query("SELECT id, user_id, username, items, total as total_amount, source, order_date, delivery_name, delivery_phone, delivery_address FROM orders ORDER BY order_date DESC");
        return $stmt->fetchAll();
    }

    public function getUserOrders($user_id) {
        $stmt = $this->db->prepare("SELECT id, user_id, username, items, total as total_amount, source, order_date, delivery_name, delivery_phone, delivery_address FROM orders WHERE user_id = ? ORDER BY order_date DESC");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll();
    }

    public function createOrder($user_id, $username, $items_json, $total, $source, $d_name, $d_phone, $d_addr, $items_array) {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("INSERT INTO orders (user_id, username, items, total, source, delivery_name, delivery_phone, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $username, $items_json, $total, $source, $d_name, $d_phone, $d_addr]);

            $update_stmt = $this->db->prepare("UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0");
            foreach ($items_array as $item) {
                $update_stmt->execute([$item['id']]);
            }

            $this->db->commit();
            return true;
        } catch (\PDOException $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function deleteOrder($id) {
        $stmt = $this->db->prepare("DELETE FROM orders WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
