#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Phase 4: UI/UX Complete Testing & Validation
.DESCRIPTION
    Comprehensive user interface and user experience testing
    Focus on frontend functionality, accessibility, responsive design, and user workflows
.NOTES
    Author: CODAI Development Team
    Version: 1.0.0
    Date: 2025-01-03
#>

param(
    [switch]$Verbose = $false
)

# Enhanced logging with timestamps and color coding
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO', 'SUCCESS', 'WARNING', 'ERROR')]$Level = 'INFO'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colors = @{
        'INFO' = 'Cyan'
        'SUCCESS' = 'Green'
        'WARNING' = 'Yellow'
        'ERROR' = 'Red'
    }
    
    $color = $colors[$Level]
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-UIAccessibility {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $score = 0
            $checks = @()
            
            # Check for essential HTML structure
            if ($content -match '<html[^>]*lang=') {
                $score += 10
                $checks += "✅ Language attribute present"
            } else {
                $checks += "❌ Missing language attribute"
            }
            
            if ($content -match '<title>') {
                $score += 10
                $checks += "✅ Page title present"
            } else {
                $checks += "❌ Missing page title"
            }
            
            if ($content -match '<meta[^>]*viewport') {
                $score += 10
                $checks += "✅ Viewport meta tag present"
            } else {
                $checks += "❌ Missing viewport meta tag"
            }
            
            # Check for semantic HTML
            if ($content -match '<main|<header|<nav|<footer') {
                $score += 15
                $checks += "✅ Semantic HTML elements present"
            } else {
                $checks += "❌ Missing semantic HTML elements"
            }
            
            # Check for proper heading structure
            if ($content -match '<h1>') {
                $score += 10
                $checks += "✅ H1 heading present"
            } else {
                $checks += "❌ Missing H1 heading"
            }
            
            # Check for alt attributes (basic check)
            if ($content -match 'alt=') {
                $score += 10
                $checks += "✅ Alt attributes found"
            } else {
                $checks += "⚠️ No alt attributes detected"
            }
            
            # Check for ARIA attributes
            if ($content -match 'aria-|role=') {
                $score += 15
                $checks += "✅ ARIA attributes present"
            } else {
                $checks += "❌ No ARIA attributes found"
            }
            
            # Check for focus management
            if ($content -match 'tabindex|focus') {
                $score += 10
                $checks += "✅ Focus management detected"
            } else {
                $checks += "⚠️ Limited focus management"
            }
            
            # Check for responsive design indicators
            if ($content -match 'responsive|mobile|tablet|desktop') {
                $score += 10
                $checks += "✅ Responsive design indicators"
            } else {
                $checks += "⚠️ No responsive design indicators"
            }
            
            $status = if ($score -ge 80) { "EXCELLENT" } 
                     elseif ($score -ge 60) { "GOOD" }
                     elseif ($score -ge 40) { "ACCEPTABLE" }
                     else { "POOR" }
            
            Write-Log "$ServiceName Accessibility Score: $score/100 ($status)" -Level $(if ($score -ge 60) { "SUCCESS" } else { "WARNING" })
            
            if ($Verbose) {
                foreach ($check in $checks) {
                    Write-Log "  $check" -Level INFO
                }
            }
            
            return @{ passed = ($score -ge 40); score = $score; checks = $checks }
        } else {
            Write-Log "$ServiceName`: HTTP $($response.StatusCode)" -Level ERROR
            return @{ passed = $false; score = 0; checks = @("❌ HTTP Error: $($response.StatusCode)") }
        }
    }
    catch {
        Write-Log "$ServiceName`: FAILED - $($_.Exception.Message)" -Level ERROR
        return @{ passed = $false; score = 0; checks = @("❌ Connection Error: $($_.Exception.Message)") }
    }
}

