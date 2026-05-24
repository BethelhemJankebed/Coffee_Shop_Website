<?php
/**
 * Main View Router
 */
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$viewPath = trim($path, '/');

// If it's a real file that exists in the public folder (like CSS, JS, images), serve it directly
if (!empty($viewPath) && file_exists(__DIR__ . '/' . $viewPath) && !is_dir(__DIR__ . '/' . $viewPath)) {
    return false;
}

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
