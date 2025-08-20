# CBD Universal Database Phase 3 - Simple Test
Write-Host "Testing CBD Universal Database Phase 3" -ForegroundColor Green

$baseUrl = "http://localhost:4180"

try {
    Write-Host "Testing Health Check..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    Write-Host "Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "Status: $($health.status)" -ForegroundColor Gray
    Write-Host "Paradigms: $($health.paradigms -join ', ')" -ForegroundColor Gray
    
    Write-Host "`nTesting Document Insert..." -ForegroundColor Yellow
    $doc = @{
        document = @{
            name = "Test User"
            age = 25
            email = "test@example.com"
        }
    }
    $docResult = Invoke-RestMethod -Uri "$baseUrl/document/test" -Method POST -Body ($doc | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "Document Insert: SUCCESS" -ForegroundColor Green
    Write-Host "Inserted ID: $($docResult.insertedId)" -ForegroundColor Gray
    
    Write-Host "`nTesting Vector Store..." -ForegroundColor Yellow
    $vector = @{
        id = "test1"
        vector = @(1.0, 2.0, 3.0)
        metadata = @{ type = "test" }
    }
    $vectorResult = Invoke-RestMethod -Uri "$baseUrl/vector/store" -Method POST -Body ($vector | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "Vector Store: SUCCESS" -ForegroundColor Green
    Write-Host "Vector ID: $($vectorResult.id)" -ForegroundColor Gray
    
    Write-Host "`nTesting Key-Value Set..." -ForegroundColor Yellow
    $kv = @{
        key = "test_key"
        value = "test_value"
    }
    $kvResult = Invoke-RestMethod -Uri "$baseUrl/kv/set" -Method POST -Body ($kv | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "Key-Value Set: SUCCESS" -ForegroundColor Green
    
    Write-Host "`nAll tests passed! CBD Universal Database is working correctly." -ForegroundColor Green
}
catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
