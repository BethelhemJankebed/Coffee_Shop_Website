<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Review.php';

class ReviewController extends Controller {
    private $reviewModel;

    public function __construct() {
        $this->reviewModel = new Review();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? '';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $this->listReviews();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            if ($action === 'add') {
                $this->addReview($data);
            } elseif ($action === 'delete') {
                $this->deleteReview($data);
            }
        }
    }

    private function listReviews() {
        try {
            $reviews = $this->reviewModel->getLatestReviews();
            // Original code sent raw array without {success: true} wrapper
            http_response_code(200);
            echo json_encode($reviews);
            exit;
        } catch (\PDOException $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function addReview($data) {
        $user_id = $data['user_id'] ?? null;
        $username = $data['username'] ?? 'Guest';
        $rating = $data['rating'] ?? 5;
        $comment = $data['comment'] ?? '';

        try {
            $this->reviewModel->createReview($user_id, $username, $rating, $comment);
            $this->jsonResponse(['status' => 'success']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function deleteReview($data) {
        $id              = $data['id']              ?? '';
        $requestUserId   = $data['user_id']         ?? null;
        $requestUserRole = $data['role']             ?? '';

        if (!$id) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Review ID is required.'], 400);
        }

        try {
            $review = $this->reviewModel->getReviewById($id);
            if (!$review) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Review not found.'], 404);
            }

            if ($requestUserRole !== 'admin') {
                if (!$requestUserId || $review['user_id'] != $requestUserId) {
                    $this->jsonResponse(['status' => 'error', 'message' => 'Unauthorized. You cannot delete this review.'], 403);
                }
            }

            $this->reviewModel->deleteReview($id);
            $this->jsonResponse(['status' => 'success']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
?>
