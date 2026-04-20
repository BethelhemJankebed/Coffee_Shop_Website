<?php
/**
 * Abyssinia Coffee - Database Initialization Script
 */

define('DB_HOST', '127.0.0.1;port=3307');
define('DB_NAME', 'coffee_shop');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo_setup = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
    $pdo_setup->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo_setup->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo_setup->exec("USE " . DB_NAME);

    echo "Database checked/created.<br>\n";

    // Create Tables
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 50,
        description TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50),
        items JSON,
        total DECIMAL(10,2),
        source VARCHAR(50),
        delivery_name VARCHAR(100),
        delivery_phone VARCHAR(20),
        delivery_address VARCHAR(255),
        receipt_barcode VARCHAR(40),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        reservation_date DATE,
        reservation_time TIME,
        guests INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        owner_user_id INT,
        owner_username VARCHAR(50),
        username VARCHAR(50),
        rating INT DEFAULT 5,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url LONGTEXT NOT NULL,
        title VARCHAR(255) DEFAULT '',
        type VARCHAR(20) DEFAULT 'image',
        owner_user_id INT NULL,
        owner_username VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ";

    $pdo_setup->exec($sql);
    echo "Tables created successfully.<br>\n";

    // Hardcoded initial data so db.json is no longer needed
    $json_string = '{
      "users": [
        {"username": "admin", "password": "123", "role": "admin"},
        {"username": "abebu", "password": "1234", "role": "user"},
        {"username": "sami", "password": "123", "role": "user"},
        {"username": "kidus", "password": "123", "role": "user"}
      ],
      "products": [
        {"id": "espresso", "name": "Espresso", "price": 3, "desc": "Rich single shot", "image": "img/p_espresso.png"},
        {"id": "americano", "name": "Americano", "price": 3.5, "desc": "Espresso + hot water", "image": "img/p_americano.png"},
        {"id": "latte", "name": "Latte", "price": 4.5, "desc": "Espresso + steamed milk", "image": "img/p_latte.png"},
        {"id": "cappuccino", "name": "Cappuccino", "price": 4.5, "desc": "Espresso + foam", "image": "img/p_cappuccino.png"},
        {"id": "mocha", "name": "Mocha", "price": 5, "desc": "Chocolate + espresso", "image": "img/p_maca.png"},
        {"id": "macchiato", "name": "Macchiato", "price": 4, "desc": "Espresso marked with foam", "image": "img/p_maca.png"},
        {"id": "croissant", "name": "Butter Croissant", "price": 3.25, "desc": "Flaky, buttery pastry", "image": "img/butter.jpg"},
        {"id": "muffin", "name": "Chocolate Muffin", "price": 3, "desc": "Freshly baked daily", "image": "img/cupcake.jpg"}
      ]
    }';

    $json_data = json_decode($json_string, true);

    // Populate users
    if (!empty($json_data['users'])) {
        $stmt = $pdo_setup->prepare("INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
        foreach ($json_data['users'] as $user) {
            $password = $user['password'];
            if (strlen($password) < 50) { 
                $password = password_hash($password, PASSWORD_BCRYPT);
            }
            $stmt->execute([$user['username'], $password, $user['role'] ?? 'user']);
        }
        echo "Users populated.<br>\n";
    }

    // Populate products
    if (!empty($json_data['products'])) {
        $stmt = $pdo_setup->prepare("INSERT INTO products (id, name, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?, ?) 
                                     ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), stock=VALUES(stock), description=VALUES(description), image_url=VALUES(image_url)");
        foreach ($json_data['products'] as $product) {
            $stmt->execute([
                $product['id'], 
                $product['name'], 
                $product['price'], 
                $product['stock'] ?? 50,
                $product['desc'] ?? '', 
                $product['image'] ?? ''
            ]);
        }
        echo "Products populated.<br>\n";
    }

    echo "Database initialization complete!";
} catch (PDOException $e) {
    die("Setup failed: " . $e->getMessage());
}
?>
