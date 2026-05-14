-- Create the database
CREATE DATABASE IF NOT EXISTS coffee_shop;
USE coffee_shop;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    category VARCHAR(50)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50), -- To match existing behavior if needed, but linking to user_id is better
    total_amount DECIMAL(10, 2) NOT NULL,
    source VARCHAR(50),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id VARCHAR(50),
    product_name VARCHAR(100),
    price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial admin user
INSERT INTO users (username, password, role) VALUES ('admin', '123', 'admin');

-- Insert initial products
INSERT INTO products (id, name, price, description, image_url) VALUES 
('espresso', 'Espresso', 3.00, 'Rich single shot', '../img/esspresso.png'),
('americano', 'Americano', 3.50, 'Espresso + hot water', '../img/moca.png'),
('latte', 'Latte', 4.50, 'Espresso + steamed milk', '../img/c1.jpg'),
('cappuccino', 'Cappuccino', 4.50, 'Espresso + foam', '../img/c2.jpg'),
('mocha', 'Mocha', 5.00, 'Chocolate + espresso', '../img/c3.jpg'),
('macchiato', 'Macchiato', 4.00, 'Espresso marked with foam', '../img/c4.jpg'),
('croissant', 'Butter Croissant', 3.25, 'Flaky, buttery pastry', '../img/butter.jpg'),
('muffin', 'Chocolate Muffin', 3.00, 'Freshly baked daily', '../img/cupcake.jpg');
