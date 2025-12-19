#!/usr/bin/env bash
# Script de pruebas para endpoints API (ajusta URL base si corresponde)
BASE="https://www.linktienda.com/api"

echo "GET /products"
curl -s "$BASE/products.php" | jq '.'

echo "\nPOST /captive.php"
curl -s -X POST "$BASE/captive.php" -H "Content-Type: application/json" -d '{"email":"test@example.com"}' | jq '.'

echo "\nPOST /auth.php (login) -> guarda cookie en cookie.txt"
curl -s -c cookie.txt -X POST "$BASE/auth.php" -H "Content-Type: application/json" -d '{"username":"admin","password":"Panchi@1996"}' | jq '.'

echo "\nGET /auth.php (status) using cookie"
curl -s -b cookie.txt "$BASE/auth.php" | jq '.'

# Orders (ejemplo)
echo "\nPOST /orders.php"
curl -s -X POST "$BASE/orders.php" -H "Content-Type: application/json" -d '{"customer":{"name":"Test","email":"test@example.com"},"items":[{"product_id":1,"quantity":1,"price":10.0}],"total":10.0}' | jq '.'

# Admin products (requiere cookie de auth guardada)
echo "\nGET /admin/products.php (requiere sesión)"
curl -s -b cookie.txt "$BASE/admin/products.php" | jq '.'

# Upload (ejemplo - requiere sesión y archivo)
echo "\nPOST /upload.php (requiere sesión)"
# curl -s -b cookie.txt -F "image=@/path/to/file.jpg" "$BASE/upload.php" | jq '.'

echo "\nNota: descomenta y ajusta la ruta del archivo para probar /upload.php"

exit 0
