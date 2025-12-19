<?php
// Simple endpoint para guardar email de portal cautivo
// Base de datos: u113059423_vendimia_lujan
// Usuario: u113059423_forcefenix
// NOTA: Define la contraseña en una variable de entorno o constante.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// Habilitar errores en entorno de prueba (puedes desactivar en producción).
// Activar pasando ?debug=1 o definiendo la variable de entorno APP_DEBUG=1.
if (((isset($_GET['debug']) && $_GET['debug'] === '1') || getenv('APP_DEBUG') === '1')) {
  error_reporting(E_ALL);
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  ini_set('log_errors', '1');
  ini_set('error_log', __DIR__ . '/captive_errors.log');
  $debug = true;
} else {
  $debug = false;
}

// Helper para logging de depuración (solo cuando $debug = true)
function captive_debug_log($msg) {
  $logFile = __DIR__ . '/captive_debug.log';
  $line = date('Y-m-d H:i:s') . "\t" . $msg . PHP_EOL;
  @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

if ($debug) {
  captive_debug_log('START');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  echo json_encode(['ok' => true]);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if ($debug) {
  captive_debug_log('raw_input: ' . substr($raw, 0, 1000));
  if (json_last_error() !== JSON_ERROR_NONE) {
    captive_debug_log('json_decode_error: ' . json_last_error_msg());
  }
}
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
  if ($debug) captive_debug_log('invalid_email: ' . $email);
  exit;
}

// Configuración de DB (ajusta host y password)
// Cargar credenciales desde archivo local si existe (no versionado)
if (file_exists(__DIR__ . '/.env.php')) {
  include __DIR__ . '/.env.php';
  if ($debug) captive_debug_log('.env.php included');
} else {
  if ($debug) captive_debug_log('.env.php not found');
}
$db_host = isset($DB_HOST_PORTAL) ? $DB_HOST_PORTAL : (getenv('DB_HOST_PORTAL') ?: 'localhost');
$db_user = isset($DB_USER_PORTAL) ? $DB_USER_PORTAL : (getenv('DB_USER_PORTAL') ?: 'u113059423_forcefenix');
$db_pass = isset($DB_PASS_PORTAL) ? $DB_PASS_PORTAL : (getenv('DB_PASS_PORTAL') ?: '');
$db_name = isset($DB_NAME_PORTAL) ? $DB_NAME_PORTAL : (getenv('DB_NAME_PORTAL') ?: 'u113059423_vendimia_lujan');
if ($debug) {
  // No loguear contraseñas
  captive_debug_log("DB params -> host={$db_host}, user={$db_user}, db={$db_name}");
}

$mysqli = @new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
  if ($debug) captive_debug_log('mysqli_connect_error: ' . $mysqli->connect_error);
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'DB connect error']);
  exit;
} else {
  if ($debug) captive_debug_log('mysqli connected successfully');
}

// Intentar guardar en tabla `portal_emails` si existe, si no, registrar en archivo
$saved = false;
$errorMsg = null;
// Intentar crear tabla si no existe (operación segura)
$create_sql = "CREATE TABLE IF NOT EXISTS `captive_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
if ($debug) captive_debug_log('Ensuring portal_emails table exists');
if (!$mysqli->query($create_sql)) {
  if ($debug) captive_debug_log('create_table_error: ' . $mysqli->error);
  // no hacemos exit; intentaremos fallback a archivo más abajo
}

// Comprobar existencia de tabla y columnas; si existe sin columnas nuevas, intentar alter
$res = $mysqli->query("SHOW TABLES LIKE 'captive_emails'");
if ($res && $res->num_rows > 0) {
  // Asegurar columnas `ip` y `user_agent` si la tabla ya existía
  $col = $mysqli->query("SHOW COLUMNS FROM captive_emails LIKE 'ip'");
  if ($col && $col->num_rows === 0) {
    if ($debug) captive_debug_log('Adding column ip');
    if (!$mysqli->query("ALTER TABLE captive_emails ADD COLUMN `ip` VARCHAR(45) DEFAULT NULL")) {
      if ($debug) captive_debug_log('alter_add_ip_error: ' . $mysqli->error);
    }
  }
  $col2 = $mysqli->query("SHOW COLUMNS FROM captive_emails LIKE 'user_agent'");
  if ($col2 && $col2->num_rows === 0) {
    if ($debug) captive_debug_log('Adding column user_agent');
    if (!$mysqli->query("ALTER TABLE captive_emails ADD COLUMN `user_agent` TEXT DEFAULT NULL")) {
      if ($debug) captive_debug_log('alter_add_user_agent_error: ' . $mysqli->error);
    }
  }

  $stmt = $mysqli->prepare("INSERT INTO captive_emails (email, ip, user_agent, created_at) VALUES (?, ?, ?, NOW())");
  if ($stmt) {
    // Obtener IP y user agent del cliente
    $ip = null;
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
      $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
      $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
      $ip = trim($ips[0]);
    } else {
      $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    }
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $stmt->bind_param('sss', $email, $ip, $userAgent);
    if ($stmt->execute()) {
      $saved = true;
    } else {
      $errorMsg = $stmt->error;
      if ($debug) captive_debug_log('insert_error: ' . $errorMsg);
    }
    $stmt->close();
  } else {
    $errorMsg = $mysqli->error;
    if ($debug) captive_debug_log('prepare_error: ' . $errorMsg);
  }
}
// Si no se guardó en DB, fallback a archivo incluyendo ip y user_agent
if (!$saved) {
  // Tabla no existe o insert falló — guardar en archivo como fallback
  $ip = $_SERVER['HTTP_CLIENT_IP'] ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? ''));
  if (is_array($ip)) $ip = implode(',', $ip);
  $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
  $userAgentShort = substr($userAgent, 0, 1000);
  $logLine = date('Y-m-d H:i:s') . "\t" . $email . "\t" . $ip . "\t" . $userAgentShort . "\n";
  $logFile = __DIR__ . '/captive_submissions.log';
  if (@file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX) !== false) {
    $saved = true;
    if ($debug) captive_debug_log('saved_to_file');
  } else {
    $errorMsg = $errorMsg ?: 'Could not write to log file';
    if ($debug) captive_debug_log('file_write_error: ' . $errorMsg);
  }
}

$mysqli->close();

if ($saved) {
  echo json_encode(['ok' => true]);
  exit;
} else {
  http_response_code(500);
  // Si está activo debug, incluir mensaje de error; si no, mensaje genérico
  if (((isset($_GET['debug']) && $_GET['debug'] === '1') || getenv('APP_DEBUG') === '1')) {
    echo json_encode(['ok' => false, 'error' => 'save_failed', 'message' => $errorMsg]);
  } else {
    echo json_encode(['ok' => false, 'error' => 'Internal error']);
  }
  exit;
}