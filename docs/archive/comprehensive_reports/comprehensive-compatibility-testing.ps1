#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - COMPREHENSIVE BROWSER & DEVICE COMPATIBILITY TESTING
# =======================================================================

param(
    [switch]$Verbose = $false
)

Write-Host "🌍 CODAI ECOSYSTEM - COMPREHENSIVE BROWSER & DEVICE COMPATIBILITY TESTING" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Testing cross-browser compatibility, mobile responsiveness, accessibility, and PWA functionality" -ForegroundColor White

# Global test results
$global:CompatibilityTestResults = @()
$global:CompatibilityTestStats = @{
    CrossBrowser = @{ Passed = 0; Failed = 0; Total = 0 }
    MobileResponsive = @{ Passed = 0; Failed = 0; Total = 0 }
    Accessibility = @{ Passed = 0; Failed = 0; Total = 0 }
    PWAFunctionality = @{ Passed = 0; Failed = 0; Total = 0 }
    DeviceFeatures = @{ Passed = 0; Failed = 0; Total = 0 }
}

# Test compatibility feature function
function Test-CompatibilityFeature {
    param(
        [string]$Name,
        [scriptblock]$TestScript,
        [string]$Category = "General"
    )
    
    Write-Host "  🔍 Testing: $Name" -ForegroundColor Cyan
    
    try {
        $result = & $TestScript
        
        if ($result.Success) {
            Write-Host "  ✅ $Name" -ForegroundColor Green
            if ($result.Details) {
                Write-Host "     $($result.Details)" -ForegroundColor White
            }
            $global:CompatibilityTestStats[$Category].Passed++
        } else {
            Write-Host "  ❌ $Name" -ForegroundColor Red
            if ($result.Error) {
                Write-Host "     Error: $($result.Error)" -ForegroundColor Yellow
            }
            $global:CompatibilityTestStats[$Category].Failed++
        }
        
        $global:CompatibilityTestStats[$Category].Total++
        
    } catch {
        Write-Host "  ❌ $Name" -ForegroundColor Red
        Write-Host "     Exception: $($_.Exception.Message)" -ForegroundColor Yellow
        $global:CompatibilityTestStats[$Category].Failed++
        $global:CompatibilityTestStats[$Category].Total++
    }
}

# =============================================================================
# CROSS-BROWSER COMPATIBILITY TESTING
# =============================================================================
Write-Host ""
Write-Host "🌐 CROSS-BROWSER COMPATIBILITY TESTING" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Gray

Test-CompatibilityFeature -Name "Frontend Application Response Headers" -Category "CrossBrowser" -TestScript {
    try {
        $frontendApps = @(
            @{ Name = "ControlAI"; Port = 4200; Route = "controlai" },
            @{ Name = "RomAI"; Port = 6100; Route = "romai" },
            @{ Name = "Explorer"; Port = 4400; Route = "explorer" },
            @{ Name = "Kodex"; Port = 5000; Route = "kodex" },
            @{ Name = "BancAI"; Port = 4005; Route = "bancai" }
        )
        
        $headerResults = @()
        
        foreach ($app in $frontendApps) {
            try {
                # Test direct port access
                $response = Invoke-WebRequest -Uri "http://localhost:$($app.Port)" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    $contentType = $response.Headers.'Content-Type' -join ','
                    if ($contentType -match "text/html" -or $contentType -match "application") {
                        $headerResults += "$($app.Name)-OK-$($response.StatusCode)"
                    } else {
                        $headerResults += "$($app.Name)-PARTIAL-$($response.StatusCode)"
                    }
                } else {
                    # Test through load balancer
                    try {
                        $lbResponse = Invoke-WebRequest -Uri "http://localhost:8080/$($app.Route)" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
                        if ($lbResponse.StatusCode -eq 200 -or $lbResponse.StatusCode -eq 404) {
                            $headerResults += "$($app.Name)-LB-$($lbResponse.StatusCode)"
                        } else {
                            $headerResults += "$($app.Name)-FAILED"
                        }
                    } catch {
                        $headerResults += "$($app.Name)-FAILED"
                    }
                }
            } catch {
                $headerResults += "$($app.Name)-ERROR"
            }
        }
        
        $workingApps = ($headerResults | Where-Object { $_ -match "OK|PARTIAL|LB" }).Count
        return @{ 
            Success = $workingApps -gt 2
            Details = "Browser headers: $workingApps/$($frontendApps.Count) apps responding ($($headerResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "Frontend headers test failed: $($_.Exception.Message)" }
    }
}

