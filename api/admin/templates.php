<?php
// api/admin/templates.php - Gestión simple de plantillas (header/banner/logo)
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

// Crear tabla si no existe
$pdo->exec("CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    logo VARCHAR(255) DEFAULT '',
    banners JSON NULL,
    meta JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// GET - listar plantillas
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM templates ORDER BY id DESC');
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

// POST - crear plantilla
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO templates (name, slug, logo, banners, meta) VALUES (:name, :slug, :logo, :banners, :meta)');
    $stmt->execute([
        ':name' => $data['name'] ?? '',
        ':slug' => $data['slug'] ?? '',
        ':logo' => $data['logo'] ?? '',
        ':banners' => isset($data['banners']) ? json_encode($data['banners']) : null,
        ':meta' => isset($data['meta']) ? json_encode($data['meta']) : null,
    ]);
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// PUT - actualizar plantilla
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE templates SET name=:name, slug=:slug, logo=:logo, banners=:banners, meta=:meta WHERE id=:id');
    $stmt->execute([
        ':id' => $data['id'],
        ':name' => $data['name'] ?? '',
        ':slug' => $data['slug'] ?? '',
        ':logo' => $data['logo'] ?? '',
        ':banners' => isset($data['banners']) ? json_encode($data['banners']) : null,
        ':meta' => isset($data['meta']) ? json_encode($data['meta']) : null,
    ]);
    echo json_encode(['ok' => true]);
    exit;
}

// DELETE - eliminar plantilla
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $stmt = $pdo->prepare('DELETE FROM templates WHERE id=:id');
    $stmt->execute([':id' => $id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
