<?php
require_once __DIR__ . '/../Core/Model.php';

class Reservation extends Model {
    public function getAllReservations() {
        $stmt = $this->db->query("SELECT * FROM reservations ORDER BY reservation_date ASC, reservation_time ASC");
        return $stmt->fetchAll();
    }

    public function createReservation($name, $phone, $date, $time, $guests) {
        $stmt = $this->db->prepare("INSERT INTO reservations (full_name, phone, reservation_date, reservation_time, guests) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$name, $phone, $date, $time, $guests]);
    }

    public function deleteReservation($id) {
        $stmt = $this->db->prepare("DELETE FROM reservations WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>