function Test-ResponsiveDesign {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $score = 0
            $checks = @()
            
            # Check for viewport meta tag
            if ($content -match '<meta.*viewport.*width=device-width') {
                $score += 25
                $checks += "✅ Proper viewport meta tag"
            } else {
                $checks += "❌ Missing or incorrect viewport meta tag"
            }
            
            # Check for responsive CSS frameworks
            if ($content -match 'tailwind|bootstrap|foundation|bulma') {
                $score += 20
                $checks += "✅ Responsive CSS framework detected"
            } else {
                $checks += "⚠️ No responsive framework detected"
            }
            
            # Check for media queries
            if ($content -match '@media|breakpoint') {
                $score += 15
                $checks += "✅ Media queries present"
            } else {
                $checks += "❌ No media queries found"
            }
            
            # Check for flexible layouts
            if ($content -match 'flex|grid|col-|row-') {
                $score += 20
                $checks += "✅ Flexible layout system"
            } else {
                $checks += "❌ No flexible layout detected"
            }
            
            # Check for responsive images
            if ($content -match 'srcset|sizes|picture') {
                $score += 10
                $checks += "✅ Responsive images"
            } else {
                $checks += "⚠️ No responsive images detected"
            }
            
            # Check for mobile-friendly navigation
            if ($content -match 'burger|menu|nav|toggle') {
                $score += 10
                $checks += "✅ Mobile navigation elements"
            } else {
                $checks += "⚠️ Limited mobile navigation"
            }
            
            $status = if ($score -ge 80) { "EXCELLENT" } 
                     elseif ($score -ge 60) { "GOOD" }
                     elseif ($score -ge 40) { "ACCEPTABLE" }
                     else { "POOR" }
            
            Write-Log "$ServiceName Responsive Design: $score/100 ($status)" -Level $(if ($score -ge 60) { "SUCCESS" } else { "WARNING" })
            
            return @{ passed = ($score -ge 40); score = $score; checks = $checks }
        }
    }
    catch {
        Write-Log "$ServiceName Responsive Design: FAILED - $($_.Exception.Message)" -Level ERROR
        return @{ passed = $false; score = 0; checks = @("❌ Error: $($_.Exception.Message)") }
    }
}

function Test-UIPerformance {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $end = Get-Date
        
        $loadTime = ($end - $start).TotalMilliseconds
        $contentSize = $response.Content.Length
        
        $performanceScore = 100
        $checks = @()
        
        # Load time scoring
        if ($loadTime -lt 1000) {
            $checks += "✅ Fast load time: ${loadTime}ms"
        } elseif ($loadTime -lt 3000) {
            $performanceScore -= 20
            $checks += "⚠️ Moderate load time: ${loadTime}ms"
        } else {
            $performanceScore -= 40
            $checks += "❌ Slow load time: ${loadTime}ms"
        }
        
        # Content size scoring
        $sizeMB = [math]::Round($contentSize / 1MB, 2)
        if ($sizeMB -lt 1) {
            $checks += "✅ Optimal content size: ${sizeMB}MB"
        } elseif ($sizeMB -lt 3) {
            $performanceScore -= 15
            $checks += "⚠️ Large content size: ${sizeMB}MB"
        } else {
            $performanceScore -= 30
            $checks += "❌ Very large content size: ${sizeMB}MB"
        }
        
        # Check for performance optimizations
        $content = $response.Content
        if ($content -match 'async|defer') {
            $checks += "✅ Script optimization detected"
        } else {
            $performanceScore -= 10
            $checks += "⚠️ No script optimization"
        }
        
        if ($content -match 'preload|prefetch') {
            $checks += "✅ Resource preloading detected"
        } else {
            $performanceScore -= 10
            $checks += "⚠️ No resource preloading"
        }
        
        $status = if ($performanceScore -ge 80) { "EXCELLENT" } 
                 elseif ($performanceScore -ge 60) { "GOOD" }
                 elseif ($performanceScore -ge 40) { "ACCEPTABLE" }
                 else { "POOR" }
        
        Write-Log "$ServiceName Performance: $performanceScore/100 ($status) - ${loadTime}ms, ${sizeMB}MB" -Level $(if ($performanceScore -ge 60) { "SUCCESS" } else { "WARNING" })
        
        return @{ 
            passed = ($performanceScore -ge 40); 
            score = $performanceScore; 
            loadTime = $loadTime;
            contentSize = $sizeMB;
            checks = $checks 
        }
    }
    catch {
        Write-Log "$ServiceName Performance: FAILED - $($_.Exception.Message)" -Level ERROR
        return @{ passed = $false; score = 0; loadTime = 9999; contentSize = 0; checks = @("❌ Error: $($_.Exception.Message)") }
    }
}

