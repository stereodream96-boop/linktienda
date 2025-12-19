<?php
// api/admin/client_products.php - listar / borrar productos de una tabla por cliente
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
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// auth
if (empty($_SESSION['admin_logged'])) { http_response_code(401); echo json_encode(['error'=>'No autorizado']); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$client_id = isset($_GET['client_id']) ? intval($_GET['client_id']) : 0;
if (!$client_id) { http_response_code(400); echo json_encode(['error'=>'client_id requerido']); exit; }
$table = 'client_products_' . $client_id;

// GET - listar
if ($method === 'GET') {
    try {
        $stmt = $pdo->query('SELECT * FROM `' . $table . '` ORDER BY id DESC');
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Tabla no encontrada o error: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE - borrar producto de tabla cliente
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); exit; }
    try {
        $stmt = $pdo->prepare('DELETE FROM `' . $table . '` WHERE id = :id');
        $stmt->execute([':id' => $id]);
        echo json_encode(['ok' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al borrar: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405); echo json_encode(['error'=>'Method not allowed']);
