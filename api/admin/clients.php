<?php
// api/admin/clients.php - gestión de Clientes (cada cliente tendrá su propia tabla de productos)
session_start();
require __DIR__ . '/../../db.php';

header('Content-Type: application/json; charset=utf-8');
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

// Crear tabla de clients si no existe
$pdo->exec("CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    logo VARCHAR(255) DEFAULT '',
    meta JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// GET - listar clients
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM clients ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    echo json_encode($rows);
    exit;
}

// Mutaciones requieren auth
if (empty($_SESSION['admin_logged'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper para crear tabla de productos del cliente
function ensure_client_products_table($pdo, $client_id) {
    $table = 'client_products_' . intval($client_id);
    $sql = "CREATE TABLE IF NOT EXISTS `" . $table . "` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        slug VARCHAR(191) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        image VARCHAR(255) DEFAULT '',
        category VARCHAR(191) DEFAULT '',
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
}

// POST - crear cliente
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO clients (name, slug, logo, meta) VALUES (:name, :slug, :logo, :meta)');
    $stmt->execute([
        ':name' => $data['name'] ?? '',
        ':slug' => $data['slug'] ?? '',
        ':logo' => $data['logo'] ?? '',
        ':meta' => isset($data['meta']) ? json_encode($data['meta']) : null,
    ]);
    $id = $pdo->lastInsertId();
    // crear tabla de productos para este cliente
    ensure_client_products_table($pdo, $id);
    echo json_encode(['ok' => true, 'id' => $id]);
    exit;
}

// PUT - actualizar cliente
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE clients SET name=:name, slug=:slug, logo=:logo, meta=:meta WHERE id=:id');
    $stmt->execute([
        ':id' => $data['id'],
        ':name' => $data['name'] ?? '',
        ':slug' => $data['slug'] ?? '',
        ':logo' => $data['logo'] ?? '',
        ':meta' => isset($data['meta']) ? json_encode($data['meta']) : null,
    ]);
    echo json_encode(['ok' => true]);
    exit;
}

// DELETE - eliminar cliente y su tabla (opcional)
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id) {
        $stmt = $pdo->prepare('DELETE FROM clients WHERE id=:id');
        $stmt->execute([':id' => $id]);
        $table = 'client_products_' . $id;
        try { $pdo->exec('DROP TABLE IF EXISTS `' . $table . '`'); } catch (Exception $e) {}
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
