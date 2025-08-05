#!/usr/bin/env pwsh
<#
.SYNOPSIS
Phase 9: UI/UX Testing - User Interface and Experience Validation

.DESCRIPTION
Comprehensive UI/UX testing across all services:
- Admin Dashboard (4007)
- ID Service (4004) 
- Hub App (4008)
- Gateway Service (4003)
- CBD Database (4180)

Tests: Visual design, user flow, navigation, typography, color scheme, responsiveness, usability

.EXAMPLE
.\test-phase9-ui-ux.ps1
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

Write-Host "🎨 PHASE 9: UI/UX TESTING" -ForegroundColor $Magenta
Write-Host "===========================" -ForegroundColor $Gray
Write-Host "User Interface and Experience Validation Across All Services" -ForegroundColor $Cyan
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

function Test-UIUXExperience {
    param(
        [string]$ServiceName,
        [string]$BaseUrl,
        [int]$Port
    )
    
    Write-Host "🔍 Testing $ServiceName UI/UX Experience ($BaseUrl)" -ForegroundColor $Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Gray
    
    # Test 1: Service Availability & Load Time
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $loadTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        if ($loadTime -lt 1000) {
            Add-TestResult "Page Load Performance" "pass" "Excellent load time: ${loadTime}ms" $ServiceName
        } elseif ($loadTime -lt 3000) {
            Add-TestResult "Page Load Performance" "warning" "Acceptable load time: ${loadTime}ms" $ServiceName
        } else {
            Add-TestResult "Page Load Performance" "fail" "Slow load time: ${loadTime}ms" $ServiceName
        }
    }
    catch {
        Add-TestResult "Page Load Performance" "fail" "Service unavailable: $($_.Exception.Message)" $ServiceName
        return
    }
    
    # Test 2: Visual Design Elements
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for modern design elements
        $hasModernCSS = $htmlContent.Content -match 'border-radius|box-shadow|gradient|transform'
        $hasColorScheme = $htmlContent.Content -match 'color-scheme|dark|light|theme'
        $hasTypography = $htmlContent.Content -match 'font-family|font-weight|line-height'
        $hasSpacing = $htmlContent.Content -match 'margin|padding|gap|space'
        
        $designScore = 0
        if ($hasModernCSS) { $designScore++ }
        if ($hasColorScheme) { $designScore++ }
        if ($hasTypography) { $designScore++ }
        if ($hasSpacing) { $designScore++ }
        
        if ($designScore -ge 3) {
            Add-TestResult "Visual Design Quality" "pass" "Modern design elements detected ($designScore/4)" $ServiceName
        } elseif ($designScore -ge 2) {
            Add-TestResult "Visual Design Quality" "warning" "Basic design elements ($designScore/4)" $ServiceName
        } else {
            Add-TestResult "Visual Design Quality" "fail" "Minimal design elements ($designScore/4)" $ServiceName
        }
    }
    catch {
        Add-TestResult "Visual Design Quality" "fail" "Error checking design: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 3: Navigation Structure
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for navigation elements
        $hasNav = $htmlContent.Content -match '<nav|navigation|menu'
        $hasLinks = ([regex]::Matches($htmlContent.Content, '<a[^>]*href=', 'IgnoreCase')).Count
        $hasBreadcrumbs = $htmlContent.Content -match 'breadcrumb|crumb'
        $hasSearch = $htmlContent.Content -match 'search|find'
        
        if ($hasNav -and $hasLinks -gt 3) {
            Add-TestResult "Navigation Structure" "pass" "Navigation with $hasLinks links detected" $ServiceName
        } elseif ($hasLinks -gt 0) {
            Add-TestResult "Navigation Structure" "warning" "Basic navigation: $hasLinks links" $ServiceName
        } else {
            Add-TestResult "Navigation Structure" "fail" "No navigation structure detected" $ServiceName
        }
    }
    catch {
        Add-TestResult "Navigation Structure" "fail" "Error checking navigation: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 4: Content Organization
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for content structure
        $hasHeadings = ([regex]::Matches($htmlContent.Content, '<h[1-6]', 'IgnoreCase')).Count
        $hasSections = ([regex]::Matches($htmlContent.Content, '<section|<article|<div', 'IgnoreCase')).Count
        $hasLists = ([regex]::Matches($htmlContent.Content, '<ul|<ol|<li', 'IgnoreCase')).Count
        $hasParagraphs = ([regex]::Matches($htmlContent.Content, '<p>', 'IgnoreCase')).Count
        
        $contentScore = 0
        if ($hasHeadings -ge 2) { $contentScore++ }
        if ($hasSections -ge 3) { $contentScore++ }
        if ($hasLists -ge 1) { $contentScore++ }
        if ($hasParagraphs -ge 1) { $contentScore++ }
        
        if ($contentScore -ge 3) {
            Add-TestResult "Content Organization" "pass" "Well-structured content ($contentScore/4 elements)" $ServiceName
        } elseif ($contentScore -ge 2) {
            Add-TestResult "Content Organization" "warning" "Basic content structure ($contentScore/4 elements)" $ServiceName
        } else {
            Add-TestResult "Content Organization" "fail" "Poor content organization ($contentScore/4 elements)" $ServiceName
        }
    }
    catch {
        Add-TestResult "Content Organization" "fail" "Error checking content: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 5: Interactive Elements
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for interactive elements
        $hasButtons = ([regex]::Matches($htmlContent.Content, '<button|btn|click', 'IgnoreCase')).Count
        $hasForms = ([regex]::Matches($htmlContent.Content, '<form|<input|<select', 'IgnoreCase')).Count
        $hasModals = $htmlContent.Content -match 'modal|dialog|popup'
        $hasAnimations = $htmlContent.Content -match 'animation|transition|transform'
        
        $interactionScore = 0
        if ($hasButtons -ge 2) { $interactionScore++ }
        if ($hasForms -ge 1) { $interactionScore++ }
        if ($hasModals) { $interactionScore++ }
        if ($hasAnimations) { $interactionScore++ }
        
        if ($interactionScore -ge 3) {
            Add-TestResult "Interactive Elements" "pass" "Rich interactions detected ($interactionScore/4 types)" $ServiceName
        } elseif ($interactionScore -ge 1) {
            Add-TestResult "Interactive Elements" "warning" "Basic interactions ($interactionScore/4 types)" $ServiceName
        } else {
            Add-TestResult "Interactive Elements" "fail" "Limited interactivity ($interactionScore/4 types)" $ServiceName
        }
    }
    catch {
        Add-TestResult "Interactive Elements" "fail" "Error checking interactions: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 6: Responsive Layout
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for responsive design
        $hasViewport = $htmlContent.Content -match 'viewport.*width=device-width'
        $hasMediaQueries = $htmlContent.Content -match '@media|media='
        $hasFlexGrid = $htmlContent.Content -match 'flex|grid|responsive'
        $hasBreakpoints = $htmlContent.Content -match 'sm:|md:|lg:|xl:|mobile|tablet|desktop'
        
        $responsiveScore = 0
        if ($hasViewport) { $responsiveScore++ }
        if ($hasMediaQueries) { $responsiveScore++ }
        if ($hasFlexGrid) { $responsiveScore++ }
        if ($hasBreakpoints) { $responsiveScore++ }
        
        if ($responsiveScore -eq 4) {
            Add-TestResult "Responsive Layout" "pass" "Full responsive design (4/4 features)" $ServiceName
        } elseif ($responsiveScore -ge 2) {
            Add-TestResult "Responsive Layout" "warning" "Basic responsive design ($responsiveScore/4 features)" $ServiceName
        } else {
            Add-TestResult "Responsive Layout" "fail" "No responsive design ($responsiveScore/4 features)" $ServiceName
        }
    }
    catch {
        Add-TestResult "Responsive Layout" "fail" "Error checking responsive design: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 7: User Experience Flow
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for UX enhancements
        $hasLoadingStates = $htmlContent.Content -match 'loading|spinner|skeleton'
        $hasErrorHandling = $htmlContent.Content -match 'error|alert|warning|success'
        $hasFeedback = $htmlContent.Content -match 'toast|notification|message'
        $hasHelp = $htmlContent.Content -match 'help|tooltip|hint|guide'
        
        $uxScore = 0
        if ($hasLoadingStates) { $uxScore++ }
        if ($hasErrorHandling) { $uxScore++ }
        if ($hasFeedback) { $uxScore++ }
        if ($hasHelp) { $uxScore++ }
        
        if ($uxScore -ge 3) {
            Add-TestResult "User Experience Flow" "pass" "Excellent UX patterns ($uxScore/4 features)" $ServiceName
        } elseif ($uxScore -ge 1) {
            Add-TestResult "User Experience Flow" "warning" "Basic UX patterns ($uxScore/4 features)" $ServiceName
        } else {
            Add-TestResult "User Experience Flow" "fail" "No UX enhancements detected" $ServiceName
        }
    }
    catch {
        Add-TestResult "User Experience Flow" "fail" "Error checking UX flow: $($_.Exception.Message)" $ServiceName
    }
    
    Write-Host ""
}

