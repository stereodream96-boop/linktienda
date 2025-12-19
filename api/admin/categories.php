<?php
// api/admin/categories.php - CRUD básico para categorías asociadas a plantillas
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
$pdo->exec("CREATE TABLE IF NOT EXISTS category_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT DEFAULT NULL,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    image VARCHAR(255) DEFAULT '',
    meta JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// GET - listar categorías (opcional template_id)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tid = isset($_GET['template_id']) ? intval($_GET['template_id']) : null;
    if ($tid) {
        $stmt = $pdo->prepare('SELECT * FROM category_templates WHERE template_id = :tid ORDER BY id');
        $stmt->execute([':tid' => $tid]);
    } else {
        $stmt = $pdo->query('SELECT * FROM category_templates ORDER BY id');
    }
    $rows = $stmt->fetchAll();
    echo json_encode($rows);
    exit;
}

// Require auth for mutations
if (empty($_SESSION['admin_logged'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// POST - crear categoría
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO category_templates (template_id, name, slug, image, meta) VALUES (:tid, :name, :slug, :image, :meta)');
    $stmt->execute([
        ':tid' => $data['template_id'] ?? null,
        ':name' => $data['name'] ?? '',
        ':slug' => $data['slug'] ?? '',
        ':image' => $data['image'] ?? '',
        ':meta' => isset($data['meta']) ? json_encode($data['meta']) : null,
    ]);
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// PUT - actualizar
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE category_templates SET name=:name, slug=:slug, image=:image, meta=:meta WHERE id=:id');
    $stmt->execute([
        ':id' => $data['id'],
        ':name' => $data['name'] ?? '',
        ':slug' => $data['slug'] ?? '',
        ':image' => $data['image'] ?? '',
        ':meta' => isset($data['meta']) ? json_encode($data['meta']) : null,
    ]);
    echo json_encode(['ok' => true]);
    exit;
}

// DELETE - eliminar
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $stmt = $pdo->prepare('DELETE FROM category_templates WHERE id=:id');
    $stmt->execute([':id' => $id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

