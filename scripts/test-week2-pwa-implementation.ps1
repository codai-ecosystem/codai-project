# 🧪 Week 2 PWA Implementation Testing Script
# Version: 2.0.0 - PWA Foundation Validation

param(
    [switch]$Verbose,
    [switch]$DetailedReport,
    [string]$OutputPath = "WEEK_2_PWA_TESTING_RESULTS.md"
)

# Testing Configuration
$services = @(
    @{ Name = "Admin"; Port = 4007; Path = "apps/admin" },
    @{ Name = "ID"; Port = 4004; Path = "apps/id" },
    @{ Name = "Hub"; Port = 4008; Path = "apps/hub" }
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$testResults = @()
$overallScore = 0
$totalTests = 0

Write-Host "🧪 Week 2 PWA Implementation Testing" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Gray
Write-Host "Testing PWA foundation across all frontend services" -ForegroundColor Yellow
Write-Host "" 

# Test Functions
function Test-ServiceWorkerFiles {
    param($servicePath, $serviceName)
    
    $swPath = "$servicePath/public/sw.js"
    $manifestPath = "$servicePath/public/manifest.json"
    $offlinePath = "$servicePath/public/offline.html"
    
    $results = @{
        ServiceWorker = Test-Path $swPath
        Manifest = Test-Path $manifestPath
        OfflinePage = Test-Path $offlinePath
    }
    
    $passed = ($results.ServiceWorker -and $results.Manifest -and $results.OfflinePage)
    
    if ($passed) {
        Write-Host "✅ $serviceName PWA files present" -ForegroundColor Green
    } else {
        Write-Host "❌ $serviceName missing PWA files" -ForegroundColor Red
        if (-not $results.ServiceWorker) { Write-Host "   Missing: sw.js" -ForegroundColor Red }
        if (-not $results.Manifest) { Write-Host "   Missing: manifest.json" -ForegroundColor Red }
        if (-not $results.OfflinePage) { Write-Host "   Missing: offline.html" -ForegroundColor Red }
    }
    
    return @{
        Passed = $passed
        Details = $results
        Score = if ($passed) { 100 } else { 0 }
    }
}

function Test-LayoutEnhancements {
    param($servicePath, $serviceName)
    
    $layoutPath = "$servicePath/src/app/layout.tsx"
    
    if (-not (Test-Path $layoutPath)) {
        Write-Host "❌ $serviceName layout.tsx not found" -ForegroundColor Red
        return @{ Passed = $false; Score = 0; Details = "Layout file missing" }
    }
    
    $layoutContent = Get-Content $layoutPath -Raw
    
    $checks = @{
        ManifestLink = $layoutContent -match 'rel="manifest"'
        ThemeColor = $layoutContent -match 'name="theme-color"'
        AppleWebApp = $layoutContent -match 'apple-mobile-web-app'
        ServiceWorkerRegistration = $layoutContent -match 'serviceWorker\.register'
        PWAMetadata = $layoutContent -match 'apple-touch-icon'
    }
    
    $passedChecks = ($checks.Values | Where-Object { $_ }).Count
    $totalChecks = $checks.Count
    $score = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
    
    if ($score -ge 80) {
        Write-Host "✅ $serviceName layout PWA enhancements: $score%" -ForegroundColor Green
    } elseif ($score -ge 60) {
        Write-Host "⚠️  $serviceName layout PWA enhancements: $score%" -ForegroundColor Yellow
    } else {
        Write-Host "❌ $serviceName layout PWA enhancements: $score%" -ForegroundColor Red
    }
    
    return @{
        Passed = $score -ge 80
        Score = $score
        Details = $checks
        PassedChecks = $passedChecks
        TotalChecks = $totalChecks
    }
}

function Test-ServiceWorkerContent {
    param($servicePath, $serviceName)
    
    $swPath = "$servicePath/public/sw.js"
    
    if (-not (Test-Path $swPath)) {
        return @{ Passed = $false; Score = 0; Details = "Service worker file missing" }
    }
    
    $swContent = Get-Content $swPath -Raw
    
    $features = @{
        CacheStrategies = $swContent -match 'CACHE_STRATEGIES'
        InstallEvent = $swContent -match 'addEventListener.*install'
        ActivateEvent = $swContent -match 'addEventListener.*activate'
        FetchEvent = $swContent -match 'addEventListener.*fetch'
        BackgroundSync = $swContent -match 'addEventListener.*sync'
        PushNotifications = $swContent -match 'addEventListener.*push'
        CacheManagement = $swContent -match 'caches\.open'
        OfflineHandling = $swContent -match 'offline'
        NetworkFirst = $swContent -match 'NetworkFirst'
        CacheFirst = $swContent -match 'CacheFirst'
    }
    
    $implementedFeatures = ($features.Values | Where-Object { $_ }).Count
    $totalFeatures = $features.Count
    $score = [math]::Round(($implementedFeatures / $totalFeatures) * 100, 1)
    
    if ($score -ge 90) {
        Write-Host "✅ $serviceName service worker features: $score%" -ForegroundColor Green
    } elseif ($score -ge 70) {
        Write-Host "⚠️  $serviceName service worker features: $score%" -ForegroundColor Yellow
    } else {
        Write-Host "❌ $serviceName service worker features: $score%" -ForegroundColor Red
    }
    
    return @{
        Passed = $score -ge 70
        Score = $score
        Details = $features
        ImplementedFeatures = $implementedFeatures
        TotalFeatures = $totalFeatures
    }
}

function Test-ManifestConfiguration {
    param($servicePath, $serviceName)
    
    $manifestPath = "$servicePath/public/manifest.json"
    
    if (-not (Test-Path $manifestPath)) {
        return @{ Passed = $false; Score = 0; Details = "Manifest file missing" }
    }
    
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        
        $requiredFields = @{
            Name = $manifest.name -ne $null
            ShortName = $manifest.short_name -ne $null
            StartUrl = $manifest.start_url -ne $null
            Display = $manifest.display -eq "standalone"
            ThemeColor = $manifest.theme_color -ne $null
            BackgroundColor = $manifest.background_color -ne $null
            Icons = ($manifest.icons -ne $null) -and ($manifest.icons.Count -ge 4)
            Shortcuts = ($manifest.shortcuts -ne $null) -and ($manifest.shortcuts.Count -ge 2)
            FileHandlers = $manifest.file_handlers -ne $null
            ShareTarget = $manifest.share_target -ne $null
        }
        
        $validFields = ($requiredFields.Values | Where-Object { $_ }).Count
        $totalFields = $requiredFields.Count
        $score = [math]::Round(($validFields / $totalFields) * 100, 1)
        
        if ($score -ge 90) {
            Write-Host "✅ $serviceName manifest configuration: $score%" -ForegroundColor Green
        } elseif ($score -ge 70) {
            Write-Host "⚠️  $serviceName manifest configuration: $score%" -ForegroundColor Yellow
        } else {
            Write-Host "❌ $serviceName manifest configuration: $score%" -ForegroundColor Red
        }
        
        return @{
            Passed = $score -ge 70
            Score = $score
            Details = $requiredFields
            ValidFields = $validFields
            TotalFields = $totalFields
        }
    }
    catch {
        Write-Host "❌ $serviceName manifest JSON parse error" -ForegroundColor Red
        return @{ Passed = $false; Score = 0; Details = "JSON parse error: $($_.Exception.Message)" }
    }
}

