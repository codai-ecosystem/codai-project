# 🎨 CODAI Ecosystem - Frontend & User Experience Testing
# Based on Microsoft Playwright & Web Standards Best Practices
# Date: August 2025

param(
    [switch]$TestUI = $true,
    [switch]$TestAccessibility = $true,
    [switch]$TestPerformance = $true,
    [switch]$TestResponsive = $true,
    [switch]$TestCrossBrowser = $false,  # Requires Playwright installation
    [switch]$Detailed = $false,
    [switch]$ExportResults = $true,
    [string]$OutputPath = ".\test-results"
)

Write-Host "🎨 CODAI ECOSYSTEM - FRONTEND & USER EXPERIENCE TESTING" -ForegroundColor Magenta
Write-Host "=" * 80 -ForegroundColor Magenta
Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host ""

# Initialize test results
$testResults = @()

function Add-TestResult {
    param($Category, $TestName, $Status, $Details, $ExpectedValue, $ActualValue, $Duration, $MetricValue)
    
    $script:testResults += [PSCustomObject]@{
        Category = $Category
        TestName = $TestName
        Status = $Status
        Details = $Details
        Expected = $ExpectedValue
        Actual = $ActualValue
        Duration = $Duration
        MetricValue = $MetricValue
        Timestamp = Get-Date
    }
    
    $statusColor = switch($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "SKIP" { "Cyan" }
        default { "White" }
    }
    
    $statusIcon = switch($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️" }
        "SKIP" { "⏭️" }
        default { "ℹ️" }
    }
    
    Write-Host "  $statusIcon $TestName" -ForegroundColor $statusColor
    if ($Detailed -and $Details) {
        Write-Host "    📋 $Details" -ForegroundColor Gray
    }
    if ($MetricValue) {
        Write-Host "    📊 Metric: $MetricValue" -ForegroundColor Blue
    }
}

