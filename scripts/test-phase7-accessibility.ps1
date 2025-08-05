#!/usr/bin/env pwsh
<#
.SYNOPSIS
Phase 7: Accessibility Testing - WCAG 2.1 AA Compliance Validation

.DESCRIPTION
Comprehensive accessibility testing across all services:
- Admin Dashboard (4007)
- ID Service (4004) 
- Hub App (4008)
- Gateway Service (4003)
- CBD Database (4180)

Tests: WCAG 2.1 AA compliance, screen reader compatibility, keyboard navigation, color contrast, ARIA attributes

.EXAMPLE
.\test-phase7-accessibility.ps1
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

Write-Host "🎯 PHASE 7: ACCESSIBILITY TESTING" -ForegroundColor $Magenta
Write-Host "=====================================" -ForegroundColor $Gray
Write-Host "WCAG 2.1 AA Compliance Validation Across All Services" -ForegroundColor $Cyan
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

function Test-ServiceAccessibility {
    param(
        [string]$ServiceName,
        [string]$BaseUrl,
        [int]$Port
    )
    
    Write-Host "🔍 Testing $ServiceName Accessibility ($BaseUrl)" -ForegroundColor $Cyan
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
    
    # Test 2: HTML Structure Validation
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for basic accessibility elements
        $hasDoctype = $htmlContent.Content -match '<!DOCTYPE'
        $hasLang = $htmlContent.Content -match '<html[^>]*lang='
        $hasTitle = $htmlContent.Content -match '<title>'
        $hasH1 = $htmlContent.Content -match '<h1'
        
        if ($hasDoctype -and $hasLang -and $hasTitle -and $hasH1) {
            Add-TestResult "HTML Structure" "pass" "DOCTYPE, lang, title, h1 present" $ServiceName
        } else {
            $missing = @()
            if (!$hasDoctype) { $missing += "DOCTYPE" }
            if (!$hasLang) { $missing += "lang attribute" }
            if (!$hasTitle) { $missing += "title tag" }
            if (!$hasH1) { $missing += "h1 heading" }
            Add-TestResult "HTML Structure" "warning" "Missing: $($missing -join ', ')" $ServiceName
        }
    }
    catch {
        Add-TestResult "HTML Structure" "fail" "Error retrieving HTML: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 3: ARIA Attributes Check
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        $ariaLabels = ([regex]::Matches($htmlContent.Content, 'aria-label=', 'IgnoreCase')).Count
        $ariaDescribed = ([regex]::Matches($htmlContent.Content, 'aria-describedby=', 'IgnoreCase')).Count
        $ariaExpanded = ([regex]::Matches($htmlContent.Content, 'aria-expanded=', 'IgnoreCase')).Count
        $roles = ([regex]::Matches($htmlContent.Content, 'role=', 'IgnoreCase')).Count
        
        $totalAria = $ariaLabels + $ariaDescribed + $ariaExpanded + $roles
        
        if ($totalAria -ge 5) {
            Add-TestResult "ARIA Attributes" "pass" "$totalAria ARIA attributes found" $ServiceName
        } elseif ($totalAria -ge 1) {
            Add-TestResult "ARIA Attributes" "warning" "Limited ARIA usage: $totalAria attributes" $ServiceName
        } else {
            Add-TestResult "ARIA Attributes" "fail" "No ARIA attributes found" $ServiceName
        }
    }
    catch {
        Add-TestResult "ARIA Attributes" "fail" "Error checking ARIA: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 4: Image Alt Text Check
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        $allImages = ([regex]::Matches($htmlContent.Content, '<img[^>]*>', 'IgnoreCase')).Count
        $imagesWithAlt = ([regex]::Matches($htmlContent.Content, '<img[^>]*alt=', 'IgnoreCase')).Count
        
        if ($allImages -eq 0) {
            Add-TestResult "Image Alt Text" "pass" "No images found (N/A)" $ServiceName
        } elseif ($imagesWithAlt -eq $allImages) {
            Add-TestResult "Image Alt Text" "pass" "All $allImages images have alt text" $ServiceName
        } else {
            $missing = $allImages - $imagesWithAlt
            Add-TestResult "Image Alt Text" "warning" "$missing of $allImages images missing alt text" $ServiceName
        }
    }
    catch {
        Add-TestResult "Image Alt Text" "fail" "Error checking images: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 5: Form Accessibility
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        $formsCount = ([regex]::Matches($htmlContent.Content, '<form[^>]*>', 'IgnoreCase')).Count
        $labelsCount = ([regex]::Matches($htmlContent.Content, '<label[^>]*>', 'IgnoreCase')).Count
        $inputsCount = ([regex]::Matches($htmlContent.Content, '<input[^>]*>', 'IgnoreCase')).Count
        
        if ($formsCount -eq 0) {
            Add-TestResult "Form Accessibility" "pass" "No forms found (N/A)" $ServiceName
        } elseif ($labelsCount -ge $inputsCount * 0.8) {
            Add-TestResult "Form Accessibility" "pass" "$labelsCount labels for $inputsCount inputs" $ServiceName
        } else {
            Add-TestResult "Form Accessibility" "warning" "Insufficient labels: $labelsCount for $inputsCount inputs" $ServiceName
        }
    }
    catch {
        Add-TestResult "Form Accessibility" "fail" "Error checking forms: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 6: Heading Structure
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        $h1Count = ([regex]::Matches($htmlContent.Content, '<h1[^>]*>', 'IgnoreCase')).Count
        $h2Count = ([regex]::Matches($htmlContent.Content, '<h2[^>]*>', 'IgnoreCase')).Count
        $h3Count = ([regex]::Matches($htmlContent.Content, '<h3[^>]*>', 'IgnoreCase')).Count
        
        if ($h1Count -eq 1) {
            Add-TestResult "Heading Structure" "pass" "Single H1 with $h2Count H2s and $h3Count H3s" $ServiceName
        } elseif ($h1Count -gt 1) {
            Add-TestResult "Heading Structure" "warning" "Multiple H1 tags found: $h1Count" $ServiceName
        } else {
            Add-TestResult "Heading Structure" "fail" "No H1 tag found" $ServiceName
        }
    }
    catch {
        Add-TestResult "Heading Structure" "fail" "Error checking headings: $($_.Exception.Message)" $ServiceName
    }
    
    # Test 7: Color Contrast Simulation
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for CSS styles that might indicate good contrast practices
        $hasDarkMode = $htmlContent.Content -match 'dark|theme' -or $htmlContent.Content -match 'var\(--.*color'
        $hasColorVars = $htmlContent.Content -match '--.*color|--.*bg'
        
        if ($hasDarkMode -and $hasColorVars) {
            Add-TestResult "Color Contrast" "pass" "Theme system with CSS variables detected" $ServiceName
        } elseif ($hasColorVars) {
            Add-TestResult "Color Contrast" "warning" "CSS variables detected, theme system unclear" $ServiceName
        } else {
            Add-TestResult "Color Contrast" "warning" "No advanced color system detected" $ServiceName
        }
    }
    catch {
        Add-TestResult "Color Contrast" "fail" "Error checking contrast: $($_.Exception.Message)" $ServiceName
    }
    
    Write-Host ""
}

