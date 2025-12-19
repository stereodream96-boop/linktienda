<?php
// api/products.php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Debug mode
$debug = ((isset($_GET['debug']) && $_GET['debug'] === '1') || getenv('APP_DEBUG') === '1');
if ($debug) {
    $logFile = __DIR__ . '/products_debug.log';
    $line = date('Y-m-d H:i:s') . "\tREQUEST\t" . ($_SERVER['REQUEST_URI'] ?? '') . PHP_EOL;
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    $out = ['error' => 'Method not allowed'];
    if ($debug) @file_put_contents($logFile, date('c') . "\tmethod_not_allowed\n", FILE_APPEND | LOCK_EX);
    echo json_encode($out);
    exit;
}

try {
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
} catch (Exception $e) {
    http_response_code(500);
    $err = ['error' => 'internal_error'];
    if ($debug) {
        $err['message'] = $e->getMessage();
        @file_put_contents($logFile, date('c') . "\texception: " . $e->getMessage() . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
    echo json_encode($err);
}
