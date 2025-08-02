#!/usr/bin/env powershell

# Comprehensive CODAI Ecosystem Services Test

Write-Host "🚀 CODAI Ecosystem Services Comprehensive Test" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "CBD Universal Database"; Port = 4180; Path = "/health"; Type = "API" }
    @{ Name = "CODAI Service"; Port = 4001; Path = "/"; Type = "Web" }
    @{ Name = "BancAI Service"; Port = 4005; Path = "/"; Type = "Web" }
    @{ Name = "MemorAI Service"; Port = 4006; Path = "/"; Type = "Web" }
    @{ Name = "Admin Service"; Port = 4007; Path = "/"; Type = "Web" }
    @{ Name = "Hub Service"; Port = 4008; Path = "/"; Type = "Web" }
)

$results = @()

foreach ($service in $services) {
    Write-Host "🔍 Testing $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow
    
    try {
        $url = "http://localhost:$($service.Port)$($service.Path)"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        
        $status = "✅ RUNNING"
        $statusCode = $response.StatusCode
        $responseTime = (Measure-Command { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 }).TotalMilliseconds
        
        Write-Host "   Status: $status" -ForegroundColor Green
        Write-Host "   Status Code: $statusCode" -ForegroundColor Blue
        Write-Host "   Response Time: $([math]::Round($responseTime, 2))ms" -ForegroundColor Blue
        
        if ($service.Type -eq "API" -and $service.Path -eq "/health") {
            $healthData = $response.Content | ConvertFrom-Json
            Write-Host "   Paradigms: $($healthData.paradigms)" -ForegroundColor Blue
            Write-Host "   Uptime: $($healthData.uptime)s" -ForegroundColor Blue
        }
        
        $results += @{
            Service = $service.Name
            Status = "Running"
            Port = $service.Port
            StatusCode = $statusCode
            ResponseTime = [math]::Round($responseTime, 2)
        }
        
    } catch {
        Write-Host "   Status: ❌ ERROR" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        $results += @{
            Service = $service.Name
            Status = "Error"
            Port = $service.Port
            StatusCode = "N/A"
            ResponseTime = "N/A"
        }
    }
    
    Write-Host ""
}

# Test CBD Database API endpoints
Write-Host "🗄️ Testing CBD Database API Endpoints..." -ForegroundColor Cyan
Write-Host ""

$cdbEndpoints = @(
    @{ Name = "Health Check"; Path = "/health" }
    @{ Name = "Statistics"; Path = "/stats" }
    @{ Name = "Document API Info"; Path = "/document" }
    @{ Name = "Vector API Info"; Path = "/vector" }
    @{ Name = "Graph API Info"; Path = "/graph" }
    @{ Name = "Key-Value API Info"; Path = "/kv" }
    @{ Name = "Time-Series API Info"; Path = "/timeseries" }
)

foreach ($endpoint in $cdbEndpoints) {
    Write-Host "🔍 Testing $($endpoint.Name)..." -ForegroundColor Yellow
    
    try {
        $url = "http://localhost:4180$($endpoint.Path)"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Host "   ✅ $($endpoint.Name): Status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ $($endpoint.Name): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

$runningCount = ($results | Where-Object { $_.Status -eq "Running" }).Count
$totalCount = $results.Count

Write-Host "Services Running: $runningCount/$totalCount ($([math]::Round(($runningCount/$totalCount)*100, 1))%)" -ForegroundColor Green
Write-Host ""

# Display results table
Write-Host "Service Status Table:" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Gray
foreach ($result in $results) {
    $statusIcon = if ($result.Status -eq "Running") { "✅" } else { "❌" }
    Write-Host "$statusIcon $($result.Service.PadRight(25)) Port: $($result.Port.ToString().PadRight(5)) Status: $($result.StatusCode.ToString().PadRight(3)) Time: $($result.ResponseTime)ms" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 Ecosystem Status: " -NoNewline -ForegroundColor Cyan
if ($runningCount -eq $totalCount) {
    Write-Host "FULLY OPERATIONAL" -ForegroundColor Green
} elseif ($runningCount -ge ($totalCount * 0.8)) {
    Write-Host "MOSTLY OPERATIONAL" -ForegroundColor Yellow
} else {
    Write-Host "NEEDS ATTENTION" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔄 Next Steps Available:" -ForegroundColor Cyan
Write-Host "- Multi-Cloud Integration Implementation" -ForegroundColor White
Write-Host "- Inter-Service Communication Testing" -ForegroundColor White
Write-Host "- Database Operations Validation" -ForegroundColor White
Write-Host "- Performance Optimization" -ForegroundColor White
Write-Host "- Production Deployment Preparation" -ForegroundColor White

Write-Host ""
Write-Host "✨ Test completed at $(Get-Date)" -ForegroundColor Green
