# Test API script for PowerShell
param()

$Base = 'https://www.linktienda.com/api'
Write-Host "GET /products"
try {
    $res = Invoke-RestMethod -Uri "$Base/products.php" -Method Get -UseBasicParsing
    $res | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Error "Error calling /products.php: $_"
}

Write-Host "`nPOST /captive.php"
try {
    $body = @{ email = 'test@example.com' } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$Base/captive.php" -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing
    $res | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Error "Error calling /captive.php: $_"
}

Write-Host "`nPOST /auth.php (login) -> maintains session"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $cred = @{ username = 'admin'; password = 'Panchi@1996' } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$Base/auth.php" -Method Post -Body $cred -ContentType 'application/json' -WebSession $session -UseBasicParsing
    $login | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Error "Error logging in: $_"
}

Write-Host "`nGET /auth.php (status) using session"
try {
    $status = Invoke-RestMethod -Uri "$Base/auth.php" -Method Get -WebSession $session -UseBasicParsing
    $status | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Error "Error calling auth status: $_"
}

Write-Host "`nPOST /orders.php"
try {
    $order = @{ customer = @{ name = 'Test'; email = 'test@example.com' }; items = @(@{ product_id = 1; quantity = 1; price = 10.0 }); total = 10.0 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$Base/orders.php" -Method Post -Body $order -ContentType 'application/json' -UseBasicParsing
    $res | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Error "Error creating order: $_"
}

Write-Host "`nGET /admin/products.php (requires session)"
try {
    $adminProducts = Invoke-RestMethod -Uri "$Base/admin/products.php" -Method Get -WebSession $session -UseBasicParsing
    $adminProducts | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Error "Error calling admin products: $_"
}

Write-Host "`nDone. For upload testing, use the bash script or a REST client to send a multipart/form-data request with the session cookie."

Exit 0
