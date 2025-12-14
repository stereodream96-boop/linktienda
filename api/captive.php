<?php
// Simple endpoint para guardar email de portal cautivo
// Base de datos: u113059423_vendimia_lujan
// Usuario: u113059423_forcefenix
// NOTA: Define la contraseña en una variable de entorno o constante.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// Habilitar errores en entorno de prueba (puedes desactivar en producción)
// error_reporting(E_ALL);
// ini_set('display_errors', '1');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  echo json_encode(['ok' => true]);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$email = '';
if (is_array($data) && isset($data['email'])) {
  $email = trim($data['email']);
}
// Fallback: application/x-www-form-urlencoded o multipart/form-data
if (!$email && isset($_POST['email'])) {
  $email = trim($_POST['email']);
}

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Email inválido']);
  exit;
}

// Configuración de DB (ajusta host y password)
// Cargar credenciales desde archivo local si existe (no versionado)
if (file_exists(__DIR__ . '/.env.php')) {
  include __DIR__ . '/.env.php';
}
$db_host = isset($DB_HOST) ? $DB_HOST : (getenv('DB_HOST') ?: 'localhost');
$db_user = isset($DB_USER) ? $DB_USER : (getenv('DB_USER') ?: 'u113059423_forcefenix');
$db_pass = isset($DB_PASS) ? $DB_PASS : (getenv('DB_PASS') ?: '');
$db_name = isset($DB_NAME) ? $DB_NAME : (getenv('DB_NAME') ?: 'u113059423_vendimia_lujan');

$mysqli = @new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'DB connect error']);
  exit;
}