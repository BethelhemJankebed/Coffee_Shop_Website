<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Reservation.php';

class ReservationController extends Controller {
    private $resModel;

    public function __construct() {
        $this->resModel = new Reservation();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? '';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'list') {
                // listing reservations is admin-only
                $this->requireAdmin();
                $this->listReservations();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            if ($action === 'create') {
                $this->createReservation($data);
            } elseif ($action === 'delete') {
                // only admins may delete reservations
                $this->requireAdmin();
                $this->deleteReservation($data);
            }
        }
    }

    private function listReservations() {
        try {
            $reservations = $this->resModel->getAllReservations();
            $this->jsonResponse(['success' => true, 'reservations' => $reservations]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }
    private function createReservation($data) {
        // prefer session user for reservation name when available
        $sessionUser = $this->currentUser();
        $name = $sessionUser['username'] ?? ($data['full_name'] ?? '');
        $phone = $data['phone'] ?? '';
        $date = $data['date'] ?? '';
        $time = $data['time'] ?? '';
        $guests = $data['guests'] ?? 1;

        $today = date('Y-m-d');
        if ($date < $today) {
            $this->jsonResponse(['error' => 'Reservations cannot be made for past dates.'], 400);
            return;
        }

        try {
            $this->resModel->createReservation($name, $phone, $date, $time, $guests);
            $this->jsonResponse(['success' => true]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    private function deleteReservation($data) {
        $id = $data['id'] ?? '';
        try {
            $this->resModel->deleteReservation($id);
            $this->jsonResponse(['success' => true]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
?>
