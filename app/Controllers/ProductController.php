<?php
require_once __DIR__ . '/../Core/Controller.php';
require_once __DIR__ . '/../Models/Product.php';

class ProductController extends Controller {
    private $productModel;

    public function __construct() {
        $this->productModel = new Product();
    }

    public function handleRequest() {
        $this->setHeaders();
        $action = $_GET['action'] ?? 'list';

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($action === 'list') {
                $this->listProducts();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $this->getPostData();

            switch ($action) {
                case 'create':
                    $this->createProduct($data);
                    break;
                case 'update':
                    $this->updateProduct($data);
                    break;
                case 'update_stock':
                    $this->updateStock($data);
                    break;
                case 'delete':
                    $this->deleteProduct($data);
                    break;
                default:
                    $this->jsonResponse(['error' => 'Invalid action'], 400);
            }
        }
    }

    private function listProducts() {
        try {
            $products = $this->productModel->getAllProducts();
            $this->jsonResponse(['success' => true, 'products' => $products]);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function createProduct($data) {
        $id = $data['id'] ?? uniqid();
        $name = $data['name'] ?? '';
        $price = $data['price'] ?? 0;
        $description = $data['description'] ?? '';
        $image_url = $data['image_url'] ?? '';

        if (!$name || $price <= 0) {
            $this->jsonResponse(['error' => 'Valid name and price are required.'], 400);
        }

        try {
            $this->productModel->createProduct($id, $name, $price, $description, $image_url);
            $this->jsonResponse(['success' => true, 'message' => 'Product created successfully']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function updateProduct($data) {
        $id = $data['id'] ?? '';
        $name = $data['name'] ?? '';
        $price = $data['price'] ?? 0;
        $description = $data['description'] ?? '';
        $image_url = $data['image_url'] ?? '';

        if (!$id) {
            $this->jsonResponse(['error' => 'Product ID is required.'], 400);
        }

        // Extract stock field and pass correct order to model
        $stock = $data['stock'] ?? 0;
        try {
            $this->productModel->updateProduct($id, $name, $price, $stock, $description, $image_url);
            $this->jsonResponse(['success' => true, 'message' => 'Product updated successfully']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function updateStock($data) {
        $id = $data['id'] ?? '';
        $stock = $data['stock'] ?? 0;

        if (!$id) {
            $this->jsonResponse(['error' => 'Product ID is required.'], 400);
        }

        try {
            $this->productModel->updateStock($id, $stock);
            $this->jsonResponse(['success' => true, 'message' => 'Stock updated successfully']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    private function deleteProduct($data) {
        $id = $data['id'] ?? '';

        if (!$id) {
            $this->jsonResponse(['error' => 'Product ID is required.'], 400);
        }

        try {
            $this->productModel->deleteProduct($id);
            $this->jsonResponse(['success' => true, 'message' => 'Product deleted successfully']);
        } catch (\PDOException $e) {
            $this->jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
?>
