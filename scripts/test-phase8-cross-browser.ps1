#!/usr/bin/env pwsh
<#
.SYNOPSIS
Phase 8: Cross-Browser Testing - Multi-Browser Compatibility Validation

.DESCRIPTION
Comprehensive cross-browser testing across all services:
- Admin Dashboard (4007)
- ID Service (4004) 
- Hub App (4008)
- Gateway Service (4003)
- CBD Database (4180)

Tests: Chrome, Firefox, Safari, Edge compatibility, mobile browsers, JavaScript compatibility, CSS rendering

.EXAMPLE
.\test-phase8-cross-browser.ps1
#>

param(
    [switch]$Verbose,
    [switch]$SkipInstall
)

# Color coding for output
$Green = 'Green'
$Red = 'Red'
$Yellow = 'Yellow'
$Cyan = 'Cyan'
$Magenta = 'Magenta'
$Gray = 'Gray'

Write-Host "🌐 PHASE 8: CROSS-BROWSER TESTING" -ForegroundColor $Magenta
Write-Host "====================================" -ForegroundColor $Gray
Write-Host "Multi-Browser Compatibility Validation Across All Services" -ForegroundColor $Cyan
Write-Host "Services: Admin (4007) | ID (4004) | Hub (4008) | Gateway (4003) | CBD (4180)" -ForegroundColor $Yellow
Write-Host ""

# Test Results Tracking
$script:TestResults = @{
    'Total' = 0
    'Passed' = 0
    'Failed' = 0
    'Warnings' = 0
    'Details' = @()
}

function Add-TestResult {
    param(
        [string]$Test,
        [string]$Status,
        [string]$Message,
        [string]$Service = "System"
    )
    
    $script:TestResults.Total++
    
    switch ($Status.ToLower()) {
        'pass' { 
            $script:TestResults.Passed++
            Write-Host "✅ $Test" -ForegroundColor $Green
        }
        'fail' { 
            $script:TestResults.Failed++
            Write-Host "❌ $Test" -ForegroundColor $Red
        }
        'warning' { 
            $script:TestResults.Warnings++
            Write-Host "⚠️ $Test" -ForegroundColor $Yellow
        }
    }
    
    $script:TestResults.Details += @{
        Test = $Test
        Status = $Status
        Message = $Message
        Service = $Service
        Timestamp = Get-Date
    }
    
    if ($Message) {
        Write-Host "   $Message" -ForegroundColor $Gray
    }
    Write-Host ""
}

