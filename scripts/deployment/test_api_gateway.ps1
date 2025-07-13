# API Gateway Testing Script
Write-Host "🚀 Testing PUBLICAI API Gateway" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test service discovery
Write-Host "`n1. Testing Service Discovery..." -ForegroundColor Yellow
$services = curl -s "http://localhost:4022/api/services" | ConvertFrom-Json
Write-Host "   Gateway Status: $($services.gateway)" -ForegroundColor Cyan
Write-Host "   Total Services: $($services.totalServices)" -ForegroundColor Cyan
Write-Host "   Healthy Services: $($services.healthyServices)" -ForegroundColor Cyan

foreach ($serviceName in $services.services.PSObject.Properties.Name) {
    $service = $services.services.$serviceName
    $statusColor = if ($service.status -eq "healthy") { "Green" } else { "Red" }
    Write-Host "   ✓ $serviceName`: $($service.status) (port $($service.port))" -ForegroundColor $statusColor
}

# Test authentication through gateway
Write-Host "`n2. Testing Authentication through Gateway..." -ForegroundColor Yellow

# Register user
Write-Host "   Registering user..." -ForegroundColor Cyan
$registerResult = curl -s -X POST "http://localhost:4022/api/auth/register" -H "Content-Type: application/json" -d '{"username":"gatewaydemo","email":"demo@gateway.com","password":"demo123"}' | ConvertFrom-Json
if ($registerResult.success) {
    Write-Host "   ✓ User registered: $($registerResult.user.username)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Registration failed" -ForegroundColor Red
}

# Login user
Write-Host "   Logging in user..." -ForegroundColor Cyan
$loginResult = curl -s -X POST "http://localhost:4022/api/auth/login" -H "Content-Type: application/json" -d '{"username":"gatewaydemo","password":"demo123"}' | ConvertFrom-Json
if ($loginResult.success) {
    Write-Host "   ✓ Login successful, token: $($loginResult.token.Substring(0,20))..." -ForegroundColor Green
    $token = $loginResult.token
} else {
    Write-Host "   ✗ Login failed" -ForegroundColor Red
}

# Test gateway health
Write-Host "`n3. Testing Gateway Health..." -ForegroundColor Yellow
$health = curl -s "http://localhost:4022/health" | ConvertFrom-Json
Write-Host "   ✓ Gateway Status: $($health.status)" -ForegroundColor Green
Write-Host "   ✓ Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor Green

# Test API documentation
Write-Host "`n4. Testing API Documentation..." -ForegroundColor Yellow
$api = curl -s "http://localhost:4022/api" | ConvertFrom-Json
Write-Host "   ✓ Service: $($api.service)" -ForegroundColor Green
Write-Host "   ✓ Available Endpoints: $($api.endpoints.Count)" -ForegroundColor Green

Write-Host "`n🎉 API Gateway Test Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