function Test-OfflinePageFeatures {
    param($servicePath, $serviceName)
    
    $offlinePath = "$servicePath/public/offline.html"
    
    if (-not (Test-Path $offlinePath)) {
        return @{ Passed = $false; Score = 0; Details = "Offline page missing" }
    }
    
    $offlineContent = Get-Content $offlinePath -Raw
    
    $features = @{
        ConnectionStatus = $offlineContent -match 'connection-status'
        RetryFunctionality = $offlineContent -match 'checkConnection'
        ServiceWorkerComm = $offlineContent -match 'serviceWorker\.addEventListener'
        ResponsiveDesign = $offlineContent -match '@media'
        DarkModeSupport = $offlineContent -match 'prefers-color-scheme'
        AutoReload = $offlineContent -match 'window\.location\.reload'
        PeriodicCheck = $offlineContent -match 'setInterval'
        OfflineFeaturesList = $offlineContent -match 'features-available'
    }
    
    $implementedFeatures = ($features.Values | Where-Object { $_ }).Count
    $totalFeatures = $features.Count
    $score = [math]::Round(($implementedFeatures / $totalFeatures) * 100, 1)
    
    if ($score -ge 85) {
        Write-Host "✅ $serviceName offline page features: $score%" -ForegroundColor Green
    } elseif ($score -ge 65) {
        Write-Host "⚠️  $serviceName offline page features: $score%" -ForegroundColor Yellow
    } else {
        Write-Host "❌ $serviceName offline page features: $score%" -ForegroundColor Red
    }
    
    return @{
        Passed = $score -ge 65
        Score = $score
        Details = $features
        ImplementedFeatures = $implementedFeatures
        TotalFeatures = $totalFeatures
    }
}

