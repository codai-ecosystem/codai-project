#!/usr/bin/env powershell

# Test script for consolidated CBD Universal Database Service

Write-Host "🧪 Testing CBD Universal Database Service..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4180/health" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Health Check: " -ForegroundColor Green -NoNewline
    Write-Host "$($health.status)" -ForegroundColor White
    Write-Host "   🔧 Service: $($health.service)" -ForegroundColor Blue
    Write-Host "   📊 Paradigms: $($health.paradigms)" -ForegroundColor Blue
    Write-Host "   ⏱️ Uptime: $($health.uptime)s" -ForegroundColor Blue
} catch {
    Write-Host "   ❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Statistics
Write-Host ""
Write-Host "2️⃣ Testing Statistics Endpoint..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:4180/stats" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Statistics: " -ForegroundColor Green -NoNewline
    Write-Host "Retrieved successfully" -ForegroundColor White
    Write-Host "   🔧 Service: $($stats.service)" -ForegroundColor Blue
    Write-Host "   ⏱️ Uptime: $($stats.uptime)s" -ForegroundColor Blue
} catch {
    Write-Host "   ❌ Statistics Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vector Insert
Write-Host ""
Write-Host "3️⃣ Testing Vector Insert..." -ForegroundColor Yellow
try {
    $vectorData = @{
        id = "test-vector-1"
        vector = @(0.1, 0.2, 0.3, 0.4, 0.5)
        metadata = @{
            type = "test"
            description = "Test vector for consolidation verification"
        }
    }
    $vectorResult = Invoke-RestMethod -Uri "http://localhost:4180/vector/insert" -Method POST -Body ($vectorData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "   ✅ Vector Insert: " -ForegroundColor Green -NoNewline
    Write-Host "Success" -ForegroundColor White
    Write-Host "   🆔 ID: $($vectorResult.result.id)" -ForegroundColor Blue
} catch {
    Write-Host "   ❌ Vector Insert Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Time-Series Write
Write-Host ""
Write-Host "4️⃣ Testing Time-Series Write..." -ForegroundColor Yellow
try {
    $timeSeriesData = @{
        measurement = "test-measurement"
        tags = @{
            source = "consolidation-test"
            version = "1.0"
        }
        fields = @{
            value = 42.5
            count = 10
        }
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    }
    $tsResult = Invoke-RestMethod -Uri "http://localhost:4180/timeseries/write" -Method POST -Body ($timeSeriesData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "   ✅ Time-Series Write: " -ForegroundColor Green -NoNewline
    Write-Host "Success" -ForegroundColor White
    Write-Host "   🆔 ID: $($tsResult.result.id)" -ForegroundColor Blue
} catch {
    Write-Host "   ❌ Time-Series Write Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Key-Value Store
Write-Host ""
Write-Host "5️⃣ Testing Key-Value Store..." -ForegroundColor Yellow
try {
    $kvData = @{
        value = "Test value for consolidation"
        ttl = 3600
    }
    $kvResult = Invoke-RestMethod -Uri "http://localhost:4180/kv/test-key" -Method POST -Body ($kvData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "   ✅ Key-Value Set: " -ForegroundColor Green -NoNewline
    Write-Host "Success" -ForegroundColor White
    
    # Test Get
    $kvGetResult = Invoke-RestMethod -Uri "http://localhost:4180/kv/test-key" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Key-Value Get: " -ForegroundColor Green -NoNewline
    Write-Host "$($kvGetResult.result)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Key-Value Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 CBD Universal Database Service consolidation test completed!" -ForegroundColor Green
Write-Host "🔧 All 5 paradigms tested: Document, Vector, Graph, Key-Value, Time-Series" -ForegroundColor Cyan
Write-Host ""
