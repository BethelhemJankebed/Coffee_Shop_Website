<?php
/**
 * Abyssinia Coffee - Reservations API
 */
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT id, full_name, phone, reservation_date, reservation_time, guests, created_at FROM reservations ORDER BY reservation_date DESC, reservation_time DESC");
            $reservations = $stmt->fetchAll();
            echo json_encode(['success' => true, 'reservations' => $reservations]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create') {
        $full_name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $reservation_date = $data['reservation_date'] ?? '';
        $reservation_time = $data['reservation_time'] ?? '';
        $guests = $data['guests'] ?? 1;

        if (empty($full_name) || empty($phone) || empty($reservation_date) || empty($reservation_time)) {
            echo json_encode(['error' => 'All fields are required for a reservation.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO reservations (full_name, phone, reservation_date, reservation_time, guests) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$full_name, $phone, $reservation_date, $reservation_time, $guests]);
            echo json_encode(['success' => true, 'message' => 'Reservation created successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? '';
        if (!$id) {
            echo json_encode(['error' => 'Reservation ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM reservations WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Reservation deleted successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