function Test-ServiceAvailability {
    param($port, $serviceName)
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 5
        $available = $response.StatusCode -eq 200
        
        if ($available) {
            Write-Host "✅ $serviceName service running on port $port" -ForegroundColor Green
        } else {
            Write-Host "❌ $serviceName service not responding on port $port" -ForegroundColor Red
        }
        
        return @{
            Passed = $available
            Score = if ($available) { 100 } else { 0 }
            Details = "Status: $($response.StatusCode)"
        }
    }
    catch {
        Write-Host "❌ $serviceName service unavailable on port $port" -ForegroundColor Red
        return @{
            Passed = $false
            Score = 0
            Details = "Connection failed: $($_.Exception.Message)"
        }
    }
}

# Run PWA Tests
Write-Host "🔍 Testing PWA Implementation..." -ForegroundColor Cyan
Write-Host ""

foreach ($service in $services) {
    Write-Host "Testing $($service.Name) Service..." -ForegroundColor White
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Test service availability
    $availabilityTest = Test-ServiceAvailability -port $service.Port -serviceName $service.Name
    
    # Test PWA files presence
    $filesTest = Test-ServiceWorkerFiles -servicePath $service.Path -serviceName $service.Name
    
    # Test layout enhancements
    $layoutTest = Test-LayoutEnhancements -servicePath $service.Path -serviceName $service.Name
    
    # Test service worker content
    $swTest = Test-ServiceWorkerContent -servicePath $service.Path -serviceName $service.Name
    
    # Test manifest configuration
    $manifestTest = Test-ManifestConfiguration -servicePath $service.Path -serviceName $service.Name
    
    # Test offline page features
    $offlineTest = Test-OfflinePageFeatures -servicePath $service.Path -serviceName $service.Name
    
    # Calculate service score
    $serviceScore = [math]::Round((
        $availabilityTest.Score * 0.15 +
        $filesTest.Score * 0.15 +
        $layoutTest.Score * 0.20 +
        $swTest.Score * 0.25 +
        $manifestTest.Score * 0.15 +
        $offlineTest.Score * 0.10
    ), 1)
    
    $testResults += @{
        Service = $service.Name
        Score = $serviceScore
        Availability = $availabilityTest
        Files = $filesTest
        Layout = $layoutTest
        ServiceWorker = $swTest
        Manifest = $manifestTest
        OfflinePage = $offlineTest
    }
    
    $overallScore += $serviceScore
    $totalTests += 6
    
    Write-Host ""
    if ($serviceScore -ge 90) {
        Write-Host "🎯 $($service.Name) PWA Score: $serviceScore% (A+)" -ForegroundColor Green
    } elseif ($serviceScore -ge 80) {
        Write-Host "🎯 $($service.Name) PWA Score: $serviceScore% (A-)" -ForegroundColor Green
    } elseif ($serviceScore -ge 70) {
        Write-Host "🎯 $($service.Name) PWA Score: $serviceScore% (B+)" -ForegroundColor Yellow
    } elseif ($serviceScore -ge 60) {
        Write-Host "🎯 $($service.Name) PWA Score: $serviceScore% (B-)" -ForegroundColor Yellow
    } else {
        Write-Host "🎯 $($service.Name) PWA Score: $serviceScore% (C)" -ForegroundColor Red
    }
    Write-Host ""
}