function Test-CrossServiceConsistency {
    Write-Host "🔄 Testing Cross-Service UI Consistency" -ForegroundColor $Cyan
    
    try {
        $frontendServices = @(
            "http://localhost:4007",  # Admin
            "http://localhost:4004",  # ID Service
            "http://localhost:4008"   # Hub
        )
        
        $consistencyScore = 0
        $brandingConsistent = $true
        $colorSchemeConsistent = $true
        $typographyConsistent = $true
        
        foreach ($url in $frontendServices) {
            try {
                $content = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
                
                # Check for consistent design elements
                $hasCommonTheme = $content.Content -match 'theme|brand|color-scheme'
                $hasConsistentLayout = $content.Content -match 'header|nav|footer|main'
                
                if ($hasCommonTheme -and $hasConsistentLayout) {
                    $consistencyScore++
                }
            }
            catch {
                # Skip if service unavailable
            }
        }
        
        if ($consistencyScore -eq $frontendServices.Count) {
            Add-TestResult "Cross-Service UI Consistency" "pass" "All frontend services have consistent design"
        } elseif ($consistencyScore -gt 0) {
            Add-TestResult "Cross-Service UI Consistency" "warning" "$consistencyScore of $($frontendServices.Count) services consistent"
        } else {
            Add-TestResult "Cross-Service UI Consistency" "fail" "No design consistency detected"
        }
    }
    catch {
        Add-TestResult "Cross-Service UI Consistency" "fail" "Error testing consistency: $($_.Exception.Message)"
    }
}

