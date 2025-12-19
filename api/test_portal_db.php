<?php
header('Content-Type: application/json; charset=utf-8');
// Script de prueba para verificar la conexión usando las variables _PORTAL
// No debe quedarse en producción.

$debug = isset($_GET['debug']) && $_GET['debug'] === '1';

if (file_exists(__DIR__ . '/.env.php')) {
  include __DIR__ . '/.env.php';
}

$db_host = isset($DB_HOST_PORTAL) ? $DB_HOST_PORTAL : (getenv('DB_HOST_PORTAL') ?: 'localhost');
$db_user = isset($DB_USER_PORTAL) ? $DB_USER_PORTAL : (getenv('DB_USER_PORTAL') ?: '');
$db_pass = isset($DB_PASS_PORTAL) ? $DB_PASS_PORTAL : (getenv('DB_PASS_PORTAL') ?: '');
$db_name = isset($DB_NAME_PORTAL) ? $DB_NAME_PORTAL : (getenv('DB_NAME_PORTAL') ?: '');

$out = ['ok' => false, 'checked' => date('c'), 'host' => $db_host, 'user' => $db_user, 'db' => $db_name];

$mysqli = @new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
  $out['error'] = 'connect_error';
  $out['message'] = $mysqli->connect_error;
  echo json_encode($out);
  exit;
}

$out['ok'] = true;
$res = $mysqli->query("SHOW TABLES LIKE 'portal_emails'");
$out['portal_emails_table'] = ($res && $res->num_rows > 0) ? true : false;
$mysqli->close();

echo json_encode($out);

?>