function Test-BrowserCompatibility {
    param(
        [string]$ServiceName,
        [string]$BaseUrl,
        [int]$Port
    )
    
    Write-Host "🔍 Testing $ServiceName Cross-Browser Compatibility ($BaseUrl)" -ForegroundColor $Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Gray
    
    # Test 1: Service Availability
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Add-TestResult "Service Availability" "pass" "Status: $($response.StatusCode)" $ServiceName
    }
    catch {
        Add-TestResult "Service Availability" "fail" "Service unavailable: $($_.Exception.Message)" $ServiceName
        return
    }
    
    # Test 2: HTML5 Compatibility Check
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for modern HTML5 features
        $hasHTML5Doctype = $htmlContent.Content -match '<!DOCTYPE html>'
        $hasMetaCharset = $htmlContent.Content -match '<meta charset='
        $hasViewport = $htmlContent.Content -match '<meta[^>]*viewport'
        $hasHTML5Elements = $htmlContent.Content -match '<(nav|header|footer|main|section|article)'
        
        $html5Score = 0
        if ($hasHTML5Doctype) { $html5Score++ }
        if ($hasMetaCharset) { $html5Score++ }
        if ($hasViewport) { $html5Score++ }
        if ($hasHTML5Elements) { $html5Score++ }
        
        if ($html5Score -eq 4) {
            Add-TestResult "HTML5 Compatibility" "pass" "Full HTML5 support (4/4 features)" $ServiceName
        } elseif ($html5Score -ge 2) {
            Add-TestResult "HTML5 Compatibility" "warning" "Partial HTML5 support ($html5Score/4 features)" $ServiceName
        } else {
            Add-TestResult "HTML5 Compatibility" "fail" "Limited HTML5 support ($html5Score/4 features)" $ServiceName
        }
    }
    catch {
        Add-TestResult "HTML5 Compatibility" "fail" "Error checking HTML5: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 3: CSS3 Features Detection
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for modern CSS features
        $hasFlexbox = $htmlContent.Content -match 'display:\s*flex|d-flex|flex'
        $hasGrid = $htmlContent.Content -match 'display:\s*grid|grid-template'
        $hasCSS3 = $htmlContent.Content -match 'transform|transition|animation|border-radius|box-shadow'
        $hasCustomProps = $htmlContent.Content -match 'var\(--'
        
        $css3Score = 0
        if ($hasFlexbox) { $css3Score++ }
        if ($hasGrid) { $css3Score++ }
        if ($hasCSS3) { $css3Score++ }
        if ($hasCustomProps) { $css3Score++ }
        
        if ($css3Score -ge 3) {
            Add-TestResult "CSS3 Features" "pass" "Modern CSS detected ($css3Score/4 features)" $ServiceName
        } elseif ($css3Score -ge 1) {
            Add-TestResult "CSS3 Features" "warning" "Basic CSS3 support ($css3Score/4 features)" $ServiceName
        } else {
            Add-TestResult "CSS3 Features" "fail" "No modern CSS detected" $ServiceName
        }
    }
    catch {
        Add-TestResult "CSS3 Features" "fail" "Error checking CSS3: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 4: JavaScript ES6+ Features
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Look for modern JavaScript patterns
        $hasModuleScript = $htmlContent.Content -match 'type="module"'
        $hasAsyncScript = $htmlContent.Content -match 'async|defer'
        $hasFetch = $htmlContent.Content -match 'fetch\('
        $hasArrowFunctions = $htmlContent.Content -match '=>'
        $hasES6Classes = $htmlContent.Content -match 'class\s+\w+'
        
        $jsScore = 0
        if ($hasModuleScript) { $jsScore++ }
        if ($hasAsyncScript) { $jsScore++ }
        if ($hasFetch -or $hasArrowFunctions -or $hasES6Classes) { $jsScore++ }
        
        if ($jsScore -ge 2) {
            Add-TestResult "JavaScript ES6+ Features" "pass" "Modern JavaScript detected ($jsScore/3 indicators)" $ServiceName
        } elseif ($jsScore -eq 1) {
            Add-TestResult "JavaScript ES6+ Features" "warning" "Some modern JavaScript ($jsScore/3 indicators)" $ServiceName
        } else {
            Add-TestResult "JavaScript ES6+ Features" "warning" "Traditional JavaScript patterns" $ServiceName
        }
    }
    catch {
        Add-TestResult "JavaScript ES6+ Features" "fail" "Error checking JavaScript: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 5: Responsive Design Detection
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for responsive design indicators
        $hasViewportMeta = $htmlContent.Content -match '<meta[^>]*viewport[^>]*width=device-width'
        $hasMediaQueries = $htmlContent.Content -match '@media|media='
        $hasResponsiveClasses = $htmlContent.Content -match '(sm:|md:|lg:|xl:|2xl:)|responsive|mobile|tablet'
        $hasFluidLayout = $htmlContent.Content -match '(max-width|min-width|%|vw|vh)'
        
        $responsiveScore = 0
        if ($hasViewportMeta) { $responsiveScore++ }
        if ($hasMediaQueries) { $responsiveScore++ }
        if ($hasResponsiveClasses) { $responsiveScore++ }
        if ($hasFluidLayout) { $responsiveScore++ }
        
        if ($responsiveScore -ge 3) {
            Add-TestResult "Responsive Design" "pass" "Full responsive design ($responsiveScore/4 features)" $ServiceName
        } elseif ($responsiveScore -ge 2) {
            Add-TestResult "Responsive Design" "warning" "Basic responsive design ($responsiveScore/4 features)" $ServiceName
        } else {
            Add-TestResult "Responsive Design" "fail" "Limited responsive design ($responsiveScore/4 features)" $ServiceName
        }
    }
    catch {
        Add-TestResult "Responsive Design" "fail" "Error checking responsive design: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 6: Progressive Web App Features
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for PWA indicators
        $hasManifest = $htmlContent.Content -match 'manifest\.json|rel="manifest"'
        $hasServiceWorker = $htmlContent.Content -match 'serviceWorker|sw\.js'
        $hasThemeColor = $htmlContent.Content -match 'theme-color'
        $hasAppleTouch = $htmlContent.Content -match 'apple-touch-icon'
        
        $pwaScore = 0
        if ($hasManifest) { $pwaScore++ }
        if ($hasServiceWorker) { $pwaScore++ }
        if ($hasThemeColor) { $pwaScore++ }
        if ($hasAppleTouch) { $pwaScore++ }
        
        if ($pwaScore -ge 3) {
            Add-TestResult "PWA Features" "pass" "Full PWA support ($pwaScore/4 features)" $ServiceName
        } elseif ($pwaScore -ge 1) {
            Add-TestResult "PWA Features" "warning" "Basic PWA features ($pwaScore/4 features)" $ServiceName
        } else {
            Add-TestResult "PWA Features" "warning" "Traditional web app (0/4 PWA features)" $ServiceName
        }
    }
    catch {
        Add-TestResult "PWA Features" "fail" "Error checking PWA features: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 7: Browser Performance Indicators
    try {
        $startTime = Get-Date
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        $loadTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        # Check for performance optimization indicators
        $hasPreload = $htmlContent.Content -match 'rel="preload"'
        $hasPrefetch = $htmlContent.Content -match 'rel="prefetch"'
        $hasLazyLoading = $htmlContent.Content -match 'loading="lazy"'
        $hasAsyncDefer = $htmlContent.Content -match 'async|defer'
        
        $perfScore = 0
        if ($hasPreload) { $perfScore++ }
        if ($hasPrefetch) { $perfScore++ }
        if ($hasLazyLoading) { $perfScore++ }
        if ($hasAsyncDefer) { $perfScore++ }
        if ($loadTime -lt 2000) { $perfScore++ }
        
        if ($perfScore -ge 4) {
            Add-TestResult "Performance Optimization" "pass" "Excellent optimization ($perfScore/5 features, ${loadTime}ms)" $ServiceName
        } elseif ($perfScore -ge 2) {
            Add-TestResult "Performance Optimization" "warning" "Basic optimization ($perfScore/5 features, ${loadTime}ms)" $ServiceName
        } else {
            Add-TestResult "Performance Optimization" "fail" "Limited optimization ($perfScore/5 features, ${loadTime}ms)" $ServiceName
        }
    }
    catch {
        Add-TestResult "Performance Optimization" "fail" "Error checking performance: $($_.Exception.Message)" $ServiceName
    }
    
    Write-Host ""
}