function Test-UserExperience {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $score = 0
            $checks = @()
            
            # Check for user-friendly elements
            if ($content -match 'button|btn') {
                $score += 15
                $checks += "✅ Interactive buttons present"
            } else {
                $checks += "❌ No interactive buttons found"
            }
            
            # Check for navigation
            if ($content -match '<nav|navigation|menu') {
                $score += 15
                $checks += "✅ Navigation elements present"
            } else {
                $checks += "❌ No navigation elements"
            }
            
            # Check for forms and inputs
            if ($content -match '<form|<input|<select|<textarea') {
                $score += 15
                $checks += "✅ Form elements present"
            } else {
                $checks += "⚠️ No form elements detected"
            }
            
            # Check for feedback mechanisms
            if ($content -match 'alert|notification|toast|message') {
                $score += 10
                $checks += "✅ User feedback mechanisms"
            } else {
                $checks += "⚠️ No feedback mechanisms"
            }
            
            # Check for loading states
            if ($content -match 'loading|spinner|progress') {
                $score += 10
                $checks += "✅ Loading indicators"
            } else {
                $checks += "⚠️ No loading indicators"
            }
            
            # Check for error handling
            if ($content -match 'error|404|500|exception') {
                $score += 10
                $checks += "✅ Error handling present"
            } else {
                $checks += "⚠️ No error handling detected"
            }
            
            # Check for modern UI patterns
            if ($content -match 'modal|dropdown|tooltip|accordion') {
                $score += 15
                $checks += "✅ Modern UI patterns"
            } else {
                $checks += "⚠️ Limited UI patterns"
            }
            
            # Check for visual consistency
            if ($content -match 'theme|design-system|style-guide') {
                $score += 10
                $checks += "✅ Design system indicators"
            } else {
                $checks += "⚠️ No design system detected"
            }
            
            $status = if ($score -ge 80) { "EXCELLENT" } 
                     elseif ($score -ge 60) { "GOOD" }
                     elseif ($score -ge 40) { "ACCEPTABLE" }
                     else { "POOR" }
            
            Write-Log "$ServiceName User Experience: $score/100 ($status)" -Level $(if ($score -ge 60) { "SUCCESS" } else { "WARNING" })
            
            return @{ passed = ($score -ge 40); score = $score; checks = $checks }
        }
    }
    catch {
        Write-Log "$ServiceName User Experience: FAILED - $($_.Exception.Message)" -Level ERROR
        return @{ passed = $false; score = 0; checks = @("❌ Error: $($_.Exception.Message)") }
    }
}

function Test-ComponentFunctionality {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $score = 0
            $checks = @()
            
            # Check for React/Next.js components
            if ($content -match '_next|react|__NEXT_DATA__') {
                $score += 20
                $checks += "✅ React/Next.js framework detected"
            } else {
                $checks += "⚠️ No React framework detected"
            }
            
            # Check for JavaScript functionality
            if ($content -match '<script') {
                $score += 15
                $checks += "✅ JavaScript present"
            } else {
                $checks += "❌ No JavaScript detected"
            }
            
            # Check for CSS styling
            if ($content -match '<style|<link[^>]*stylesheet|\.css') {
                $score += 15
                $checks += "✅ CSS styling present"
            } else {
                $checks += "❌ No CSS styling detected"
            }
            
            # Check for modern CSS features
            if ($content -match 'tailwind|css-in-js|styled-components') {
                $score += 15
                $checks += "✅ Modern CSS framework"
            } else {
                $checks += "⚠️ No modern CSS framework"
            }
            
            # Check for component state management
            if ($content -match 'useState|useEffect|redux|zustand') {
                $score += 15
                $checks += "✅ State management detected"
            } else {
                $checks += "⚠️ No state management detected"
            }
            
            # Check for API integration
            if ($content -match 'fetch|axios|api|endpoint') {
                $score += 10
                $checks += "✅ API integration present"
            } else {
                $checks += "⚠️ No API integration detected"
            }
            
            # Check for routing
            if ($content -match 'router|route|navigation') {
                $score += 10
                $checks += "✅ Routing functionality"
            } else {
                $checks += "⚠️ No routing detected"
            }
            
            $status = if ($score -ge 80) { "EXCELLENT" } 
                     elseif ($score -ge 60) { "GOOD" }
                     elseif ($score -ge 40) { "ACCEPTABLE" }
                     else { "POOR" }
            
            Write-Log "$ServiceName Component Functionality: $score/100 ($status)" -Level $(if ($score -ge 60) { "SUCCESS" } else { "WARNING" })
            
            return @{ passed = ($score -ge 40); score = $score; checks = $checks }
        }
    }
    catch {
        Write-Log "$ServiceName Component Functionality: FAILED - $($_.Exception.Message)" -Level ERROR
        return @{ passed = $false; score = 0; checks = @("❌ Error: $($_.Exception.Message)") }
    }
}

# Main execution
Write-Log "🎨 Phase 4: UI/UX Complete Testing & Validation"
Write-Log "================================================"
Write-Log "Comprehensive frontend testing: accessibility, responsive design, performance, UX, and functionality"

# Define services to test
$services = @(
    @{ url = "http://localhost:4007"; name = "Admin Dashboard" },
    @{ url = "http://localhost:4004"; name = "ID Service" },
    @{ url = "http://localhost:4008"; name = "Hub Application" }
)

$overallResults = @{}