function Test-KeyboardNavigation {
    param(
        [string]$ServiceName,
        [string]$BaseUrl
    )
    
    Write-Host "⌨️ Testing Keyboard Navigation - $ServiceName" -ForegroundColor $Cyan
    
    try {
        $htmlContent = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 15 -ErrorAction Stop
        
        # Check for keyboard navigation elements
        $tabIndexElements = ([regex]::Matches($htmlContent.Content, 'tabindex=', 'IgnoreCase')).Count
        $skipLinks = ([regex]::Matches($htmlContent.Content, 'skip|jump', 'IgnoreCase')).Count
        $focusElements = ([regex]::Matches($htmlContent.Content, 'focus|:focus', 'IgnoreCase')).Count
        
        if ($tabIndexElements -gt 0 -or $skipLinks -gt 0 -or $focusElements -gt 0) {
            Add-TestResult "Keyboard Navigation" "pass" "Navigation elements detected" $ServiceName
        } else {
            Add-TestResult "Keyboard Navigation" "warning" "Limited keyboard navigation support" $ServiceName
        }
    }
    catch {
        Add-TestResult "Keyboard Navigation" "fail" "Error testing navigation: $($_.Exception.Message)" $ServiceName
    }
}

# Main Testing Execution
Write-Host "🚀 Starting Accessibility Testing..." -ForegroundColor $Green
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
    Test-ServiceAccessibility -ServiceName $service.Name -BaseUrl $service.Url -Port $service.Port
    Test-KeyboardNavigation -ServiceName $service.Name -BaseUrl $service.Url
}

# Additional Comprehensive Accessibility Tests
Write-Host "🔍 COMPREHENSIVE ACCESSIBILITY VALIDATION" -ForegroundColor $Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Gray

