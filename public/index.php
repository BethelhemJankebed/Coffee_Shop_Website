<?php
/**
 * Main View Router
 */
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/Users/beka/coffeeShop%20with%20Backend/htdocs/coffeeShop%20with%20Backend/Coffee_Shop_Website/public';

// Get just the path part
$path = parse_url($requestUri, PHP_URL_PATH);
// Strip the base path to get the relative view path
$viewPath = str_replace(urldecode($basePath), '', urldecode($path));
$viewPath = trim($viewPath, '/');

if (empty($viewPath) || $viewPath === 'index.php') {
    $viewPath = 'index.html';
}

// If the requested path is exactly an html file, load it from Views
if (str_ends_with($viewPath, '.html')) {
    $viewFile = __DIR__ . '/../app/Views/' . $viewPath;
    if (file_exists($viewFile)) {
        require_once $viewFile;
        exit;
    }
}

// If it's not found or not an HTML file handled by this router, let the server return 404
http_response_code(404);
echo "404 Not Found - View Router";
?>