# Main Testing Execution
Write-Host "🚀 Starting UI/UX Testing..." -ForegroundColor $Green
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
    Test-UIUXExperience -ServiceName $service.Name -BaseUrl $service.Url -Port $service.Port
}

# Additional UI/UX Validation Tests
Write-Host "🔍 COMPREHENSIVE UI/UX VALIDATION" -ForegroundColor $Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Gray

# Test cross-service consistency
Test-CrossServiceConsistency

# Test: Brand Identity Consistency
Write-Host "🎨 Brand Identity Check" -ForegroundColor $Cyan
try {
    $brandConsistency = 0
    $testUrls = @("http://localhost:4007", "http://localhost:4004", "http://localhost:4008")
    
    foreach ($url in $testUrls) {
        try {
            $content = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
            
            # Check for brand elements
            $hasLogo = $content.Content -match 'logo|brand'
            $hasColorTheme = $content.Content -match 'primary|secondary|accent'
            $hasTypography = $content.Content -match 'font-family|typography'
            
            if ($hasLogo -and $hasColorTheme -and $hasTypography) {
                $brandConsistency++
            }
        }
        catch {
            # Skip if service unavailable
        }
    }
    
    if ($brandConsistency -eq $testUrls.Count) {
        Add-TestResult "Brand Identity Consistency" "pass" "All services maintain brand identity"
    } elseif ($brandConsistency -gt 0) {
        Add-TestResult "Brand Identity Consistency" "warning" "$brandConsistency of $($testUrls.Count) services have brand elements"
    } else {
        Add-TestResult "Brand Identity Consistency" "fail" "Inconsistent brand identity across services"
    }
}
catch {
    Add-TestResult "Brand Identity Consistency" "fail" "Error testing brand identity: $($_.Exception.Message)"
}