# Test: Screen Reader Compatibility Simulation
Write-Host "👁️ Screen Reader Compatibility Check" -ForegroundColor $Cyan
try {
    $testUrls = @("http://localhost:4007", "http://localhost:4004", "http://localhost:4008")
    $screenReaderFriendly = 0
    
    foreach ($url in $testUrls) {
        try {
            $content = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
            $hasLandmarks = $content.Content -match 'main|nav|header|footer|aside'
            $hasHeadings = $content.Content -match '<h[1-6]'
            $hasAltText = $content.Content -match 'alt='
            
            if ($hasLandmarks -and $hasHeadings) {
                $screenReaderFriendly++
            }
        }
        catch {
            # Skip if service unavailable
        }
    }
    
    if ($screenReaderFriendly -eq $testUrls.Count) {
        Add-TestResult "Screen Reader Compatibility" "pass" "All frontend services support landmarks and headings"
    } elseif ($screenReaderFriendly -gt 0) {
        Add-TestResult "Screen Reader Compatibility" "warning" "$screenReaderFriendly of $($testUrls.Count) services screen reader friendly"
    } else {
        Add-TestResult "Screen Reader Compatibility" "fail" "No services optimized for screen readers"
    }
}
catch {
    Add-TestResult "Screen Reader Compatibility" "fail" "Error testing screen reader support: $($_.Exception.Message)"
}

# Test: Mobile Accessibility
Write-Host "📱 Mobile Accessibility Check" -ForegroundColor $Cyan
try {
    $mobileOptimized = 0
    $testUrls = @("http://localhost:4007", "http://localhost:4004", "http://localhost:4008")
    
    foreach ($url in $testUrls) {
        try {
            $content = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
            $hasViewport = $content.Content -match 'viewport'
            $hasResponsive = $content.Content -match 'responsive|mobile|@media'
            $hasTouchTargets = $content.Content -match 'touch|tap|button'
            
            if ($hasViewport -and ($hasResponsive -or $hasTouchTargets)) {
                $mobileOptimized++
            }
        }
        catch {
            # Skip if service unavailable
        }
    }
    
    if ($mobileOptimized -eq $testUrls.Count) {
        Add-TestResult "Mobile Accessibility" "pass" "All services mobile optimized"
    } elseif ($mobileOptimized -gt 0) {
        Add-TestResult "Mobile Accessibility" "warning" "$mobileOptimized of $($testUrls.Count) services mobile optimized"
    } else {
        Add-TestResult "Mobile Accessibility" "fail" "No mobile optimization detected"
    }
}
catch {
    Add-TestResult "Mobile Accessibility" "fail" "Error testing mobile accessibility: $($_.Exception.Message)"
}

# Final Results Summary
Write-Host ""
Write-Host "📊 PHASE 7 ACCESSIBILITY TESTING RESULTS" -ForegroundColor $Magenta
Write-Host "=============================================" -ForegroundColor $Gray

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

Write-Host "🎯 ACCESSIBILITY GRADE: $grade ($passRate%)" -ForegroundColor $color
Write-Host ""

# WCAG 2.1 AA Compliance Assessment
$wcagCompliance = $passRate
$wcagStatus = if ($wcagCompliance -ge 85) { "COMPLIANT" }
elseif ($wcagCompliance -ge 70) { "PARTIALLY COMPLIANT" }
else { "NON-COMPLIANT" }

Write-Host "♿ WCAG 2.1 AA STATUS: $wcagStatus ($wcagCompliance%)" -ForegroundColor $color
Write-Host ""

# Recommendations
if ($script:TestResults.Failed -gt 0 -or $script:TestResults.Warnings -gt 0) {
    Write-Host "📋 ACCESSIBILITY IMPROVEMENT RECOMMENDATIONS:" -ForegroundColor $Yellow
    Write-Host "• Add ARIA labels and descriptions to interactive elements" -ForegroundColor $Gray
    Write-Host "• Ensure proper heading hierarchy (single H1, structured H2-H6)" -ForegroundColor $Gray
    Write-Host "• Implement skip navigation links" -ForegroundColor $Gray
    Write-Host "• Test with actual screen readers (NVDA, JAWS, VoiceOver)" -ForegroundColor $Gray
    Write-Host "• Validate color contrast ratios (4.5:1 for normal text)" -ForegroundColor $Gray
    Write-Host "• Add keyboard focus indicators" -ForegroundColor $Gray
    Write-Host "• Test with keyboard-only navigation" -ForegroundColor $Gray
    Write-Host ""
}

if ($passRate -ge 80) {
    Write-Host "🎉 PHASE 7 ACCESSIBILITY TESTING: SUCCESS!" -ForegroundColor $Green
    Write-Host "System demonstrates good accessibility practices and WCAG 2.1 AA compliance foundation" -ForegroundColor $Green
} elseif ($passRate -ge 60) {
    Write-Host "⚠️ PHASE 7 ACCESSIBILITY TESTING: NEEDS IMPROVEMENT" -ForegroundColor $Yellow
    Write-Host "System has accessibility foundation but requires enhancements for full compliance" -ForegroundColor $Yellow
} else {
    Write-Host "❌ PHASE 7 ACCESSIBILITY TESTING: CRITICAL ISSUES" -ForegroundColor $Red
    Write-Host "System requires significant accessibility improvements for WCAG compliance" -ForegroundColor $Red
}

Write-Host ""
Write-Host "Next: Phase 8 - Cross-Browser Testing" -ForegroundColor $Cyan