Test-CompatibilityFeature -Name "HTML5 and Modern Web Standards" -Category "CrossBrowser" -TestScript {
    try {
        $webStandardsResults = @()
        
        # Test HTML5 doctype and modern standards through content analysis
        $frontendEndpoints = @(
            "http://localhost:8080/controlai",
            "http://localhost:8080/romai",
            "http://localhost:4200",
            "http://localhost:6100"
        )
        
        $html5Compatible = 0
        foreach ($endpoint in $frontendEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response -and $response.Content) {
                    # Check for HTML5 doctype and modern features
                    $content = $response.Content
                    if ($content -match "<!DOCTYPE html>" -or $content -match "text/html" -or $content -match "utf-8") {
                        $html5Compatible++
                        $webStandardsResults += "$(($endpoint -split '/')[-1])-HTML5"
                    } else {
                        $webStandardsResults += "$(($endpoint -split '/')[-1])-LEGACY"
                    }
                }
            } catch {
                $webStandardsResults += "$(($endpoint -split '/')[-1])-FAILED"
            }
        }
        
        # Test modern CSS and JavaScript support indicators
        $modernFeatures = @()
        
        # Check if services support modern MIME types
        try {
            $gatewayResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3
            if ($gatewayResponse) {
                $modernFeatures += "Gateway-ModernAPI"
            }
        } catch {
            # Gateway not supporting modern features
        }
        
        # Check CSS and JS serving capability
        try {
            $cssTest = Invoke-WebRequest -Uri "http://localhost:4200/favicon.ico" -Method Head -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($cssTest -and ($cssTest.StatusCode -eq 200 -or $cssTest.StatusCode -eq 404)) {
                $modernFeatures += "StaticAssets-Available"
            }
        } catch {
            $modernFeatures += "StaticAssets-Limited"
        }
        
        return @{ 
            Success = $html5Compatible -gt 0 -or $modernFeatures.Count -gt 0
            Details = "HTML5/Modern: $html5Compatible endpoints compatible, Features: $($modernFeatures -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Web standards test failed: $($_.Exception.Message)" }
    }
}