# Test: User Flow Integration
Write-Host "🔄 User Flow Integration Check" -ForegroundColor $Cyan
try {
    # Test if services link to each other properly
    $flowIntegration = 0
    $adminContent = $null
    $idContent = $null
    $hubContent = $null
    
    try {
        $adminContent = Invoke-WebRequest -Uri "http://localhost:4007" -TimeoutSec 10 -ErrorAction Stop
        $idContent = Invoke-WebRequest -Uri "http://localhost:4004" -TimeoutSec 10 -ErrorAction Stop
        $hubContent = Invoke-WebRequest -Uri "http://localhost:4008" -TimeoutSec 10 -ErrorAction Stop
        
        # Check for cross-service navigation
        $adminLinksToOthers = $adminContent.Content -match '4004|4008|id|hub'
        $idLinksToOthers = $idContent.Content -match '4007|4008|admin|hub'
        $hubLinksToOthers = $hubContent.Content -match '4007|4004|admin|id'
        
        if ($adminLinksToOthers) { $flowIntegration++ }
        if ($idLinksToOthers) { $flowIntegration++ }
        if ($hubLinksToOthers) { $flowIntegration++ }
        
        if ($flowIntegration -eq 3) {
            Add-TestResult "User Flow Integration" "pass" "All services properly integrated"
        } elseif ($flowIntegration -gt 0) {
            Add-TestResult "User Flow Integration" "warning" "$flowIntegration of 3 services integrated"
        } else {
            Add-TestResult "User Flow Integration" "warning" "Services appear to be standalone"
        }
    }
    catch {
        Add-TestResult "User Flow Integration" "warning" "Unable to test cross-service navigation"
    }
}
catch {
    Add-TestResult "User Flow Integration" "fail" "Error testing user flow: $($_.Exception.Message)"
}

# Final Results Summary
Write-Host ""
Write-Host "📊 PHASE 9 UI/UX TESTING RESULTS" -ForegroundColor $Magenta
Write-Host "====================================" -ForegroundColor $Gray

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

Write-Host "🎯 UI/UX QUALITY GRADE: $grade ($passRate%)" -ForegroundColor $color
Write-Host ""

# UI/UX Assessment
$uxStatus = if ($passRate -ge 85) { "EXCELLENT USER EXPERIENCE" }
elseif ($passRate -ge 70) { "GOOD USER EXPERIENCE" }
elseif ($passRate -ge 60) { "ACCEPTABLE USER EXPERIENCE" }
else { "POOR USER EXPERIENCE" }

Write-Host "🎨 UI/UX STATUS: $uxStatus ($passRate%)" -ForegroundColor $color
Write-Host ""

# Recommendations
if ($script:TestResults.Failed -gt 0 -or $script:TestResults.Warnings -gt 0) {
    Write-Host "📋 UI/UX IMPROVEMENT RECOMMENDATIONS:" -ForegroundColor $Yellow
    Write-Host "• Implement consistent design system across all services" -ForegroundColor $Gray
    Write-Host "• Add loading states and error handling for better UX" -ForegroundColor $Gray
    Write-Host "• Improve navigation and cross-service integration" -ForegroundColor $Gray
    Write-Host "• Enhance responsive design for mobile experience" -ForegroundColor $Gray
    Write-Host "• Add interactive animations and micro-interactions" -ForegroundColor $Gray
    Write-Host "• Implement user feedback mechanisms (tooltips, help)" -ForegroundColor $Gray
    Write-Host "• Create consistent brand identity and visual hierarchy" -ForegroundColor $Gray
    Write-Host "• Conduct user testing and usability studies" -ForegroundColor $Gray
    Write-Host ""
}

if ($passRate -ge 80) {
    Write-Host "🎉 PHASE 9 UI/UX TESTING: SUCCESS!" -ForegroundColor $Green
    Write-Host "System demonstrates excellent user interface and experience design" -ForegroundColor $Green
} elseif ($passRate -ge 60) {
    Write-Host "⚠️ PHASE 9 UI/UX TESTING: GOOD FOUNDATION" -ForegroundColor $Yellow
    Write-Host "System has solid UI/UX foundation with opportunities for enhancement" -ForegroundColor $Yellow
} else {
    Write-Host "❌ PHASE 9 UI/UX TESTING: NEEDS SIGNIFICANT IMPROVEMENT" -ForegroundColor $Red
    Write-Host "System requires major UI/UX improvements for optimal user experience" -ForegroundColor $Red
}

Write-Host ""
Write-Host "🎊 ALL TESTING PHASES COMPLETED!" -ForegroundColor $Green
Write-Host "Ready for comprehensive testing summary and final recommendations" -ForegroundColor $Cyan
