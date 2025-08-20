# Test CBD Universal Database Service
Write-Host "🧪 Testing CBD Universal Database Service" -ForegroundColor Cyan

# Start the service in background
Write-Host "🚀 Starting CBD Universal Database..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    Set-Location "e:/GitHub/codai-project/packages/cbd"
    npx tsx src/server.ts
}

# Wait for service to start
Start-Sleep -Seconds 5

try {
    # Test health endpoint
    Write-Host "🔍 Testing health endpoint..." -ForegroundColor Green
    $health = Invoke-RestMethod -Uri "http://localhost:4180/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health Response:" -ForegroundColor Green
    $health | ConvertTo-Json -Depth 3

    # Test stats endpoint
    Write-Host "📊 Testing stats endpoint..." -ForegroundColor Green
    $stats = Invoke-RestMethod -Uri "http://localhost:4180/stats" -Method GET -TimeoutSec 10
    Write-Host "✅ Stats Response:" -ForegroundColor Green
    $stats | ConvertTo-Json -Depth 3

    # Test SQL endpoint
    Write-Host "🗄️ Testing SQL endpoint..." -ForegroundColor Green
    $body = @{
        query = "SELECT 1 as test_value, 'Hello World' as message"
    } | ConvertTo-Json

    $sqlResult = Invoke-RestMethod -Uri "http://localhost:4180/sql/query" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ SQL Query Response:" -ForegroundColor Green
    $sqlResult | ConvertTo-Json -Depth 3

    Write-Host "🎉 All tests passed! CBD Universal Database is working!" -ForegroundColor Green

} catch {
    Write-Host "❌ Error testing service: $_" -ForegroundColor Red
} finally {
    # Stop the background job
    Write-Host "🛑 Stopping service..." -ForegroundColor Yellow
    Stop-Job $job -Force
    Remove-Job $job
}

Write-Host "🏁 Test completed" -ForegroundColor Cyan
