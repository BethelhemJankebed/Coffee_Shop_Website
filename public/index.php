<?php
/**
 * Main View Router
 */
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// For static assets in public/, check against the relative path from the server root
$viewPath = trim($path, '/');
if (!empty($viewPath) && file_exists(__DIR__ . '/' . $viewPath) && !is_dir(__DIR__ . '/' . $viewPath)) {
    return false;
}

// For loading views from app/Views/, use the basename to support subdirectories and rewrite engines
$filename = basename($path);
if (empty($filename) || $filename === 'public' || $filename === 'index.php') {
    $filename = 'index.html';
}

if (str_ends_with($filename, '.html')) {
    $viewFile = __DIR__ . '/../app/Views/' . $filename;
    if (file_exists($viewFile)) {
        require_once $viewFile;
        exit;
    }
}

// If it's not found or not an HTML file handled by this router, let the server return 404
http_response_code(404);
echo "404 Not Found - View Router";
?>