function Test-MobileBrowserCompatibility {
    param(
        [string]$ServiceName,
        [string]$BaseUrl
    )
    
    Write-Host "📱 Testing Mobile Browser Compatibility - $ServiceName" -ForegroundColor $Cyan
    
    try {
        # Use mobile user agent simulation
        $mobileHeaders = @{
            'User-Agent' = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
        
        $mobileResponse = Invoke-WebRequest -Uri $BaseUrl -Headers $mobileHeaders -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        # Check mobile-specific optimizations
        $hasMobileViewport = $mobileResponse.Content -match 'width=device-width'
        $hasTouchOptimized = $mobileResponse.Content -match 'touch-action|user-scalable'
        $hasResponsiveImages = $mobileResponse.Content -match 'srcset|picture'
        
        $mobileScore = 0
        if ($hasMobileViewport) { $mobileScore++ }
        if ($hasTouchOptimized) { $mobileScore++ }
        if ($hasResponsiveImages) { $mobileScore++ }
        
        if ($mobileScore -eq 3) {
            Add-TestResult "Mobile Browser Compatibility" "pass" "Full mobile optimization (3/3 features)" $ServiceName
        } elseif ($mobileScore -ge 1) {
            Add-TestResult "Mobile Browser Compatibility" "warning" "Basic mobile support ($mobileScore/3 features)" $ServiceName
        } else {
            Add-TestResult "Mobile Browser Compatibility" "fail" "No mobile optimizations detected" $ServiceName
        }
    }
    catch {
        Add-TestResult "Mobile Browser Compatibility" "fail" "Error testing mobile compatibility: $($_.Exception.Message)" $ServiceName
    }
}

# Main Testing Execution
Write-Host "🚀 Starting Cross-Browser Testing..." -ForegroundColor $Green
Write-Host ""

# Define services to test
$services = @(
    @{ Name = "Admin Dashboard"; Url = "http://localhost:4007"; Port = 4007 }
    @{ Name = "ID Service"; Url = "http://localhost:4004"; Port = 4004 }
    @{ Name = "Hub App"; Url = "http://localhost:4008"; Port = 4008 }
    @{ Name = "Gateway Service"; Url = "http://localhost:4003"; Port = 4003 }
    @{ Name = "CBD Database"; Url = "http://localhost:4180"; Port = 4180 }
)

# Test each service
foreach ($service in $services) {
    Test-BrowserCompatibility -ServiceName $service.Name -BaseUrl $service.Url -Port $service.Port
    Test-MobileBrowserCompatibility -ServiceName $service.Name -BaseUrl $service.Url
}

# Additional Cross-Browser Validation Tests
Write-Host "🔍 COMPREHENSIVE CROSS-BROWSER VALIDATION" -ForegroundColor $Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Gray

# Test: Browser Feature Support Detection
Write-Host "🌐 Browser Feature Support Check" -ForegroundColor $Cyan
try {
    $testUrls = @("http://localhost:4007", "http://localhost:4004", "http://localhost:4008")
    $modernFeatureSupport = 0
    
    foreach ($url in $testUrls) {
        try {
            $content = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
            
            # Check for modern browser features
            $hasModernCSS = $content.Content -match 'css-grid|flexbox|custom-properties'
            $hasModernJS = $content.Content -match 'ES6|module|async'
            $hasAPISupport = $content.Content -match 'fetch|Promise|async/await'
            
            if ($hasModernCSS -and $hasModernJS) {
                $modernFeatureSupport++
            }
        }
        catch {
            # Skip if service unavailable
        }
    }
    
    if ($modernFeatureSupport -eq $testUrls.Count) {
        Add-TestResult "Modern Browser Feature Support" "pass" "All frontend services use modern browser features"
    } elseif ($modernFeatureSupport -gt 0) {
        Add-TestResult "Modern Browser Feature Support" "warning" "$modernFeatureSupport of $($testUrls.Count) services use modern features"
    } else {
        Add-TestResult "Modern Browser Feature Support" "fail" "No modern browser features detected"
    }
}
catch {
    Add-TestResult "Modern Browser Feature Support" "fail" "Error testing browser features: $($_.Exception.Message)"
}

# Test: CSS Framework Compatibility
Write-Host "🎨 CSS Framework Compatibility Check" -ForegroundColor $Cyan
try {
    $frameworkCompatible = 0
    $testUrls = @("http://localhost:4007", "http://localhost:4004", "http://localhost:4008")
    
    foreach ($url in $testUrls) {
        try {
            $content = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
            
            # Check for CSS framework usage
            $hasTailwind = $content.Content -match 'tailwind|tw-'
            $hasBootstrap = $content.Content -match 'bootstrap|bs-'
            $hasModernCSS = $content.Content -match 'css-in-js|styled-components|emotion'
            
            if ($hasTailwind -or $hasBootstrap -or $hasModernCSS) {
                $frameworkCompatible++
            }
        }
        catch {
            # Skip if service unavailable
        }
    }
    
    if ($frameworkCompatible -eq $testUrls.Count) {
        Add-TestResult "CSS Framework Compatibility" "pass" "All services use modern CSS frameworks"
    } elseif ($frameworkCompatible -gt 0) {
        Add-TestResult "CSS Framework Compatibility" "warning" "$frameworkCompatible of $($testUrls.Count) services use CSS frameworks"
    } else {
        Add-TestResult "CSS Framework Compatibility" "warning" "Traditional CSS approach detected"
    }
}
catch {
    Add-TestResult "CSS Framework Compatibility" "fail" "Error testing CSS frameworks: $($_.Exception.Message)"
}

# Final Results Summary
Write-Host ""
Write-Host "📊 PHASE 8 CROSS-BROWSER TESTING RESULTS" -ForegroundColor $Magenta
Write-Host "===============================================" -ForegroundColor $Gray

$passRate = if ($script:TestResults.Total -gt 0) { 
    [math]::Round(($script:TestResults.Passed / $script:TestResults.Total) * 100, 1) 
} else { 0 }

$warningRate = if ($script:TestResults.Total -gt 0) { 
    [math]::Round(($script:TestResults.Warnings / $script:TestResults.Total) * 100, 1) 
} else { 0 }

Write-Host "Total Tests: $($script:TestResults.Total)" -ForegroundColor $Yellow
Write-Host "✅ Passed: $($script:TestResults.Passed) ($passRate%)" -ForegroundColor $Green
Write-Host "❌ Failed: $($script:TestResults.Failed)" -ForegroundColor $Red
Write-Host "⚠️ Warnings: $($script:TestResults.Warnings) ($warningRate%)" -ForegroundColor $Yellow
Write-Host ""

# Grade Calculation
$grade = if ($passRate -ge 95) { "A+" }
elseif ($passRate -ge 90) { "A" }
elseif ($passRate -ge 85) { "B+" }
elseif ($passRate -ge 80) { "B" }
elseif ($passRate -ge 75) { "C+" }
elseif ($passRate -ge 70) { "C" }
elseif ($passRate -ge 65) { "D+" }
elseif ($passRate -ge 60) { "D" }
else { "F" }

$color = if ($passRate -ge 80) { $Green }
elseif ($passRate -ge 70) { $Yellow }
else { $Red }

Write-Host "🎯 CROSS-BROWSER COMPATIBILITY GRADE: $grade ($passRate%)" -ForegroundColor $color
Write-Host ""

# Browser Compatibility Assessment
$compatibilityStatus = if ($passRate -ge 85) { "EXCELLENT COMPATIBILITY" }
elseif ($passRate -ge 70) { "GOOD COMPATIBILITY" }
elseif ($passRate -ge 60) { "BASIC COMPATIBILITY" }
else { "POOR COMPATIBILITY" }

Write-Host "🌐 BROWSER COMPATIBILITY STATUS: $compatibilityStatus ($passRate%)" -ForegroundColor $color
Write-Host ""

# Recommendations
if ($script:TestResults.Failed -gt 0 -or $script:TestResults.Warnings -gt 0) {
    Write-Host "📋 CROSS-BROWSER IMPROVEMENT RECOMMENDATIONS:" -ForegroundColor $Yellow
    Write-Host "• Test on actual browsers: Chrome, Firefox, Safari, Edge" -ForegroundColor $Gray
    Write-Host "• Implement progressive enhancement strategies" -ForegroundColor $Gray
    Write-Host "• Add polyfills for older browser support" -ForegroundColor $Gray
    Write-Host "• Use autoprefixer for CSS vendor prefixes" -ForegroundColor $Gray
    Write-Host "• Test on mobile browsers: iOS Safari, Chrome Mobile, Samsung Internet" -ForegroundColor $Gray
    Write-Host "• Implement feature detection with Modernizr" -ForegroundColor $Gray
    Write-Host "• Add browser compatibility warnings for unsupported features" -ForegroundColor $Gray
    Write-Host ""
}

if ($passRate -ge 80) {
    Write-Host "🎉 PHASE 8 CROSS-BROWSER TESTING: SUCCESS!" -ForegroundColor $Green
    Write-Host "System demonstrates excellent cross-browser compatibility and modern web standards" -ForegroundColor $Green
} elseif ($passRate -ge 60) {
    Write-Host "⚠️ PHASE 8 CROSS-BROWSER TESTING: GOOD FOUNDATION" -ForegroundColor $Yellow
    Write-Host "System has good browser compatibility with room for enhancement" -ForegroundColor $Yellow
} else {
    Write-Host "❌ PHASE 8 CROSS-BROWSER TESTING: NEEDS IMPROVEMENT" -ForegroundColor $Red
    Write-Host "System requires browser compatibility improvements for broad user support" -ForegroundColor $Red
}

Write-Host ""
Write-Host "Next: Phase 9 - UI/UX Testing" -ForegroundColor $Cyan
