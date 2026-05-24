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

            if ($action === 'create') {
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
        $url = $data['url'] ?? '';
        $title = $data['title'] ?? '';
        $type = $data['type'] ?? 'image';

        if (empty($url)) {
            $this->jsonResponse(['error' => 'URL is required.'], 400);
        }

        try {
            $this->galleryModel->createItem($url, $title, $type);
            $this->jsonResponse(['success' => true, 'message' => 'Gallery item added successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function deleteItem($data) {
        $id = $data['id'] ?? '';
        if (!$id) {
            $this->jsonResponse(['error' => 'Item ID is required.'], 400);
        }

        try {
            $this->galleryModel->deleteItem($id);
            $this->jsonResponse(['success' => true, 'message' => 'Gallery item deleted successfully.']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
?>