foreach ($service in $services) {
    Write-Log ""
    Write-Log "🔍 Testing $($service.name) ($($service.url))"
    Write-Log "----------------------------------------"
    
    $serviceResults = @{}
    
    # Test 1: UI Accessibility
    $serviceResults["Accessibility"] = Test-UIAccessibility -Url $service.url -ServiceName $service.name
    
    # Test 2: Responsive Design
    $serviceResults["ResponsiveDesign"] = Test-ResponsiveDesign -Url $service.url -ServiceName $service.name
    
    # Test 3: Performance
    $serviceResults["Performance"] = Test-UIPerformance -Url $service.url -ServiceName $service.name
    
    # Test 4: User Experience
    $serviceResults["UserExperience"] = Test-UserExperience -Url $service.url -ServiceName $service.name
    
    # Test 5: Component Functionality
    $serviceResults["ComponentFunctionality"] = Test-ComponentFunctionality -Url $service.url -ServiceName $service.name
    
    $overallResults[$service.name] = $serviceResults
}

# Summary Report
Write-Log ""
Write-Log "================================================"
Write-Log "📊 Phase 4 UI/UX Testing Summary Report"

$totalPassed = 0
$totalTests = 0
$categoryScores = @{}

foreach ($serviceName in $overallResults.Keys) {
    Write-Log ""
    Write-Log "🏗️ $serviceName Results:"
    
    $serviceResults = $overallResults[$serviceName]
    $servicePassed = 0
    $serviceTotal = 0
    
    foreach ($category in $serviceResults.Keys) {
        $result = $serviceResults[$category]
        $status = if ($result.passed) { "✅ PASSED" } else { "❌ FAILED" }
        $score = if ($result.score) { " ($($result.score)/100)" } else { "" }
        
        Write-Log "  $status $category$score"
        
        if ($result.passed) { $servicePassed++ }
        $serviceTotal++
        
        # Track category scores
        if (-not $categoryScores.ContainsKey($category)) {
            $categoryScores[$category] = @()
        }
        if ($result.score) {
            $categoryScores[$category] += $result.score
        }
    }
    
    $serviceRate = if ($serviceTotal -gt 0) { [math]::Round(($servicePassed / $serviceTotal) * 100, 1) } else { 0 }
    Write-Log "  📊 $serviceName Overall: $servicePassed/$serviceTotal tests passed ($serviceRate%)"
    
    $totalPassed += $servicePassed
    $totalTests += $serviceTotal
}

# Category averages
Write-Log ""
Write-Log "📈 Category Performance Averages:"
foreach ($category in $categoryScores.Keys) {
    $scores = $categoryScores[$category]
    if ($scores.Count -gt 0) {
        $avgScore = [math]::Round(($scores | Measure-Object -Average).Average, 1)
        $status = if ($avgScore -ge 80) { "✅ EXCELLENT" } 
                 elseif ($avgScore -ge 60) { "⚠️ GOOD" }
                 elseif ($avgScore -ge 40) { "⚠️ ACCEPTABLE" }
                 else { "❌ NEEDS WORK" }
        
        Write-Log "  $status $category`: $avgScore/100"
    }
}

# Overall results
$overallRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Log ""
Write-Log "🎯 Overall UI/UX Testing Results:"
Write-Log "  • Total Passed: $totalPassed/$totalTests tests"
Write-Log "  • Overall Success Rate: $overallRate%"

# Performance metrics
$performanceResults = @()
foreach ($serviceName in $overallResults.Keys) {
    $perfResult = $overallResults[$serviceName]["Performance"]
    if ($perfResult -and $perfResult.loadTime) {
        $performanceResults += @{
            service = $serviceName
            loadTime = $perfResult.loadTime
            contentSize = $perfResult.contentSize
        }
    }
}

if ($performanceResults.Count -gt 0) {
    $avgLoadTime = [math]::Round(($performanceResults | Measure-Object -Property loadTime -Average).Average, 2)
    $avgContentSize = [math]::Round(($performanceResults | Measure-Object -Property contentSize -Average).Average, 2)
    
    Write-Log "  • Average Load Time: ${avgLoadTime}ms"
    Write-Log "  • Average Content Size: ${avgContentSize}MB"
}

# Final status determination
if ($overallRate -ge 80) {
    Write-Log "🎉 Phase 4 UI/UX Testing: EXCELLENT RESULTS" -Level SUCCESS
    Write-Log "All frontend applications demonstrate excellent user experience quality"
    exit 0
} elseif ($overallRate -ge 70) {
    Write-Log "✅ Phase 4 UI/UX Testing: GOOD RESULTS" -Level SUCCESS
    Write-Log "Frontend applications show strong user experience with minor improvements needed"
    exit 0
} elseif ($overallRate -ge 60) {
    Write-Log "⚠️ Phase 4 UI/UX Testing: ACCEPTABLE RESULTS" -Level WARNING
    Write-Log "Frontend applications are functional but need UX improvements"
    exit 0
} else {
    Write-Log "❌ Phase 4 UI/UX Testing: NEEDS SIGNIFICANT IMPROVEMENT" -Level ERROR
    Write-Log "Frontend applications require major UX enhancements"
    exit 1
}
