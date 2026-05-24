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
                $this->listReservations();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            if ($action === 'create') {
                $this->createReservation($data);
            } elseif ($action === 'delete') {
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
        $name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $date = $data['date'] ?? '';
        $time = $data['time'] ?? '';
        $guests = $data['guests'] ?? 1;

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
