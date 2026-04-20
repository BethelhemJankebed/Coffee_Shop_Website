<?php
/**
 * Abyssinia Coffee - Orders API
 */
require_once 'config.php';

function ensureOrderDeliveryColumns(PDO $pdo): void
{
    $columns = [
        'delivery_name' => "ALTER TABLE orders ADD COLUMN delivery_name VARCHAR(100) NULL AFTER source",
        'delivery_phone' => "ALTER TABLE orders ADD COLUMN delivery_phone VARCHAR(20) NULL AFTER delivery_name",
        'delivery_address' => "ALTER TABLE orders ADD COLUMN delivery_address VARCHAR(255) NULL AFTER delivery_phone",
    ];

    foreach ($columns as $column => $statement) {
        $check = $pdo->prepare("SHOW COLUMNS FROM orders LIKE ?");
        $check->execute([$column]);

        if (!$check->fetch()) {
            $pdo->exec($statement);
        }
    }
}

ensureOrderDeliveryColumns($pdo);

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        try {
            $stmt = $pdo->query("SELECT id, user_id, username, items, total as total_amount, source, delivery_name, delivery_phone, delivery_address, order_date FROM orders ORDER BY order_date DESC");
            $orders = $stmt->fetchAll();
            // Decode JSON items for frontend
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'user_orders') {
        $user_id = $_GET['user_id'] ?? 0;
        try {
            $stmt = $pdo->prepare("SELECT id, user_id, username, items, total as total_amount, source, delivery_name, delivery_phone, delivery_address, order_date FROM orders WHERE user_id = ? ORDER BY order_date DESC");
            $stmt->execute([$user_id]);
            $orders = $stmt->fetchAll();
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create') {
        $user_id  = $data['user_id'] ?? null;   // null avoids FK mismatch
        $username = $data['username'] ?? 'Guest';
        $items_array = $data['items'] ?? [];
        $items_json  = json_encode($items_array);
        $total    = $data['total'] ?? 0;
        $source   = $data['source'] ?? 'UNKNOWN';
        $d_name   = $data['delivery_name']    ?? '';
        $d_phone  = $data['delivery_phone']   ?? '';
        $d_addr   = $data['delivery_address'] ?? '';

        if (empty($items_array)) {
            echo json_encode(['error' => 'Order must contain items.']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO orders (user_id, username, items, total, source, delivery_name, delivery_phone, delivery_address)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $username, $items_json, $total, $source, $d_name, $d_phone, $d_addr]);

            // Decrement stock
            $update_stmt = $pdo->prepare("UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0");
            foreach ($items_array as $item) {
                $update_stmt->execute([$item['id']]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Order placed successfully.']);
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? '';
        if (!$id) {
            echo json_encode(['error' => 'Order ID is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Order deleted successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