# Calculate overall score
$finalScore = [math]::Round($overallScore / $services.Count, 1)

# Display final results
Write-Host "📊 Final PWA Implementation Results" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Gray

$grade = switch ($finalScore) {
    { $_ -ge 95 } { "A+ (Outstanding)" }
    { $_ -ge 90 } { "A (Excellent)" }
    { $_ -ge 85 } { "A- (Very Good)" }
    { $_ -ge 80 } { "B+ (Good)" }
    { $_ -ge 75 } { "B (Satisfactory)" }
    { $_ -ge 70 } { "B- (Acceptable)" }
    { $_ -ge 65 } { "C+ (Below Average)" }
    { $_ -ge 60 } { "C (Poor)" }
    default { "F (Fail)" }
}

Write-Host "🎯 Overall PWA Score: $finalScore% ($grade)" -ForegroundColor $(
    if ($finalScore -ge 85) { "Green" } 
    elseif ($finalScore -ge 70) { "Yellow" } 
    else { "Red" }
)

# Generate detailed report
$reportContent = @"
# 🧪 Week 2 PWA Implementation Testing Results
Generated: $timestamp

## 📊 Overall Results
- **Final Score**: $finalScore% ($grade)
- **Services Tested**: $($services.Count)
- **Tests Executed**: $($totalTests * $services.Count)

## 🎯 Service Scores
"@

foreach ($result in $testResults) {
    $serviceGrade = switch ($result.Score) {
        { $_ -ge 95 } { "A+ (Outstanding)" }
        { $_ -ge 90 } { "A (Excellent)" }
        { $_ -ge 85 } { "A- (Very Good)" }
        { $_ -ge 80 } { "B+ (Good)" }
        { $_ -ge 75 } { "B (Satisfactory)" }
        { $_ -ge 70 } { "B- (Acceptable)" }
        { $_ -ge 65 } { "C+ (Below Average)" }
        { $_ -ge 60 } { "C (Poor)" }
        default { "F (Fail)" }
    }
    
    $reportContent += @"

### $($result.Service) Service: $($result.Score)% ($serviceGrade)
- **Service Availability**: $($result.Availability.Score)% - $($result.Availability.Details)
- **PWA Files**: $($result.Files.Score)% - $(if($result.Files.Passed) { "All files present" } else { "Missing files" })
- **Layout Enhancements**: $($result.Layout.Score)% - $($result.Layout.PassedChecks)/$($result.Layout.TotalChecks) checks passed
- **Service Worker**: $($result.ServiceWorker.Score)% - $($result.ServiceWorker.ImplementedFeatures)/$($result.ServiceWorker.TotalFeatures) features implemented
- **Manifest Config**: $($result.Manifest.Score)% - $($result.Manifest.ValidFields)/$($result.Manifest.TotalFields) fields valid
- **Offline Page**: $($result.OfflinePage.Score)% - $($result.OfflinePage.ImplementedFeatures)/$($result.OfflinePage.TotalFeatures) features implemented
"@
}

$reportContent += @"

## 🔍 Detailed Analysis

### PWA Core Features Status
"@

foreach ($result in $testResults) {
    $reportContent += @"

#### $($result.Service) Service
- **Service Worker Registration**: $(if($result.Layout.Details.ServiceWorkerRegistration) { "✅ Implemented" } else { "❌ Missing" })
- **Web App Manifest**: $(if($result.Files.Details.Manifest) { "✅ Present" } else { "❌ Missing" })
- **Offline Functionality**: $(if($result.Files.Details.OfflinePage) { "✅ Implemented" } else { "❌ Missing" })
- **PWA Metadata**: $(if($result.Layout.Details.PWAMetadata) { "✅ Complete" } else { "❌ Incomplete" })
- **Cache Strategies**: $(if($result.ServiceWorker.Details.CacheStrategies) { "✅ Configured" } else { "❌ Missing" })
- **Background Sync**: $(if($result.ServiceWorker.Details.BackgroundSync) { "✅ Ready" } else { "❌ Not configured" })
- **Push Notifications**: $(if($result.ServiceWorker.Details.PushNotifications) { "✅ Ready" } else { "❌ Not configured" })
"@
}

