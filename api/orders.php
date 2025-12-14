<?php
// api/orders.php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
// Remover BOM si existe
$raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
$data = json_decode($raw, true);

if (!$data || empty($data['customer']) || empty($data['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload']);
    exit;
}

$customer = $data['customer'];
$items = $data['items'];
$total = isset($data['total']) ? (float)$data['total'] : 0.0;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('INSERT INTO orders (customer_name, customer_email, total, notes) VALUES (:name, :email, :total, :notes)');
    $stmt->execute([
        ':name' => $customer['name'] ?? '',
        ':email' => $customer['email'] ?? '',
        ':total' => $total,
        ':notes' => $data['notes'] ?? null,
    ]);
    $orderId = $pdo->lastInsertId();

    $stmtItem = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (:order_id, :product_id, :quantity, :price)');
    foreach ($items as $it) {
        $stmtItem->execute([
            ':order_id' => $orderId,
            ':product_id' => $it['product_id'],
            ':quantity' => $it['quantity'],
            ':price' => $it['price'],
        ]);
    }

    $pdo->commit();

    echo json_encode(['ok' => true, 'order_id' => $orderId]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not create order', 'message' => $e->getMessage()]);
}
