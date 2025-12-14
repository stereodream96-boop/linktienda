<?php
// api/db.php
// Archivo de conexión PDO. Preferible usar variables de entorno en producción.

// Intenta obtener credenciales desde variables de entorno, si no existen reemplazar abajo
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'u113059423_LinkTienda';
$DB_USER = getenv('DB_USER') ?: 'u113059423_LinkTienda_Adm';
$DB_PASS = getenv('DB_PASS') ?: 'Panchi@1996';

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
