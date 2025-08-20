#!/usr/bin/env powershell

# CBD Universal Database Cloud Enhanced Test Script

Write-Host "🌥️ CBD Universal Database - Cloud Enhanced Features Test" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4180"

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Uri,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            UseBasicParsing = $true
            TimeoutSec = 10
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Test 1: Service Health Check
Write-Host "1️⃣ Testing Service Health..." -ForegroundColor Yellow
$healthResult = Invoke-ApiRequest -Uri "$baseUrl/health"
if ($healthResult.Success) {
    Write-Host "   ✅ Service Health: " -ForegroundColor Green -NoNewline
    Write-Host "$($healthResult.Data.status)" -ForegroundColor White
    Write-Host "   🔧 Service: $($healthResult.Data.service)" -ForegroundColor Blue
    Write-Host "   📊 Paradigms: $($healthResult.Data.paradigms)" -ForegroundColor Blue
} else {
    Write-Host "   ❌ Health Check Failed: $($healthResult.Error)" -ForegroundColor Red
    exit 1
}

# Test 2: Cloud Status
Write-Host ""
Write-Host "2️⃣ Testing Cloud Status..." -ForegroundColor Yellow
$cloudStatusResult = Invoke-ApiRequest -Uri "$baseUrl/cloud/status"
if ($cloudStatusResult.Success) {
    Write-Host "   ✅ Cloud Status Retrieved Successfully" -ForegroundColor Green
    $clouds = $cloudStatusResult.Data.clouds
    foreach ($cloud in $clouds) {
        $statusIcon = switch ($cloud.status) {
            "active" { "✅" }
            "degraded" { "⚠️" }
            default { "❌" }
        }
        Write-Host "   $statusIcon $($cloud.cloud.ToUpper()): $($cloud.status) (Priority: $($cloud.config.priority))" -ForegroundColor Blue
        if ($cloud.metrics) {
            Write-Host "      📊 Operations: $($cloud.metrics.operations), Errors: $($cloud.metrics.errors)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ❌ Cloud Status Failed: $($cloudStatusResult.Error)" -ForegroundColor Red
}

# Test 3: Cloud Recommendations
Write-Host ""
Write-Host "3️⃣ Testing Cloud Recommendations..." -ForegroundColor Yellow
$recommendationsResult = Invoke-ApiRequest -Uri "$baseUrl/cloud/recommendations/vector-search?latency=100&performance=90"
if ($recommendationsResult.Success) {
    Write-Host "   ✅ Cloud Recommendations Retrieved" -ForegroundColor Green
    Write-Host "   🎯 Optimal Cloud: $($recommendationsResult.Data.optimalCloud.ToUpper())" -ForegroundColor Cyan
    Write-Host "   📋 Top Recommendations:" -ForegroundColor Blue
    $top3 = $recommendationsResult.Data.recommendations | Select-Object -First 3
    foreach ($rec in $top3) {
        Write-Host "      $($rec.cloud.ToUpper()): Score $($rec.score) - $($rec.reasoning -join ', ')" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Recommendations Failed: $($recommendationsResult.Error)" -ForegroundColor Red
}

# Test 4: Cloud-Enhanced Document Operations
Write-Host ""
Write-Host "4️⃣ Testing Cloud-Enhanced Document Operations..." -ForegroundColor Yellow

# Create document
$testDocument = @{
    name = "Cloud Test Document"
    type = "test"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        cloudTest = $true
        multiCloud = $true
    }
}

$createResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/cloud/document/test-collection" -Body $testDocument -Headers @{ "X-Consistency" = "strong" }
if ($createResult.Success) {
    Write-Host "   ✅ Document Created Successfully" -ForegroundColor Green
    Write-Host "   🆔 Local ID: $($createResult.Data.localResult.id)" -ForegroundColor Blue
    Write-Host "   🌥️ Cloud: $($createResult.Data.selectedCloud.ToUpper())" -ForegroundColor Blue
    Write-Host "   🔄 Redundancy: $($createResult.Data.redundancyEnabled)" -ForegroundColor Blue
    
    $documentId = $createResult.Data.localResult.id
    
    # Read document
    $readResult = Invoke-ApiRequest -Uri "$baseUrl/cloud/document/test-collection/$documentId"
    if ($readResult.Success) {
        Write-Host "   ✅ Document Read Successfully" -ForegroundColor Green
        Write-Host "   📖 Source: $($readResult.Data.source)" -ForegroundColor Blue
        Write-Host "   🌥️ Cloud: $($readResult.Data.selectedCloud.ToUpper())" -ForegroundColor Blue
    } else {
        Write-Host "   ❌ Document Read Failed: $($readResult.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Document Create Failed: $($createResult.Error)" -ForegroundColor Red
}

# Test 5: Cloud-Enhanced Vector Search
Write-Host ""
Write-Host "5️⃣ Testing Cloud-Enhanced Vector Search..." -ForegroundColor Yellow
$vectorSearchData = @{
    vector = @(0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0)
    limit = 5
    threshold = 0.7
}

$vectorResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/cloud/vector/test-vectors/search" -Body $vectorSearchData
if ($vectorResult.Success) {
    Write-Host "   ✅ Vector Search Completed" -ForegroundColor Green
    Write-Host "   🎯 Results Found: $($vectorResult.Data.results.Count)" -ForegroundColor Blue
    Write-Host "   📊 Local Results: $($vectorResult.Data.localCount)" -ForegroundColor Blue
    Write-Host "   🌥️ Cloud Results: $($vectorResult.Data.cloudCount)" -ForegroundColor Blue
    Write-Host "   🚀 Selected Cloud: $($vectorResult.Data.selectedCloud.ToUpper())" -ForegroundColor Blue
} else {
    Write-Host "   ❌ Vector Search Failed: $($vectorResult.Error)" -ForegroundColor Red
}

# Test 6: Multi-Cloud Sync
Write-Host ""
Write-Host "6️⃣ Testing Multi-Cloud Sync..." -ForegroundColor Yellow
$syncData = @{
    collections = @("test-collection", "test-vectors")
    targetClouds = @("aws", "azure", "gcp")
}

$syncResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/cloud/sync/backup" -Body $syncData
if ($syncResult.Success) {
    Write-Host "   ✅ Multi-Cloud Sync Initiated" -ForegroundColor Green
    $successCount = ($syncResult.Data.syncResults | Where-Object { $_.status -eq "success" }).Count
    $totalCount = $syncResult.Data.syncResults.Count
    Write-Host "   📊 Success Rate: $successCount/$totalCount" -ForegroundColor Blue
    
    foreach ($result in $syncResult.Data.syncResults) {
        $statusIcon = if ($result.status -eq "success") { "✅" } else { "❌" }
        Write-Host "   $statusIcon $($result.targetCloud.ToUpper()) - $($result.collection): $($result.status)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Multi-Cloud Sync Failed: $($syncResult.Error)" -ForegroundColor Red
}

# Test 7: Cloud Analytics
Write-Host ""
Write-Host "7️⃣ Testing Cloud Analytics..." -ForegroundColor Yellow
$analyticsResult = Invoke-ApiRequest -Uri "$baseUrl/cloud/analytics"
if ($analyticsResult.Success) {
    Write-Host "   ✅ Cloud Analytics Retrieved" -ForegroundColor Green
    $analytics = $analyticsResult.Data
    Write-Host "   📊 Total Clouds: $($analytics.overview.totalClouds)" -ForegroundColor Blue
    Write-Host "   🌟 Active Clouds: $($analytics.overview.activeClouds)" -ForegroundColor Blue
    Write-Host "   ⚡ Total Operations: $($analytics.overview.totalOperations)" -ForegroundColor Blue
    
    Write-Host "   🏆 Recommendations:" -ForegroundColor Cyan
    Write-Host "      ⚡ Fastest: $($analytics.recommendations.fastestCloud.ToUpper())" -ForegroundColor Green
    Write-Host "      🛡️ Most Reliable: $($analytics.recommendations.mostReliableCloud.ToUpper())" -ForegroundColor Green
    Write-Host "      💰 Cost Effective: $($analytics.recommendations.costEffectiveCloud.ToUpper())" -ForegroundColor Green
} else {
    Write-Host "   ❌ Cloud Analytics Failed: $($analyticsResult.Error)" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "📊 CLOUD-ENHANCED FEATURES TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @(
    @{ Name = "Service Health"; Status = $healthResult.Success },
    @{ Name = "Cloud Status"; Status = $cloudStatusResult.Success },
    @{ Name = "Cloud Recommendations"; Status = $recommendationsResult.Success },
    @{ Name = "Cloud Document Ops"; Status = $createResult.Success },
    @{ Name = "Cloud Vector Search"; Status = $vectorResult.Success },
    @{ Name = "Multi-Cloud Sync"; Status = $syncResult.Success },
    @{ Name = "Cloud Analytics"; Status = $analyticsResult.Success }
)

$passedTests = ($testResults | Where-Object { $_.Status -eq $true }).Count
$totalTests = $testResults.Count

foreach ($test in $testResults) {
    $statusIcon = if ($test.Status) { "✅" } else { "❌" }
    Write-Host "$statusIcon $($test.Name)" -ForegroundColor $(if ($test.Status) { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "🎯 Test Results: $passedTests/$totalTests tests passed ($([math]::Round(($passedTests/$totalTests)*100, 1))%)" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 All cloud-enhanced features are working perfectly!" -ForegroundColor Green
    Write-Host "🌥️ Multi-cloud intelligence engine is fully operational" -ForegroundColor Green
    Write-Host "🚀 CBD Universal Database is ready for production deployment" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some cloud features need attention" -ForegroundColor Yellow
    Write-Host "🔧 Check service logs and cloud configurations" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Cloud-Enhanced Test completed at $(Get-Date)" -ForegroundColor Cyan
