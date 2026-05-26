<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Gallery.php';

class GalleryController extends Controller {
    private $galleryModel;

    public function __construct() {
        $this->galleryModel = new Gallery();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? '';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'list') {
                $this->listItems();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            if ($action === 'create' || $action === 'add') {
                $this->createItem($data);
            } elseif ($action === 'delete') {
                $this->deleteItem($data);
            }
        }
    }

    private function listItems() {
        try {
            $items = $this->galleryModel->getAllItems();
            $this->jsonResponse(['success' => true, 'items' => $items]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function createItem($data) {
        $url = $data['url'] ?? $data['image_url'] ?? '';
        $title = $data['title'] ?? $data['caption'] ?? '';
        $type = $data['type'] ?? 'image';
        $owner_user_id   = $data['owner_user_id']   ?? $data['uploaded_by'] ?? null;
        $owner_username  = $data['owner_username']  ?? null;

        if (empty($url)) {
            $this->jsonResponse(['error' => 'URL is required.'], 400);
        }

        try {
            $this->galleryModel->createItem($url, $title, $type, $owner_user_id, $owner_username);
            $this->jsonResponse(['success' => true, 'message' => 'Gallery item added successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function deleteItem($data) {
        $id = $data['id'] ?? '';
        $requestUserId   = $data['owner_user_id'] ?? $data['user_id'] ?? null;
        $requestUserRole = $data['role'] ?? '';

        if (!$id) {
            $this->jsonResponse(['error' => 'Item ID is required.'], 400);
        }

        try {
            $item = $this->galleryModel->getItemById($id);
            if (!$item) {
                $this->jsonResponse(['error' => 'Item not found.'], 404);
            }

           
            if ($requestUserRole !== 'admin') {
                if (!$requestUserId || $item['owner_user_id'] != $requestUserId) {
                    $this->jsonResponse(['error' => 'Unauthorized. You cannot delete this post.'], 403);
                }
            }

            $this->galleryModel->deleteItem($id);
            $this->jsonResponse(['success' => true, 'message' => 'Gallery item deleted successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
?>
