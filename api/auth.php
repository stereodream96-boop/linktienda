<?php
// api/auth.php - Autenticación simple con sesiones
session_start();
header('Content-Type: application/json; charset=utf-8');
// CORS dinámico: permite www y sin www, http y https
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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Credenciales de admin (en producción usar DB con hash)
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'Panchi@1996'); // Cambiar por una clave fuerte

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = $data['username'] ?? '';
    $pass = $data['password'] ?? '';

    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        $_SESSION['admin_logged'] = true;
        $_SESSION['admin_user'] = $user;
        echo json_encode(['ok' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Verificar sesión
    if (!empty($_SESSION['admin_logged'])) {
        echo json_encode(['ok' => true, 'user' => $_SESSION['admin_user']]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Logout
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