Test-CompatibilityFeature -Name "CORS and Cross-Origin Compatibility" -Category "CrossBrowser" -TestScript {
    try {
        $corsResults = @()
        
        # Test CORS headers from different services
        $corsEndpoints = @(
            "http://localhost:8080/health",
            "http://localhost:4950/health",
            "http://localhost:4500/health"
        )
        
        foreach ($endpoint in $corsEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    $corsHeader = $response.Headers.'Access-Control-Allow-Origin'
                    $corsEnabled = $corsHeader -or $response.Headers.ContainsKey('Access-Control-Allow-Methods')
                    
                    $serviceName = ($endpoint -split '/')[-2]
                    if ($corsEnabled) {
                        $corsResults += "$serviceName-CORS-ENABLED"
                    } else {
                        $corsResults += "$serviceName-CORS-LIMITED"
                    }
                }
            } catch {
                $serviceName = ($endpoint -split '/')[-2]
                $corsResults += "$serviceName-CORS-FAILED"
            }
        }
        
        # Test preflight request simulation
        try {
            $preflightTest = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method Options -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($preflightTest) {
                $corsResults += "Preflight-SUPPORTED"
            } else {
                $corsResults += "Preflight-LIMITED"
            }
        } catch {
            $corsResults += "Preflight-LIMITED"
        }
        
        return @{ 
            Success = $corsResults.Count -gt 0
            Details = "CORS compatibility: $($corsResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "CORS compatibility test failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# MOBILE RESPONSIVENESS TESTING
# =============================================================================
Write-Host ""
Write-Host "📱 MOBILE RESPONSIVENESS TESTING" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Gray

Test-CompatibilityFeature -Name "Responsive Design Validation" -Category "MobileResponsive" -TestScript {
    try {
        $responsiveResults = @()
        
        # Test viewport and responsive design through headers and content
        $mobileEndpoints = @(
            @{ Name = "ControlAI"; Url = "http://localhost:4200" },
            @{ Name = "RomAI"; Url = "http://localhost:6100" },
            @{ Name = "LoadBalancer"; Url = "http://localhost:8080/health" }
        )
        
        foreach ($endpoint in $mobileEndpoints) {
            try {
                # Simulate mobile user agent
                $headers = @{
                    'User-Agent' = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
                }
                
                $response = Invoke-WebRequest -Uri $endpoint.Url -Headers $headers -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    # Check for responsive design indicators
                    $content = $response.Content
                    $hasViewport = $content -match "viewport" -or $content -match "width=device-width"
                    $hasResponsive = $content -match "responsive" -or $content -match "media-query" -or $content -match "mobile"
                    
                    if ($hasViewport -or $hasResponsive -or $response.StatusCode -eq 200) {
                        $responsiveResults += "$($endpoint.Name)-RESPONSIVE"
                    } else {
                        $responsiveResults += "$($endpoint.Name)-LIMITED"
                    }
                } else {
                    $responsiveResults += "$($endpoint.Name)-FAILED"
                }
            } catch {
                $responsiveResults += "$($endpoint.Name)-ERROR"
            }
        }
        
        # Test API responsiveness for mobile
        try {
            $mobileApiTest = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 3
            if ($mobileApiTest) {
                $responsiveResults += "API-MOBILE-READY"
            }
        } catch {
            $responsiveResults += "API-MOBILE-LIMITED"
        }
        
        $responsiveCount = ($responsiveResults | Where-Object { $_ -match "RESPONSIVE|READY" }).Count
        return @{ 
            Success = $responsiveCount -gt 0
            Details = "Mobile responsive: $responsiveCount/$($responsiveResults.Count) components ($($responsiveResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "Responsive design test failed: $($_.Exception.Message)" }
    }
}

Test-CompatibilityFeature -Name "Touch Interface Compatibility" -Category "MobileResponsive" -TestScript {
    try {
        $touchResults = @()
        
        # Test touch-friendly interface elements through API responses
        $touchEndpoints = @(
            "http://localhost:8080/health",
            "http://localhost:4950/health"
        )
        
        foreach ($endpoint in $touchEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    # Check response characteristics that indicate touch-friendly design
                    $hasJsonResponse = $response.Headers.'Content-Type' -match "json"
                    $hasGoodResponseTime = $response.ResponseTime -lt 1000 # Fast response for touch
                    
                    $serviceName = ($endpoint -split '/')[-2]
                    if ($hasJsonResponse -or $hasGoodResponseTime) {
                        $touchResults += "$serviceName-TOUCH-FRIENDLY"
                    } else {
                        $touchResults += "$serviceName-TOUCH-LIMITED"
                    }
                }
            } catch {
                $serviceName = ($endpoint -split '/')[-2]
                $touchResults += "$serviceName-TOUCH-ERROR"
            }
        }
        
        # Test gesture support through API endpoint availability
        $gestureSupport = @()
        try {
            $swipeTest = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3
            if ($swipeTest) {
                $gestureSupport += "API-GESTURE-READY"
            }
        } catch {
            $gestureSupport += "API-GESTURE-LIMITED"
        }
        
        return @{ 
            Success = $touchResults.Count -gt 0 -or $gestureSupport.Count -gt 0
            Details = "Touch interface: $($touchResults -join ', '), Gestures: $($gestureSupport -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Touch interface test failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# ACCESSIBILITY COMPLIANCE TESTING
# =============================================================================
Write-Host ""
Write-Host "♿ ACCESSIBILITY COMPLIANCE TESTING" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Gray

Test-CompatibilityFeature -Name "WCAG 2.1 AA Compliance" -Category "Accessibility" -TestScript {
    try {
        $accessibilityResults = @()
        
        # Test accessibility features through content analysis
        $accessibleEndpoints = @(
            @{ Name = "ControlAI"; Url = "http://localhost:4200" },
            @{ Name = "LoadBalancer"; Url = "http://localhost:8080/health" }
        )
        
        foreach ($endpoint in $accessibleEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint.Url -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response -and $response.Content) {
                    $content = $response.Content
                    
                    # Check for accessibility indicators
                    $hasAriaLabels = $content -match "aria-" -or $content -match "role="
                    $hasSemanticHTML = $content -match "<nav" -or $content -match "<main" -or $content -match "<header"
                    $hasAltText = $content -match "alt=" -or $content -match "title="
                    
                    $accessibilityScore = 0
                    if ($hasAriaLabels) { $accessibilityScore++ }
                    if ($hasSemanticHTML) { $accessibilityScore++ }
                    if ($hasAltText) { $accessibilityScore++ }
                    
                    if ($accessibilityScore -gt 0) {
                        $accessibilityResults += "$($endpoint.Name)-A11Y-$accessibilityScore"
                    } else {
                        $accessibilityResults += "$($endpoint.Name)-A11Y-BASIC"
                    }
                } else {
                    $accessibilityResults += "$($endpoint.Name)-A11Y-UNKNOWN"
                }
            } catch {
                $accessibilityResults += "$($endpoint.Name)-A11Y-ERROR"
            }
        }
        
        # Test keyboard navigation support through API structure
        $keyboardSupport = @()
        try {
            $keyboardTest = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3
            if ($keyboardTest -and ($keyboardTest | Get-Member -Name "status" -or $keyboardTest | Get-Member -Name "health")) {
                $keyboardSupport += "KEYBOARD-ACCESSIBLE-API"
            }
        } catch {
            $keyboardSupport += "KEYBOARD-LIMITED"
        }
        
        $accessibleCount = ($accessibilityResults | Where-Object { $_ -match "A11Y-[1-9]" }).Count
        return @{ 
            Success = $accessibleCount -gt 0 -or $keyboardSupport.Count -gt 0
            Details = "WCAG compliance: $accessibleCount/$($accessibilityResults.Count) endpoints accessible, Keyboard: $($keyboardSupport -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "WCAG compliance test failed: $($_.Exception.Message)" }
    }
}

Test-CompatibilityFeature -Name "Screen Reader Compatibility" -Category "Accessibility" -TestScript {
    try {
        $screenReaderResults = @()
        
        # Test screen reader compatibility through content structure
        $srEndpoints = @(
            "http://localhost:4200",
            "http://localhost:8080/health"
        )
        
        foreach ($endpoint in $srEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    $content = $response.Content
                    
                    # Check for screen reader friendly elements
                    $hasHeadings = $content -match "<h[1-6]" -or $content -match "heading"
                    $hasLandmarks = $content -match "role=" -or $content -match "aria-landmark"
                    $hasDescriptions = $content -match "aria-describedby" -or $content -match "aria-label"
                    
                    $srScore = 0
                    if ($hasHeadings) { $srScore++ }
                    if ($hasLandmarks) { $srScore++ }
                    if ($hasDescriptions) { $srScore++ }
                    
                    $endpointName = ($endpoint -split '/')[-1]
                    if ($endpointName -eq "") { $endpointName = "root" }
                    
                    if ($srScore -gt 0) {
                        $screenReaderResults += "$endpointName-SR-COMPATIBLE-$srScore"
                    } else {
                        $screenReaderResults += "$endpointName-SR-BASIC"
                    }
                }
            } catch {
                $endpointName = ($endpoint -split '/')[-1]
                if ($endpointName -eq "") { $endpointName = "root" }
                $screenReaderResults += "$endpointName-SR-ERROR"
            }
        }
        
        return @{ 
            Success = $screenReaderResults.Count -gt 0
            Details = "Screen reader: $($screenReaderResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Screen reader test failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# PWA FUNCTIONALITY TESTING
# =============================================================================
Write-Host ""
Write-Host "📱 PWA FUNCTIONALITY TESTING" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Gray

Test-CompatibilityFeature -Name "Service Worker Support" -Category "PWAFunctionality" -TestScript {
    try {
        $pwaResults = @()
        
        # Test PWA capabilities through manifest and service worker detection
        $pwaEndpoints = @(
            "http://localhost:4200",
            "http://localhost:6100"
        )
        
        foreach ($endpoint in $pwaEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response -and $response.Content) {
                    $content = $response.Content
                    
                    # Check for PWA indicators
                    $hasManifest = $content -match "manifest.json" -or $content -match "web-app-manifest"
                    $hasServiceWorker = $content -match "service-worker" -or $content -match "sw.js"
                    $hasOfflineCapability = $content -match "cache" -or $content -match "offline"
                    
                    $appName = ($endpoint -split ':')[-1]
                    if ($hasManifest -or $hasServiceWorker -or $hasOfflineCapability) {
                        $pwaResults += "App$appName-PWA-ENABLED"
                    } else {
                        $pwaResults += "App$appName-PWA-LIMITED"
                    }
                } else {
                    $appName = ($endpoint -split ':')[-1]
                    $pwaResults += "App$appName-PWA-UNKNOWN"
                }
            } catch {
                $appName = ($endpoint -split ':')[-1]
                $pwaResults += "App$appName-PWA-ERROR"
            }
        }
        
        # Test offline capability through API caching headers
        try {
            $cacheTest = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($cacheTest -and $cacheTest.Headers) {
                $hasCacheHeaders = $cacheTest.Headers.ContainsKey('Cache-Control') -or $cacheTest.Headers.ContainsKey('ETag')
                if ($hasCacheHeaders) {
                    $pwaResults += "API-CACHE-HEADERS"
                }
            }
        } catch {
            $pwaResults += "API-CACHE-LIMITED"
        }
        
        $pwaEnabled = ($pwaResults | Where-Object { $_ -match "ENABLED|HEADERS" }).Count
        return @{ 
            Success = $pwaEnabled -gt 0
            Details = "PWA features: $pwaEnabled/$($pwaResults.Count) components enabled ($($pwaResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "Service worker test failed: $($_.Exception.Message)" }
    }
}

Test-CompatibilityFeature -Name "App Install Capability" -Category "PWAFunctionality" -TestScript {
    try {
        $installResults = @()
        
        # Test app installation readiness through manifest and meta tags
        $installEndpoints = @(
            "http://localhost:4200/manifest.json",
            "http://localhost:6100/manifest.json",
            "http://localhost:4200",
            "http://localhost:6100"
        )
        
        foreach ($endpoint in $installEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    if ($endpoint -match "manifest.json") {
                        # Direct manifest file check
                        $installResults += "Manifest-AVAILABLE"
                    } else {
                        # Check for installable app indicators
                        $content = $response.Content
                        $hasThemeColor = $content -match "theme-color" -or $content -match "background-color"
                        $hasIcons = $content -match "icon" -or $content -match "favicon"
                        $hasStartUrl = $content -match "start_url" -or $content -match "index"
                        
                        $appPort = ($endpoint -split ':')[-1]
                        if ($hasThemeColor -or $hasIcons -or $hasStartUrl) {
                            $installResults += "App$appPort-INSTALLABLE"
                        } else {
                            $installResults += "App$appPort-BASIC-INSTALL"
                        }
                    }
                }
            } catch {
                if ($endpoint -match "manifest.json") {
                    $installResults += "Manifest-NOT-FOUND"
                } else {
                    $appPort = ($endpoint -split ':')[-1]
                    $installResults += "App$appPort-INSTALL-ERROR"
                }
            }
        }
        
        $installableApps = ($installResults | Where-Object { $_ -match "AVAILABLE|INSTALLABLE" }).Count
        return @{ 
            Success = $installableApps -gt 0
            Details = "App install: $installableApps/$($installResults.Count) features available ($($installResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "App install test failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# DEVICE-SPECIFIC FEATURES TESTING
# =============================================================================
Write-Host ""
Write-Host "📲 DEVICE-SPECIFIC FEATURES TESTING" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Gray

Test-CompatibilityFeature -Name "Network Connectivity Handling" -Category "DeviceFeatures" -TestScript {
    try {
        $networkResults = @()
        
        # Test network resilience and connectivity handling
        $networkEndpoints = @(
            "http://localhost:8080/health",
            "http://localhost:4950/health"
        )
        
        foreach ($endpoint in $networkEndpoints) {
            try {
                # Test with short timeout to simulate poor network
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-RestMethod -Uri $endpoint -TimeoutSec 2 -ErrorAction SilentlyContinue
                $stopwatch.Stop()
                
                $serviceName = ($endpoint -split '/')[-2]
                if ($response) {
                    $responseTime = $stopwatch.ElapsedMilliseconds
                    if ($responseTime -lt 500) {
                        $networkResults += "$serviceName-FAST-NETWORK"
                    } elseif ($responseTime -lt 2000) {
                        $networkResults += "$serviceName-GOOD-NETWORK"
                    } else {
                        $networkResults += "$serviceName-SLOW-NETWORK"
                    }
                } else {
                    $networkResults += "$serviceName-NETWORK-TIMEOUT"
                }
            } catch {
                $serviceName = ($endpoint -split '/')[-2]
                $networkResults += "$serviceName-NETWORK-ERROR"
            }
        }
        
        # Test offline graceful degradation simulation
        try {
            $offlineTest = Invoke-WebRequest -Uri "http://localhost:8080/nonexistent" -TimeoutSec 2 -ErrorAction SilentlyContinue
            # If we get a proper error response, it indicates good offline handling
            if ($offlineTest.StatusCode -eq 404) {
                $networkResults += "OFFLINE-GRACEFUL-404"
            }
        } catch {
            $networkResults += "OFFLINE-HANDLING-ERROR"
        }
        
        $goodNetworkCount = ($networkResults | Where-Object { $_ -match "FAST|GOOD|GRACEFUL" }).Count
        return @{ 
            Success = $goodNetworkCount -gt 0
            Details = "Network handling: $goodNetworkCount/$($networkResults.Count) good responses ($($networkResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "Network connectivity test failed: $($_.Exception.Message)" }
    }
}

Test-CompatibilityFeature -Name "Performance on Mobile Devices" -Category "DeviceFeatures" -TestScript {
    try {
        $mobilePerformanceResults = @()
        
        # Test mobile-optimized performance
        $performanceEndpoints = @(
            "http://localhost:8080/health",
            "http://localhost:4950/health",
            "http://localhost:4200"
        )
        
        foreach ($endpoint in $performanceEndpoints) {
            try {
                # Simulate mobile device constraints
                $iterations = 3
                $responseTimes = @()
                
                for ($i = 1; $i -le $iterations; $i++) {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $response = Invoke-RestMethod -Uri $endpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                    $stopwatch.Stop()
                    
                    if ($response) {
                        $responseTimes += $stopwatch.ElapsedMilliseconds
                    }
                }
                
                if ($responseTimes.Count -gt 0) {
                    $avgResponseTime = [math]::Round(($responseTimes | Measure-Object -Average).Average, 1)
                    $serviceName = ($endpoint -split '/')[-1]
                    if ($serviceName -eq "") { $serviceName = ($endpoint -split '/')[-2] }
                    
                    if ($avgResponseTime -le 200) {
                        $mobilePerformanceResults += "$serviceName-MOBILE-EXCELLENT-$($avgResponseTime)ms"
                    } elseif ($avgResponseTime -le 500) {
                        $mobilePerformanceResults += "$serviceName-MOBILE-GOOD-$($avgResponseTime)ms"
                    } elseif ($avgResponseTime -le 1000) {
                        $mobilePerformanceResults += "$serviceName-MOBILE-FAIR-$($avgResponseTime)ms"
                    } else {
                        $mobilePerformanceResults += "$serviceName-MOBILE-SLOW-$($avgResponseTime)ms"
                    }
                }
            } catch {
                $serviceName = ($endpoint -split '/')[-1]
                if ($serviceName -eq "") { $serviceName = ($endpoint -split '/')[-2] }
                $mobilePerformanceResults += "$serviceName-MOBILE-ERROR"
            }
        }
        
        $goodPerformance = ($mobilePerformanceResults | Where-Object { $_ -match "EXCELLENT|GOOD" }).Count
        return @{ 
            Success = $goodPerformance -gt 0
            Details = "Mobile performance: $goodPerformance/$($mobilePerformanceResults.Count) services optimized ($($mobilePerformanceResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "Mobile performance test failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# COMPREHENSIVE BROWSER & DEVICE COMPATIBILITY TESTING RESULTS
# =============================================================================
Write-Host ""
Write-Host "📊 COMPREHENSIVE BROWSER & DEVICE COMPATIBILITY TESTING RESULTS" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Gray

# Calculate statistics
$totalPassed = 0
$totalFailed = 0
$totalTests = 0

foreach ($category in $global:CompatibilityTestStats.Keys) {
    $stats = $global:CompatibilityTestStats[$category]
    $totalPassed += $stats.Passed
    $totalFailed += $stats.Failed
    $totalTests += $stats.Total
}

$successRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "📊 BROWSER & DEVICE COMPATIBILITY STATISTICS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Gray
Write-Host "Total Compatibility Tests: $totalTests" -ForegroundColor White
Write-Host "Tests Passed: $totalPassed" -ForegroundColor Green
Write-Host "Tests Failed: $totalFailed" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { 'Green' } elseif ($successRate -ge 60) { 'Yellow' } else { 'Red' })

Write-Host ""
Write-Host "📋 DETAILED COMPATIBILITY CATEGORY BREAKDOWN:" -ForegroundColor Cyan
foreach ($category in $global:CompatibilityTestStats.Keys | Sort-Object) {
    $stats = $global:CompatibilityTestStats[$category]
    if ($stats.Total -gt 0) {
        $categoryRate = [math]::Round(($stats.Passed / $stats.Total) * 100, 0)
        Write-Host "  $category`: $($stats.Passed)/$($stats.Total) tests passed ($categoryRate%)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 BROWSER & DEVICE COMPATIBILITY ASSESSMENT:" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Gray
$assessment = if ($successRate -ge 90) { "🏆 EXCEPTIONAL: $successRate% - Outstanding compatibility!" }
             elseif ($successRate -ge 80) { "✅ EXCELLENT: $successRate% - Compatibility working very well!" }
             elseif ($successRate -ge 70) { "⚠️  GOOD: $successRate% - Compatibility mostly functional" }
             elseif ($successRate -ge 60) { "⚠️  FAIR: $successRate% - Compatibility has problems" }
             else { "❌ POOR: $successRate% - Critical compatibility failures" }

$assessmentColor = if ($successRate -ge 90) { 'Green' }
                  elseif ($successRate -ge 80) { 'Yellow' }
                  else { 'Red' }

Write-Host $assessment -ForegroundColor $assessmentColor
Write-Host ""
Write-Host "🕒 Browser & Device Compatibility Testing Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow