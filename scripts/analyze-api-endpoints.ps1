#!/usr/bin/env pwsh

# API Endpoint Analysis and Consolidation Tool
param(
    [Parameter()]
    [string]$Mode = "analyze",
    
    [Parameter()]
    [switch]$Detailed = $false
)

Write-Host "🔍 API Endpoint Consolidation Analysis" -ForegroundColor Cyan
Write-Host "Mode: $Mode" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Blue

# Find all route files
$routeFiles = Get-ChildItem -Path "." -Filter "route.ts" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }
$apiFiles = Get-ChildItem -Path "." -Filter "*.ts" -Recurse | Where-Object { 
    $_.FullName -match "api" -and 
    $_.FullName -notmatch "node_modules" -and
    $_.Name -notmatch "test"
}

Write-Host "📊 Discovery Results:" -ForegroundColor Green
Write-Host "  🛣️  Route files found: $($routeFiles.Count)" -ForegroundColor White
Write-Host "  📡 API files found: $($apiFiles.Count)" -ForegroundColor White

# Common endpoint patterns to analyze
$commonEndpoints = @{
    "health" = @()
    "status" = @()
    "auth" = @()
    "user" = @()
    "ai" = @()
    "chat" = @()
    "analytics" = @()
    "test" = @()
    "login" = @()
    "register" = @()
}

# Analyze route patterns
Write-Host "`n🔍 Analyzing API Endpoint Patterns..." -ForegroundColor Cyan

