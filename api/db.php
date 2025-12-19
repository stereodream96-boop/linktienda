<?php
// api/db.php
// Archivo de conexión PDO. Preferible usar variables de entorno en producción.

// Cargar credenciales locales si existen (no versionar)
if (file_exists(__DIR__ . '/.env.php')) {
    include __DIR__ . '/.env.php';
}

// Preferir variables específicas de portal si están definidas, luego variables generales, luego valores por defecto
$DB_HOST = isset($DB_HOST_PORTAL) ? $DB_HOST_PORTAL : (getenv('DB_HOST_PORTAL') ?: (getenv('DB_HOST') ?: 'localhost'));
$DB_NAME = isset($DB_NAME_PORTAL) ? $DB_NAME_PORTAL : (getenv('DB_NAME_PORTAL') ?: (getenv('DB_NAME') ?: 'u113059423_LinkTienda'));
$DB_USER = isset($DB_USER_PORTAL) ? $DB_USER_PORTAL : (getenv('DB_USER_PORTAL') ?: (getenv('DB_USER') ?: 'u113059423_LinkTienda_Adm'));
$DB_PASS = isset($DB_PASS_PORTAL) ? $DB_PASS_PORTAL : (getenv('DB_PASS_PORTAL') ?: (getenv('DB_PASS') ?: 'Panchi@1996'));

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'DB connection failed', 'message' => $e->getMessage()]);
    exit;
}

// Uso: incluir este archivo con `require __DIR__ . '/db.php';` y usar $pdo
