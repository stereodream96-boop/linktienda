<?php
// api/admin/products.php - CRUD de productos (requiere auth)
session_start();
require __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');
// CORS dinámico
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigins = [
    'https://www.linktienda.com',
    'http://www.linktienda.com',
    'https://linktienda.com',
    'http://linktienda.com',
];
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Verificar autenticación
if (empty($_SESSION['admin_logged'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - Listar productos
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
    $products = $stmt->fetchAll();
    echo json_encode($products);
    exit;
}

// POST - Crear producto
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare('INSERT INTO products (name, slug, description, price, image, category, stock) VALUES (:name, :slug, :desc, :price, :image, :cat, :stock)');
    $stmt->execute([
        ':name' => $data['name'],
        ':slug' => $data['slug'],
        ':desc' => $data['description'] ?? '',
        ':price' => $data['price'],
        ':image' => $data['image'] ?? '',
        ':cat' => $data['category'] ?? '',
        ':stock' => $data['stock'] ?? 0,
    ]);
    
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// PUT - Actualizar producto
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare('UPDATE products SET name=:name, slug=:slug, description=:desc, price=:price, image=:image, category=:cat, stock=:stock WHERE id=:id');
    $stmt->execute([
        ':id' => $data['id'],
        ':name' => $data['name'],
        ':slug' => $data['slug'],
        ':desc' => $data['description'] ?? '',
        ':price' => $data['price'],
        ':image' => $data['image'] ?? '',
        ':cat' => $data['category'] ?? '',
        ':stock' => $data['stock'] ?? 0,
    ]);
    
    echo json_encode(['ok' => true]);
    exit;
}

// DELETE - Eliminar producto
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare('DELETE FROM products WHERE id=:id');
    $stmt->execute([':id' => $id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
