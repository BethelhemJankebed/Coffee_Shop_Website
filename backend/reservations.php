<?php
/**
 * Abyssinia Coffee - Reservations API
 */
require_once 'config.php';

header('Content-Type: application/json');
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'create') {
        $name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $date = $data['date'] ?? '';
        $time = $data['time'] ?? '';
        $guests = $data['guests'] ?? 1;

        try {
            $stmt = $pdo->prepare("INSERT INTO reservations (full_name, phone, reservation_date, reservation_time, guests) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $phone, $date, $time, $guests]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        try {
            $stmt = $pdo->prepare("DELETE FROM reservations WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} else {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT * FROM reservations ORDER BY reservation_date ASC, reservation_time ASC");
            echo json_encode(['success' => true, 'reservations' => $stmt->fetchAll()]);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>