foreach ($file in $routeFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
    $pathParts = $relativePath -split [regex]::Escape('\')
    
    # Extract app name
    $appName = if ($pathParts[0] -eq "apps" -and $pathParts.Count -gt 1) { $pathParts[1] } else { "unknown" }
    
    # Extract API endpoint pattern
    $apiIndex = [array]::IndexOf($pathParts, "api")
    if ($apiIndex -ge 0 -and $apiIndex -lt $pathParts.Count - 1) {
        $endpointPart = $pathParts[$apiIndex + 1]
        
        # Categorize endpoints
        foreach ($pattern in $commonEndpoints.Keys) {
            if ($endpointPart -match $pattern) {
                $commonEndpoints[$pattern] += @{
                    App = $appName
                    Path = $relativePath
                    Endpoint = $endpointPart
                }
                break
            }
        }
    }
}

# Display analysis results
Write-Host "`n📋 Common Endpoint Patterns Analysis:" -ForegroundColor Green

foreach ($pattern in $commonEndpoints.Keys | Sort-Object) {
    $endpoints = $commonEndpoints[$pattern]
    if ($endpoints.Count -gt 0) {
        Write-Host "`n  🎯 $pattern endpoints ($($endpoints.Count) files):" -ForegroundColor Yellow
        
        $appGroups = $endpoints | Group-Object -Property App | Sort-Object Name
        foreach ($appGroup in $appGroups) {
            Write-Host "    📱 $($appGroup.Name): $($appGroup.Count) endpoint(s)" -ForegroundColor White
            if ($Detailed) {
                foreach ($endpoint in $appGroup.Group) {
                    Write-Host "      📄 $($endpoint.Path)" -ForegroundColor Gray
                }
            }
        }
    }
}

# Duplication analysis
Write-Host "`n🔄 Duplication Analysis:" -ForegroundColor Magenta

$duplicatedPatterns = $commonEndpoints.Keys | Where-Object { $commonEndpoints[$_].Count -gt 1 }
$totalDuplicated = 0

foreach ($pattern in $duplicatedPatterns | Sort-Object) {
    $count = $commonEndpoints[$pattern].Count
    $apps = ($commonEndpoints[$pattern] | Select-Object -Property App -Unique).Count
    Write-Host "  ⚠️  $pattern`: $count implementations across $apps apps" -ForegroundColor Red
    $totalDuplicated += $count - 1  # Count duplicates (keep 1 as original)
}

Write-Host "`n📊 Consolidation Opportunity Summary:" -ForegroundColor Cyan
Write-Host "  📈 Total potentially duplicated endpoints: $totalDuplicated" -ForegroundColor White
Write-Host "  🎯 Unique patterns that could be centralized: $($duplicatedPatterns.Count)" -ForegroundColor White
Write-Host "  💾 Potential code reduction: $(if($totalDuplicated -gt 0) {"~$($totalDuplicated * 20)"} else {"0"}) lines" -ForegroundColor White

# Generate consolidation recommendations
if ($Mode -eq "recommend") {
    Write-Host "`n💡 Consolidation Recommendations:" -ForegroundColor Green
    
    Write-Host "`n1. 🏥 Health/Status Endpoints:" -ForegroundColor Yellow
    Write-Host "   • Create @codai/api-utils/health package" -ForegroundColor White
    Write-Host "   • Standardize health check response format" -ForegroundColor White
    Write-Host "   • Implement service discovery integration" -ForegroundColor White
    
    Write-Host "`n2. 🔐 Authentication Endpoints:" -ForegroundColor Yellow  
    Write-Host "   • Create @codai/api-utils/auth package" -ForegroundColor White
    Write-Host "   • Implement JWT token handling" -ForegroundColor White
    Write-Host "   • Standardize user session management" -ForegroundColor White
    
    Write-Host "`n3. 🤖 AI/Chat Endpoints:" -ForegroundColor Yellow
    Write-Host "   • Create @codai/api-utils/ai package" -ForegroundColor White
    Write-Host "   • Standardize AI response formats" -ForegroundColor White
    Write-Host "   • Implement common streaming patterns" -ForegroundColor White
    
    Write-Host "`n4. 👤 User Endpoints:" -ForegroundColor Yellow
    Write-Host "   • Create @codai/api-utils/user package" -ForegroundColor White
    Write-Host "   • Standardize user data schemas" -ForegroundColor White
    Write-Host "   • Implement CRUD operations" -ForegroundColor White
    
    Write-Host "`n5. 📊 Analytics Endpoints:" -ForegroundColor Yellow
    Write-Host "   • Create @codai/api-utils/analytics package" -ForegroundColor White
    Write-Host "   • Standardize metrics collection" -ForegroundColor White
    Write-Host "   • Implement event tracking patterns" -ForegroundColor White
}

# Generate detailed file analysis if requested
if ($Detailed -and $Mode -eq "analyze") {
    Write-Host "`n📋 Detailed File Analysis:" -ForegroundColor Cyan
    
    # Sample a few files for content analysis
    $sampleFiles = $routeFiles | Select-Object -First 10
    
    foreach ($file in $sampleFiles) {
        Write-Host "`n📄 File: $($file.Name)" -ForegroundColor White
        Write-Host "   Path: $($file.FullName.Replace((Get-Location).Path, '').TrimStart('\'))" -ForegroundColor Gray
        
        try {
            $content = Get-Content $file.FullName -Raw
            $lines = ($content -split "`n").Count
            Write-Host "   Lines: $lines" -ForegroundColor Gray
            
            # Check for common patterns
            if ($content -match "export.*GET|POST|PUT|DELETE") {
                Write-Host "   ✅ Has HTTP methods" -ForegroundColor Green
            }
            if ($content -match "Response\.json|NextResponse") {
                Write-Host "   ✅ Uses standard response" -ForegroundColor Green  
            }
            if ($content -match "try.*catch") {
                Write-Host "   ✅ Has error handling" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "   ❌ Error reading file: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n✨ Analysis complete! Next steps:" -ForegroundColor Green
Write-Host "  1. Run with -Mode recommend for consolidation suggestions" -ForegroundColor White
Write-Host "  2. Run with -Detailed for file content analysis" -ForegroundColor White
Write-Host "  3. Create @codai/api-utils package for shared utilities" -ForegroundColor White