function Test-FrontendApplication {
    param($ServiceName, $Url, $ExpectedTitle, $ExpectedElements, $TestId)
    
    try {
        $startTime = Get-Date
        
        # Test basic connectivity and response
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        $loadTime = (Get-Date) - $startTime
        
        if ($response.StatusCode -eq 200) {
            Add-TestResult "UI Testing" "$ServiceName - Page Load" "PASS" "HTTP 200 OK" "200" $response.StatusCode $loadTime.TotalMilliseconds "$([math]::Round($loadTime.TotalMilliseconds, 2))ms"
            
            # Test content length (indicates proper rendering)
            $contentLength = $response.Content.Length
            if ($contentLength -gt 1000) {
                Add-TestResult "UI Testing" "$ServiceName - Content Rendering" "PASS" "Rich content detected" ">1KB" "${contentLength} bytes" $loadTime.TotalMilliseconds "$([math]::Round($contentLength/1024, 2))KB"
            } else {
                Add-TestResult "UI Testing" "$ServiceName - Content Rendering" "WARN" "Minimal content" ">1KB" "${contentLength} bytes" $loadTime.TotalMilliseconds "$([math]::Round($contentLength/1024, 2))KB"
            }
            
            # Test for common HTML structure
            $htmlContent = $response.Content
            
            # Check for DOCTYPE declaration
            if ($htmlContent -match '<!DOCTYPE html>') {
                Add-TestResult "UI Testing" "$ServiceName - HTML5 DOCTYPE" "PASS" "Valid HTML5 declaration" "HTML5" "Present" $loadTime.TotalMilliseconds
            } else {
                Add-TestResult "UI Testing" "$ServiceName - HTML5 DOCTYPE" "WARN" "Missing DOCTYPE" "HTML5" "Missing" $loadTime.TotalMilliseconds
            }
            
            # Check for title tag
            if ($htmlContent -match '<title[^>]*>([^<]+)</title>') {
                $actualTitle = $Matches[1]
                Add-TestResult "UI Testing" "$ServiceName - Page Title" "PASS" "Title: $actualTitle" "Present" $actualTitle $loadTime.TotalMilliseconds
            } else {
                Add-TestResult "UI Testing" "$ServiceName - Page Title" "WARN" "No title found" "Present" "Missing" $loadTime.TotalMilliseconds
            }
            
            # Check for viewport meta tag (responsive design)
            if ($htmlContent -match 'name="viewport"') {
                Add-TestResult "UI Testing" "$ServiceName - Responsive Meta" "PASS" "Viewport meta tag present" "Present" "Found" $loadTime.TotalMilliseconds
            } else {
                Add-TestResult "UI Testing" "$ServiceName - Responsive Meta" "WARN" "Missing viewport meta" "Present" "Missing" $loadTime.TotalMilliseconds
            }
            
            # Check for CSS references
            $cssCount = ([regex]::Matches($htmlContent, '<link[^>]*rel="stylesheet"')).Count
            if ($cssCount -gt 0) {
                Add-TestResult "UI Testing" "$ServiceName - CSS Resources" "PASS" "CSS stylesheets loaded" ">0" "$cssCount stylesheets" $loadTime.TotalMilliseconds
            } else {
                Add-TestResult "UI Testing" "$ServiceName - CSS Resources" "WARN" "No CSS detected" ">0" "0 stylesheets" $loadTime.TotalMilliseconds
            }
            
            # Check for JavaScript references
            $jsCount = ([regex]::Matches($htmlContent, '<script[^>]*src=')).Count
            if ($jsCount -gt 0) {
                Add-TestResult "UI Testing" "$ServiceName - JS Resources" "PASS" "JavaScript resources loaded" ">0" "$jsCount scripts" $loadTime.TotalMilliseconds
            } else {
                Add-TestResult "UI Testing" "$ServiceName - JS Resources" "WARN" "Limited JS detected" ">0" "0 external scripts" $loadTime.TotalMilliseconds
            }
            
            return $true
            
        } else {
            Add-TestResult "UI Testing" "$ServiceName - Page Load" "FAIL" "HTTP $($response.StatusCode)" "200" $response.StatusCode $loadTime.TotalMilliseconds
            return $false
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "UI Testing" "$ServiceName - Page Load" "FAIL" $_.Exception.Message "200" "Connection Error" $duration.TotalMilliseconds
        return $false
    }
}

function Test-AccessibilityFeatures {
    param($ServiceName, $Url)
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $htmlContent = $response.Content
        $duration = (Get-Date) - $startTime
        
        # Test for semantic HTML elements
        $semanticElements = @('header', 'nav', 'main', 'section', 'article', 'aside', 'footer')
        $foundSemanticElements = 0
        foreach ($element in $semanticElements) {
            if ($htmlContent -match "<$element[^>]*>") {
                $foundSemanticElements++
            }
        }
        
        if ($foundSemanticElements -gt 2) {
            Add-TestResult "Accessibility Testing" "$ServiceName - Semantic HTML" "PASS" "$foundSemanticElements semantic elements" ">2" "$foundSemanticElements elements" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Accessibility Testing" "$ServiceName - Semantic HTML" "WARN" "Limited semantic structure" ">2" "$foundSemanticElements elements" $duration.TotalMilliseconds
        }
        
        # Test for alt text on images (basic check)
        $imgTags = ([regex]::Matches($htmlContent, '<img[^>]*>', 'IgnoreCase')).Count
        $imgWithAlt = ([regex]::Matches($htmlContent, '<img[^>]*alt=', 'IgnoreCase')).Count
        
        if ($imgTags -eq 0) {
            Add-TestResult "Accessibility Testing" "$ServiceName - Image Alt Text" "SKIP" "No images found" "N/A" "No images" $duration.TotalMilliseconds
        } elseif ($imgWithAlt -eq $imgTags) {
            Add-TestResult "Accessibility Testing" "$ServiceName - Image Alt Text" "PASS" "All images have alt text" "100%" "$imgWithAlt/$imgTags" $duration.TotalMilliseconds
        } else {
            $percentage = [math]::Round(($imgWithAlt / $imgTags) * 100, 1)
            Add-TestResult "Accessibility Testing" "$ServiceName - Image Alt Text" "WARN" "$percentage% images with alt text" "100%" "$imgWithAlt/$imgTags" $duration.TotalMilliseconds
        }
        
        # Test for form labels
        $formInputs = ([regex]::Matches($htmlContent, '<input[^>]*>', 'IgnoreCase')).Count
        $labeledInputs = ([regex]::Matches($htmlContent, '<label[^>]*>', 'IgnoreCase')).Count
        
        if ($formInputs -eq 0) {
            Add-TestResult "Accessibility Testing" "$ServiceName - Form Labels" "SKIP" "No form inputs found" "N/A" "No inputs" $duration.TotalMilliseconds
        } elseif ($labeledInputs -gt 0) {
            Add-TestResult "Accessibility Testing" "$ServiceName - Form Labels" "PASS" "Form labels present" ">0" "$labeledInputs labels" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Accessibility Testing" "$ServiceName - Form Labels" "WARN" "No form labels found" ">0" "0 labels" $duration.TotalMilliseconds
        }
        
        # Test for ARIA attributes
        $ariaCount = ([regex]::Matches($htmlContent, 'aria-[a-zA-Z-]+=')).Count
        if ($ariaCount -gt 0) {
            Add-TestResult "Accessibility Testing" "$ServiceName - ARIA Attributes" "PASS" "ARIA attributes found" ">0" "$ariaCount attributes" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Accessibility Testing" "$ServiceName - ARIA Attributes" "WARN" "No ARIA attributes" ">0" "0 attributes" $duration.TotalMilliseconds
        }
        
        # Test for heading structure
        $h1Count = ([regex]::Matches($htmlContent, '<h1[^>]*>', 'IgnoreCase')).Count
        $headingCount = ([regex]::Matches($htmlContent, '<h[1-6][^>]*>', 'IgnoreCase')).Count
        
        if ($h1Count -eq 1) {
            Add-TestResult "Accessibility Testing" "$ServiceName - Heading Structure" "PASS" "Single H1 with $headingCount total headings" "1 H1" "$h1Count H1, $headingCount total" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Accessibility Testing" "$ServiceName - Heading Structure" "WARN" "$h1Count H1 tags found" "1 H1" "$h1Count H1" $duration.TotalMilliseconds
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Accessibility Testing" "$ServiceName - Accessibility Check" "FAIL" $_.Exception.Message "Success" "Error" $duration.TotalMilliseconds
    }
}

function Test-PerformanceMetrics {
    param($ServiceName, $Url)
    
    try {
        # Test initial page load time
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
        $loadTime = (Get-Date) - $startTime
        $loadTimeMs = [math]::Round($loadTime.TotalMilliseconds, 2)
        
        # Performance thresholds based on Core Web Vitals
        if ($loadTimeMs -lt 1000) {
            Add-TestResult "Performance Testing" "$ServiceName - Initial Load Time" "PASS" "Excellent load time" "<1000ms" "${loadTimeMs}ms" $loadTime.TotalMilliseconds "${loadTimeMs}ms"
        } elseif ($loadTimeMs -lt 2500) {
            Add-TestResult "Performance Testing" "$ServiceName - Initial Load Time" "PASS" "Good load time" "<2500ms" "${loadTimeMs}ms" $loadTime.TotalMilliseconds "${loadTimeMs}ms"
        } elseif ($loadTimeMs -lt 5000) {
            Add-TestResult "Performance Testing" "$ServiceName - Initial Load Time" "WARN" "Moderate load time" "<5000ms" "${loadTimeMs}ms" $loadTime.TotalMilliseconds "${loadTimeMs}ms"
        } else {
            Add-TestResult "Performance Testing" "$ServiceName - Initial Load Time" "FAIL" "Slow load time" "<5000ms" "${loadTimeMs}ms" $loadTime.TotalMilliseconds "${loadTimeMs}ms"
        }
        
        # Test content size
        $contentSize = $response.Content.Length
        $contentSizeKB = [math]::Round($contentSize / 1024, 2)
        
        if ($contentSizeKB -lt 100) {
            Add-TestResult "Performance Testing" "$ServiceName - Content Size" "PASS" "Optimal content size" "<100KB" "${contentSizeKB}KB" $loadTime.TotalMilliseconds "${contentSizeKB}KB"
        } elseif ($contentSizeKB -lt 500) {
            Add-TestResult "Performance Testing" "$ServiceName - Content Size" "PASS" "Good content size" "<500KB" "${contentSizeKB}KB" $loadTime.TotalMilliseconds "${contentSizeKB}KB"
        } elseif ($contentSizeKB -lt 1000) {
            Add-TestResult "Performance Testing" "$ServiceName - Content Size" "WARN" "Large content size" "<1MB" "${contentSizeKB}KB" $loadTime.TotalMilliseconds "${contentSizeKB}KB"
        } else {
            Add-TestResult "Performance Testing" "$ServiceName - Content Size" "FAIL" "Very large content" "<1MB" "${contentSizeKB}KB" $loadTime.TotalMilliseconds "${contentSizeKB}KB"
        }
        
        # Test HTTP headers for performance optimization
        $headers = $response.Headers
        
        # Test for caching headers
        if ($headers.ContainsKey("Cache-Control") -or $headers.ContainsKey("ETag") -or $headers.ContainsKey("Last-Modified")) {
            Add-TestResult "Performance Testing" "$ServiceName - Caching Headers" "PASS" "Caching optimization enabled" "Present" "Found" $loadTime.TotalMilliseconds
        } else {
            Add-TestResult "Performance Testing" "$ServiceName - Caching Headers" "WARN" "No caching headers" "Present" "Missing" $loadTime.TotalMilliseconds
        }
        
        # Test for compression
        if ($headers.ContainsKey("Content-Encoding")) {
            $encoding = $headers["Content-Encoding"][0]
            Add-TestResult "Performance Testing" "$ServiceName - Content Compression" "PASS" "Compression enabled: $encoding" "Enabled" $encoding $loadTime.TotalMilliseconds
        } else {
            Add-TestResult "Performance Testing" "$ServiceName - Content Compression" "WARN" "No compression detected" "Enabled" "None" $loadTime.TotalMilliseconds
        }
        
        # Test for security headers (performance-related)
        $securityHeaders = @("Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options")
        $foundSecurityHeaders = 0
        foreach ($header in $securityHeaders) {
            if ($headers.ContainsKey($header)) {
                $foundSecurityHeaders++
            }
        }
        
        if ($foundSecurityHeaders -ge 2) {
            Add-TestResult "Performance Testing" "$ServiceName - Security Headers" "PASS" "$foundSecurityHeaders/3 security headers" "≥2" "$foundSecurityHeaders headers" $loadTime.TotalMilliseconds
        } else {
            Add-TestResult "Performance Testing" "$ServiceName - Security Headers" "WARN" "Limited security headers" "≥2" "$foundSecurityHeaders headers" $loadTime.TotalMilliseconds
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Performance Testing" "$ServiceName - Performance Check" "FAIL" $_.Exception.Message "Success" "Error" $duration.TotalMilliseconds
    }
}

function Test-ResponsiveDesign {
    param($ServiceName, $Url)
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $htmlContent = $response.Content
        $duration = (Get-Date) - $startTime
        
        # Test for viewport meta tag
        if ($htmlContent -match 'name="viewport"[^>]*content="[^"]*width=device-width[^"]*"') {
            Add-TestResult "Responsive Testing" "$ServiceName - Viewport Configuration" "PASS" "Device-width viewport set" "device-width" "Configured" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Responsive Testing" "$ServiceName - Viewport Configuration" "WARN" "Non-standard viewport" "device-width" "Not found" $duration.TotalMilliseconds
        }
        
        # Test for responsive CSS (media queries)
        $cssMediaQueries = ([regex]::Matches($htmlContent, '@media[^{]*\{', 'IgnoreCase')).Count
        if ($cssMediaQueries -gt 0) {
            Add-TestResult "Responsive Testing" "$ServiceName - CSS Media Queries" "PASS" "Responsive CSS detected" ">0" "$cssMediaQueries queries" $duration.TotalMilliseconds
        } else {
            # Check for responsive frameworks
            if ($htmlContent -match '(bootstrap|tailwind|bulma|foundation)' -or $htmlContent -match 'responsive') {
                Add-TestResult "Responsive Testing" "$ServiceName - CSS Media Queries" "PASS" "Responsive framework detected" "Framework" "Present" $duration.TotalMilliseconds
            } else {
                Add-TestResult "Responsive Testing" "$ServiceName - CSS Media Queries" "WARN" "No responsive indicators" ">0" "Not detected" $duration.TotalMilliseconds
            }
        }
        
        # Test for flexible layouts
        if ($htmlContent -match '(flex|grid|responsive|container|row|col)') {
            Add-TestResult "Responsive Testing" "$ServiceName - Flexible Layout" "PASS" "Flexible layout classes found" "Present" "Detected" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Responsive Testing" "$ServiceName - Flexible Layout" "WARN" "Traditional layout detected" "Present" "Not detected" $duration.TotalMilliseconds
        }
        
        # Test for responsive images
        if ($htmlContent -match '(srcset|sizes|picture|img[^>]*responsive)' -or $htmlContent -match 'width="100%"') {
            Add-TestResult "Responsive Testing" "$ServiceName - Responsive Images" "PASS" "Responsive image features" "Present" "Found" $duration.TotalMilliseconds
        } else {
            Add-TestResult "Responsive Testing" "$ServiceName - Responsive Images" "WARN" "Standard images only" "Present" "Not found" $duration.TotalMilliseconds
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Responsive Testing" "$ServiceName - Responsive Check" "FAIL" $_.Exception.Message "Success" "Error" $duration.TotalMilliseconds
    }
}

# =============================================================================
# FRONTEND APPLICATION TESTING
# =============================================================================

Write-Host "🎨 FRONTEND APPLICATION TESTING" -ForegroundColor Yellow
Write-Host "-" * 60

# Define frontend applications to test
$frontendApps = @(
    @{Name="ControlAI Frontend"; Url="http://localhost:4200/"; TestId="controlai"},
    @{Name="RomAI Frontend"; Url="http://localhost:6100/"; TestId="romai"},
    @{Name="MemorAI Frontend"; Url="http://localhost:8006/"; TestId="memorai"},
    @{Name="BancAI Frontend"; Url="http://localhost:8120/"; TestId="bancai"},
    @{Name="Explorer Frontend"; Url="http://localhost:4400/"; TestId="explorer"},
    @{Name="Kodex Frontend"; Url="http://localhost:5000/"; TestId="kodex"}
)

foreach ($app in $frontendApps) {
    Write-Host "`n🌐 Testing $($app.Name)" -ForegroundColor Cyan
    
    $isOnline = Test-FrontendApplication -ServiceName $app.Name -Url $app.Url -TestId $app.TestId
    
    if ($isOnline) {
        if ($TestAccessibility) {
            Test-AccessibilityFeatures -ServiceName $app.Name -Url $app.Url
        }
        
        if ($TestPerformance) {
            Test-PerformanceMetrics -ServiceName $app.Name -Url $app.Url
        }
        
        if ($TestResponsive) {
            Test-ResponsiveDesign -ServiceName $app.Name -Url $app.Url
        }
    } else {
        Add-TestResult "Accessibility Testing" "$($app.Name) - Accessibility" "SKIP" "Service offline" "N/A" "Skipped" 0
        Add-TestResult "Performance Testing" "$($app.Name) - Performance" "SKIP" "Service offline" "N/A" "Skipped" 0
        Add-TestResult "Responsive Testing" "$($app.Name) - Responsive" "SKIP" "Service offline" "N/A" "Skipped" 0
    }
}

# =============================================================================
# USER WORKFLOW SIMULATION TESTING
# =============================================================================
Write-Host "`n🎭 USER WORKFLOW SIMULATION TESTING" -ForegroundColor Yellow
Write-Host "-" * 60

# Test common user workflows through API calls (simulating user interactions)
$workflowTests = @(
    @{
        Name = "Health Check Workflow"
        Description = "Simulate user checking system health"
        Steps = @(
            @{Url="http://localhost:8180/health"; Expected=200; Description="Check CBD Database"},
            @{Url="http://localhost:4950/health"; Expected=200; Description="Check MemorAI MCP"},
            @{Url="http://localhost:8006/api/health"; Expected=200; Description="Check MemorAI Frontend"}
        )
    },
    @{
        Name = "Service Discovery Workflow"
        Description = "Simulate user discovering available services"
        Steps = @(
            @{Url="http://localhost:8010/health"; Expected=@(200,404); Description="Check Gateway"},
            @{Url="http://localhost:8180/"; Expected=200; Description="Explore CBD Database API"},
            @{Url="http://localhost:4500/health"; Expected=@(200,400); Description="Explore GraphQL API"}
        )
    }
)

foreach ($workflow in $workflowTests) {
    Write-Host "`n🎯 Testing $($workflow.Name)" -ForegroundColor Cyan
    
    $workflowSuccess = $true
    $totalWorkflowTime = 0
    
    foreach ($step in $workflow.Steps) {
        try {
            $startTime = Get-Date
            $response = Invoke-WebRequest -Uri $step.Url -Method Get -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
            $stepTime = (Get-Date) - $startTime
            $totalWorkflowTime += $stepTime.TotalMilliseconds
            
            if ($step.Expected -contains $response.StatusCode) {
                Add-TestResult "User Workflow Testing" "$($workflow.Name) - $($step.Description)" "PASS" "HTTP $($response.StatusCode)" "$($step.Expected)" $response.StatusCode $stepTime.TotalMilliseconds
            } else {
                Add-TestResult "User Workflow Testing" "$($workflow.Name) - $($step.Description)" "FAIL" "HTTP $($response.StatusCode)" "$($step.Expected)" $response.StatusCode $stepTime.TotalMilliseconds
                $workflowSuccess = $false
            }
            
        } catch {
            $stepTime = (Get-Date) - $startTime
            $totalWorkflowTime += $stepTime.TotalMilliseconds
            
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
                if ($step.Expected -contains $statusCode) {
                    Add-TestResult "User Workflow Testing" "$($workflow.Name) - $($step.Description)" "PASS" "Expected HTTP $statusCode" "$($step.Expected)" $statusCode $stepTime.TotalMilliseconds
                } else {
                    Add-TestResult "User Workflow Testing" "$($workflow.Name) - $($step.Description)" "FAIL" "HTTP $statusCode" "$($step.Expected)" $statusCode $stepTime.TotalMilliseconds
                    $workflowSuccess = $false
                }
            } else {
                Add-TestResult "User Workflow Testing" "$($workflow.Name) - $($step.Description)" "FAIL" $_.Exception.Message "$($step.Expected)" "Connection Error" $stepTime.TotalMilliseconds
                $workflowSuccess = $false
            }
        }
    }
    
    # Overall workflow result
    if ($workflowSuccess) {
        Add-TestResult "User Workflow Testing" "$($workflow.Name) - Complete Workflow" "PASS" "All steps successful" "Success" "Completed" $totalWorkflowTime "$([math]::Round($totalWorkflowTime, 2))ms total"
    } else {
        Add-TestResult "User Workflow Testing" "$($workflow.Name) - Complete Workflow" "FAIL" "Some steps failed" "Success" "Partial failure" $totalWorkflowTime "$([math]::Round($totalWorkflowTime, 2))ms total"
    }
}

# =============================================================================
# CROSS-BROWSER COMPATIBILITY TESTING (Simulated)
# =============================================================================
if ($TestCrossBrowser) {
    Write-Host "`n🌐 CROSS-BROWSER COMPATIBILITY TESTING" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    # Note: This would require Playwright installation for full testing
    # For now, we'll test user-agent specific responses
    
    $userAgents = @(
        @{Name="Chrome"; Agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"},
        @{Name="Firefox"; Agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0"},
        @{Name="Edge"; Agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"},
        @{Name="Safari"; Agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15"}
    )
    
    foreach ($ua in $userAgents) {
        Write-Host "`n🔍 Testing with $($ua.Name)" -ForegroundColor Cyan
        
        try {
            $headers = @{"User-Agent" = $ua.Agent}
            $response = Invoke-WebRequest -Uri "http://localhost:8006/" -Headers $headers -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                Add-TestResult "Cross-Browser Testing" "MemorAI Frontend - $($ua.Name)" "PASS" "Responsive to $($ua.Name)" "200" $response.StatusCode 0
            } else {
                Add-TestResult "Cross-Browser Testing" "MemorAI Frontend - $($ua.Name)" "WARN" "HTTP $($response.StatusCode)" "200" $response.StatusCode 0
            }
            
        } catch {
            Add-TestResult "Cross-Browser Testing" "MemorAI Frontend - $($ua.Name)" "FAIL" $_.Exception.Message "200" "Error" 0
        }
    }
}

# =============================================================================
# GENERATE COMPREHENSIVE TEST REPORT
# =============================================================================
Write-Host "`n📊 GENERATING COMPREHENSIVE FRONTEND TEST REPORT" -ForegroundColor Cyan
Write-Host "=" * 80

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object Status -eq "PASS").Count  
$failedTests = ($testResults | Where-Object Status -eq "FAIL").Count
$warnTests = ($testResults | Where-Object Status -eq "WARN").Count
$skippedTests = ($testResults | Where-Object Status -eq "SKIP").Count

$successRate = if($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "`n🎯 FRONTEND & USER EXPERIENCE SUMMARY:" -ForegroundColor Yellow
Write-Host "   Total Tests Executed: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $passedTests ($([math]::Round(($passedTests / $totalTests) * 100, 1))%)" -ForegroundColor Green
Write-Host "   ❌ Failed: $failedTests ($([math]::Round(($failedTests / $totalTests) * 100, 1))%)" -ForegroundColor Red  
Write-Host "   ⚠️  Warnings: $warnTests ($([math]::Round(($warnTests / $totalTests) * 100, 1))%)" -ForegroundColor Yellow
Write-Host "   ⏭️  Skipped: $skippedTests ($([math]::Round(($skippedTests / $totalTests) * 100, 1))%)" -ForegroundColor Cyan
Write-Host "   📈 Overall Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 60) { "Yellow" } else { "Red" })

# Category breakdown
Write-Host "`n📋 CATEGORY BREAKDOWN:" -ForegroundColor Yellow
$categories = $testResults | Group-Object Category
foreach ($category in $categories) {
    $categoryPassed = ($category.Group | Where-Object Status -eq "PASS").Count
    $categoryTotal = $category.Count
    $categoryRate = if ($categoryTotal -gt 0) { [math]::Round(($categoryPassed / $categoryTotal) * 100, 1) } else { 0 }
    
    Write-Host "   $($category.Name): $categoryPassed/$categoryTotal ($categoryRate%)" -ForegroundColor $(if ($categoryRate -gt 80) { "Green" } elseif ($categoryRate -gt 60) { "Yellow" } else { "Red" })
}

# Performance metrics summary
$performanceTests = $testResults | Where-Object Category -eq "Performance Testing" | Where-Object MetricValue -ne $null
if ($performanceTests) {
    Write-Host "`n⚡ PERFORMANCE SUMMARY:" -ForegroundColor Yellow
    $avgLoadTime = ($performanceTests | Where-Object TestName -like "*Load Time*" | ForEach-Object { 
        [float]($_.MetricValue -replace 'ms', '') 
    } | Measure-Object -Average).Average
    
    if ($avgLoadTime) {
        Write-Host "   Average Load Time: $([math]::Round($avgLoadTime, 2))ms" -ForegroundColor White
    }
}

# Accessibility compliance summary
$accessibilityTests = $testResults | Where-Object Category -eq "Accessibility Testing" | Where-Object Status -eq "PASS"
$totalAccessibilityTests = ($testResults | Where-Object Category -eq "Accessibility Testing").Count
if ($totalAccessibilityTests -gt 0) {
    $accessibilityScore = [math]::Round(($accessibilityTests.Count / $totalAccessibilityTests) * 100, 1)
    Write-Host "`n♿ ACCESSIBILITY COMPLIANCE: $accessibilityScore%" -ForegroundColor $(if ($accessibilityScore -gt 80) { "Green" } elseif ($accessibilityScore -gt 60) { "Yellow" } else { "Red" })
}

# Export results if requested
if ($ExportResults) {
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $jsonFile = Join-Path $OutputPath "frontend-ux-test-results-$timestamp.json"
    
    $testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $jsonFile -Encoding UTF8
    
    Write-Host "`n💾 Results exported to: $jsonFile" -ForegroundColor Green
}

# Show failed tests
if ($failedTests -gt 0) {
    Write-Host "`n❌ FAILED TESTS REQUIRING ATTENTION:" -ForegroundColor Red
    $testResults | Where-Object Status -eq "FAIL" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Red
    }
}

# Show warnings
if ($warnTests -gt 0) {
    Write-Host "`n⚠️ WARNINGS FOR OPTIMIZATION:" -ForegroundColor Yellow
    $testResults | Where-Object Status -eq "WARN" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Yellow
    }
}

Write-Host "`n⏰ Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "🎉 Frontend & User Experience testing complete!" -ForegroundColor Magenta