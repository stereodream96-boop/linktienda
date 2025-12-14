<?php
// api/products.php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Soporta ?category=slug para filtrar
$sql = 'SELECT id, name, slug, description, price, image, category, stock FROM products';
$params = [];
if (!empty($_GET['category'])) {
    $sql .= ' WHERE category = :category';
    $params[':category'] = $_GET['category'];
}
$sql .= ' ORDER BY id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

echo json_encode($products);