$reportContent += @"

## 🎊 Implementation Summary

### ✅ Successful Implementations
"@

$successfulFeatures = @()
foreach ($result in $testResults) {
    if ($result.Files.Passed) { $successfulFeatures += "$($result.Service): PWA Files Complete" }
    if ($result.Layout.Score -ge 80) { $successfulFeatures += "$($result.Service): Layout PWA Enhanced" }
    if ($result.ServiceWorker.Score -ge 70) { $successfulFeatures += "$($result.Service): Service Worker Advanced" }
    if ($result.Manifest.Score -ge 70) { $successfulFeatures += "$($result.Service): Manifest Comprehensive" }
    if ($result.OfflinePage.Score -ge 65) { $successfulFeatures += "$($result.Service): Offline Page Featured" }
}

foreach ($feature in $successfulFeatures) {
    $reportContent += "`n- $feature"
}

$reportContent += @"

### 🔧 Areas for Improvement
"@

$improvementAreas = @()
foreach ($result in $testResults) {
    if (-not $result.Availability.Passed) { $improvementAreas += "$($result.Service): Service availability issues" }
    if ($result.Layout.Score -lt 80) { $improvementAreas += "$($result.Service): Layout PWA enhancements needed" }
    if ($result.ServiceWorker.Score -lt 70) { $improvementAreas += "$($result.Service): Service worker features incomplete" }
    if ($result.Manifest.Score -lt 70) { $improvementAreas += "$($result.Service): Manifest configuration gaps" }
    if ($result.OfflinePage.Score -lt 65) { $improvementAreas += "$($result.Service): Offline page functionality limited" }
}

if ($improvementAreas.Count -eq 0) {
    $reportContent += "`n- No significant issues identified! 🎉"
} else {
    foreach ($area in $improvementAreas) {
        $reportContent += "`n- $area"
    }
}

$reportContent += @"

## 🚀 Next Steps

### Phase 2: Advanced Animations
1. **Framer Motion Integration**: Implement advanced page transitions and micro-interactions
2. **Component Animation Library**: Create reusable animation components
3. **Loading States**: Add skeleton screens and progress indicators
4. **Gesture Support**: Implement touch gestures and swipe interactions
5. **Performance Optimization**: Ensure animations are hardware-accelerated

### Phase 3: Component Modernization
1. **Shared UI Updates**: Modernize component library
2. **Design System**: Implement comprehensive design tokens
3. **Accessibility**: Enhance WCAG 2.1 AA compliance
4. **Performance**: Add lazy loading and code splitting
5. **Testing**: Comprehensive animation and interaction testing

## 🎯 Week 2 Status
**PWA Foundation**: $(if($finalScore -ge 85) { "COMPLETE SUCCESS ✅" } elseif($finalScore -ge 70) { "GOOD PROGRESS ⚠️" } else { "NEEDS WORK ❌" })
**Overall Score**: $finalScore% ($grade)
**Ready for Phase 2**: $(if($finalScore -ge 75) { "YES ✅" } else { "NEEDS FIXES ❌" })

---
*Testing completed at $timestamp*
"@

# Save report
$reportContent | Out-File -FilePath $OutputPath -Encoding UTF8
Write-Host ""
Write-Host "📄 Detailed report saved: $OutputPath" -ForegroundColor Cyan

# Final summary
Write-Host ""
Write-Host "🎊 Week 2 PWA Implementation Testing Complete!" -ForegroundColor Green
Write-Host "Final Score: $finalScore% ($grade)" -ForegroundColor $(
    if ($finalScore -ge 85) { "Green" } 
    elseif ($finalScore -ge 70) { "Yellow" } 
    else { "Red" }
)

if ($finalScore -ge 85) {
    Write-Host "🚀 PWA foundation successfully implemented! Ready for Phase 2 animations." -ForegroundColor Green
} elseif ($finalScore -ge 70) {
    Write-Host "⚠️  PWA foundation mostly complete. Minor fixes needed before Phase 2." -ForegroundColor Yellow
} else {
    Write-Host "❌ PWA foundation needs significant work before proceeding to Phase 2." -ForegroundColor Red
}

Write-Host ""
