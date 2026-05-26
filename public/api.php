<?php
/**
 * Main API Router
 */
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/ProductController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/OrderController.php';
require_once __DIR__ . '/../app/Controllers/ReservationController.php';
require_once __DIR__ . '/../app/Controllers/ReviewController.php';
require_once __DIR__ . '/../app/Controllers/GalleryController.php';

$controllerParam = $_GET['controller'] ?? '';

switch ($controllerParam) {
    case 'auth':
        $controller = new AuthController();
        $controller->handleRequest();
        break;
    case 'products':
        $controller = new ProductController();
        $controller->handleRequest();
        break;
    case 'users':
        $controller = new UserController();
        $controller->handleRequest();
        break;
    case 'orders':
        $controller = new OrderController();
        $controller->handleRequest();
        break;
    case 'reservations':
        $controller = new ReservationController();
        $controller->handleRequest();
        break;
    case 'reviews':
        $controller = new ReviewController();
        $controller->handleRequest();
        break;
    case 'gallery':
        $controller = new GalleryController();
        $controller->handleRequest();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found.']);
}
?>
