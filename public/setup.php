<?php
/**
 * Abyssinia Coffee - Database Setup Script
 * Run this ONCE to create the database and seed initial data.
 * Visit: http://localhost/.../public/setup.php
 */

require_once __DIR__ . '/../app/Core/Env.php';
Env::load(__DIR__ . '/../.env');

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = $_ENV['DB_PORT'] ?? '3307';
$db   = $_ENV['DB_NAME'] ?? 'coffee_shop';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';

echo "<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;} 
      h2{color:#5c3317;} .ok{color:green;} .err{color:red;} pre{background:#f4f4f4;padding:10px;border-radius:6px;}</style>";
echo "<h2>☕ Abyssinia Coffee — Database Setup</h2>";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db`");
    echo "<p class='ok'>✅ Database <strong>$db</strong> created/verified.</p>";

    // Users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='ok'>✅ Table: <strong>users</strong></p>";

    // Products table
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 50,
        description TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='ok'>✅ Table: <strong>products</strong></p>";

    // Orders table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50),
        items JSON,
        total DECIMAL(10,2),
        source VARCHAR(50),
        delivery_name VARCHAR(100),
        delivery_phone VARCHAR(20),
        delivery_address TEXT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    echo "<p class='ok'>✅ Table: <strong>orders</strong></p>";

    // Reservations table
    $pdo->exec("CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        reservation_date DATE,
        reservation_time TIME,
        guests INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='ok'>✅ Table: <strong>reservations</strong></p>";

    // Reviews table
    $pdo->exec("CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50),
        rating INT DEFAULT 5,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='ok'>✅ Table: <strong>reviews</strong></p>";

    // Gallery table
    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        title VARCHAR(100),
        type VARCHAR(20) DEFAULT 'image',
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "<p class='ok'>✅ Table: <strong>gallery</strong></p>";

    echo "<hr><h3>🌱 Seeding Initial Data...</h3>";

    // Seed admin user
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['admin', password_hash('123', PASSWORD_BCRYPT), 'admin@abyssinia.com', 'admin']);
    $stmt->execute(['abebu', password_hash('1234', PASSWORD_BCRYPT), '', 'user']);
    $stmt->execute(['sami',  password_hash('123',  PASSWORD_BCRYPT), '', 'user']);
    echo "<p class='ok'>✅ Default users seeded. (admin / 123)</p>";

    // Seed products
    $products = [
        ['espresso',   'Espresso',        3.00, 'Rich single shot',          'img/p_espresso.png'],
        ['americano',  'Americano',        3.50, 'Espresso + hot water',      'img/p_americano.png'],
        ['latte',      'Latte',            4.50, 'Espresso + steamed milk',   'img/p_latte.png'],
        ['cappuccino', 'Cappuccino',       4.50, 'Espresso + foam',           'img/p_cappuccino.png'],
        ['mocha',      'Mocha',            5.00, 'Chocolate + espresso',      'img/p_maca.png'],
        ['macchiato',  'Macchiato',        4.00, 'Espresso marked with foam', 'img/p_maca.png'],
        ['croissant',  'Butter Croissant', 3.25, 'Flaky, buttery pastry',    'img/butter.jpg'],
        ['muffin',     'Chocolate Muffin', 3.00, 'Freshly baked daily',      'img/cupcake.jpg'],
    ];
    $stmt = $pdo->prepare("INSERT INTO products (id, name, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?, 50) ON DUPLICATE KEY UPDATE name=VALUES(name)");
    foreach ($products as $p) {
        $stmt->execute($p);
    }
    echo "<p class='ok'>✅ Default products seeded.</p>";

    echo "<hr>";
    echo "<h3 class='ok'>🎉 Setup Complete! Your database is ready.</h3>";
    echo "<p>You can now visit your website:</p>";
    echo "<pre>http://localhost" . str_replace($_SERVER['DOCUMENT_ROOT'], '', dirname(__DIR__)) . "/public/app/Views/index.html</pre>";
    echo "<br><strong>⚠️ Delete or protect this file after setup for security.</strong>";

} catch (PDOException $e) {
    echo "<p class='err'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Check that your XAMPP MySQL is running and the port in <code>.env</code> is correct.</p>";
}
?>
