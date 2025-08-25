#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Service Readi                    Write-ColorOutput "    ❌ Could not free port ${port}: $($_.Exception.Message)" $Redess Validator
# Pre-deployment readiness assessment following Microsoft Azure ML standards
# ==============================================================================

param(
    [switch]$Fix,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-ColorOutput {
    param($Message, $Color = "White")
    if ($Color -eq "Green") { Write-Host $Message -ForegroundColor Green }
    elseif ($Color -eq "Red") { Write-Host $Message -ForegroundColor Red }
    elseif ($Color -eq "Yellow") { Write-Host $Message -ForegroundColor Yellow }
    elseif ($Color -eq "Cyan") { Write-Host $Message -ForegroundColor Cyan }
    else { Write-Host $Message }
}

function Write-Section {
    param($Title)
    Write-ColorOutput "`n==============================================================================`n$Title`n==============================================================================" $Cyan
}

Write-Section "🚀 RomAI AGI SERVICE READINESS VALIDATOR"
Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $Yellow
Write-ColorOutput "Mode: $(if ($Fix) { 'Fix Issues Automatically' } else { 'Assessment Only' })" $Yellow

$readinessChecks = @()
$criticalIssues = @()

# ==============================================================================
# INFRASTRUCTURE READINESS CHECKS
# ==============================================================================

Write-Section "🔧 INFRASTRUCTURE READINESS"

# Check Docker
Write-ColorOutput "🐳 Checking Docker..." $Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion -match "Docker version (\d+\.\d+)") {
        $version = [version]$matches[1]
        if ($version -ge [version]"20.0") {
            Write-ColorOutput "  ✅ Docker $($matches[1]) - OK" $Green
            $readinessChecks += @{ Check = "Docker Version"; Status = "PASS"; Details = $dockerVersion }
        }
        else {
            Write-ColorOutput "  ⚠️  Docker $($matches[1]) - Version too old (need 20.0+)" $Yellow
            $readinessChecks += @{ Check = "Docker Version"; Status = "WARNING"; Details = "Version $($matches[1]) may have compatibility issues" }
        }
    }
    else {
        throw "Could not parse Docker version"
    }
}
catch {
    Write-ColorOutput "  ❌ Docker not available or not working" $Red
    $criticalIssues += "Docker is required but not available"
    $readinessChecks += @{ Check = "Docker"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Check Docker Compose
Write-ColorOutput "🐳 Checking Docker Compose..." $Yellow
try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        Write-ColorOutput "  ✅ Docker Compose available - OK" $Green
        $readinessChecks += @{ Check = "Docker Compose"; Status = "PASS"; Details = $composeVersion }
    }
    else {
        throw "Docker Compose not found"
    }
}
catch {
    Write-ColorOutput "  ❌ Docker Compose not available" $Red
    $criticalIssues += "Docker Compose is required for orchestration"
    $readinessChecks += @{ Check = "Docker Compose"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Check required ports are free
Write-ColorOutput "🌐 Checking port availability..." $Yellow
$requiredPorts = @(5432, 6379, 4180, 6101, 8001, 6100, 9090, 3000)
$busyPorts = @()

foreach ($port in $requiredPorts) {
    try {
        $portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($portInUse) {
            $busyPorts += $port
            Write-ColorOutput "  ⚠️  Port $port is already in use" $Yellow
        }
        else {
            Write-Verbose "  ✅ Port $port is available"
        }
    }
    catch {
        Write-Verbose "  ✅ Port $port is available"
    }
}

if ($busyPorts.Count -eq 0) {
    Write-ColorOutput "  ✅ All required ports are available" $Green
    $readinessChecks += @{ Check = "Port Availability"; Status = "PASS"; Details = "Ports: $($requiredPorts -join ', ')" }
}
else {
    Write-ColorOutput "  ⚠️  Some ports are busy: $($busyPorts -join ', ')" $Yellow
    $readinessChecks += @{ Check = "Port Availability"; Status = "WARNING"; Details = "Busy ports: $($busyPorts -join ', ')" }
    
    if ($Fix) {
        Write-ColorOutput "  🔧 Attempting to free busy ports..." $Cyan
        foreach ($port in $busyPorts) {
            try {
                $processes = Get-NetTCPConnection -LocalPort $port | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
                foreach ($process in $processes) {
                    if ($process.Name -match "docker|node|python") {
                        Write-ColorOutput "    🛑 Stopping process $($process.Name) (PID: $($process.Id)) using port $port" $Yellow
                        Stop-Process -Id $process.Id -Force
                    }
                }
            }
            catch {
                Write-ColorOutput "    ❌ Could not free port ${port}: $($_.Exception.Message)" $Red
            }
        }
    }
}

# ==============================================================================
# DIRECTORY STRUCTURE READINESS
# ==============================================================================

Write-Section "📁 DIRECTORY STRUCTURE READINESS"

$requiredDirectories = @(
    "data/postgres", "data/redis", "data/cbd", "data/models", "data/agi",
    "logs/agi", "logs/api", "logs/nginx",
    "data/prometheus", "data/grafana", "backups",
    "config/nginx", "config/prometheus", "config/grafana",
    "ssl", "secrets"
)

$missingDirectories = @()
foreach ($dir in $requiredDirectories) {
    if (-not (Test-Path $dir)) {
        $missingDirectories += $dir
        Write-Verbose "  ❌ Missing directory: $dir"
    }
    else {
        Write-Verbose "  ✅ Directory exists: $dir"
    }
}

if ($missingDirectories.Count -eq 0) {
    Write-ColorOutput "✅ All required directories exist" $Green
    $readinessChecks += @{ Check = "Directory Structure"; Status = "PASS"; Details = "$($requiredDirectories.Count) directories verified" }
}
else {
    Write-ColorOutput "⚠️  Missing directories: $($missingDirectories.Count)" $Yellow
    $readinessChecks += @{ Check = "Directory Structure"; Status = "WARNING"; Details = "Missing: $($missingDirectories -join ', ')" }
    
    if ($Fix) {
        Write-ColorOutput "🔧 Creating missing directories..." $Cyan
        foreach ($dir in $missingDirectories) {
            try {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-ColorOutput "  ✅ Created: $dir" $Green
            }
            catch {
                Write-ColorOutput "  ❌ Failed to create: $dir - $($_.Exception.Message)" $Red
                $criticalIssues += "Could not create required directory: $dir"
            }
        }
    }
}

# ==============================================================================
# CONFIGURATION FILES READINESS
# ==============================================================================

Write-Section "⚙️ CONFIGURATION FILES READINESS"

$configFiles = @(
    @{ Path = "docker-compose.production.yml"; Required = $true; Description = "Production Docker Compose" },
    @{ Path = "deploy-production.ps1"; Required = $true; Description = "Deployment Script" },
    @{ Path = ".env.example"; Required = $false; Description = "Environment Template" }
)

foreach ($configFile in $configFiles) {
    if (Test-Path $configFile.Path) {
        $fileSize = (Get-Item $configFile.Path).Length
        Write-ColorOutput "  ✅ $($configFile.Description): $(Split-Path $configFile.Path -Leaf) ($fileSize bytes)" $Green
        $readinessChecks += @{ Check = $configFile.Description; Status = "PASS"; Details = "File exists, $fileSize bytes" }
    }
    else {
        if ($configFile.Required) {
            Write-ColorOutput "  ❌ $($configFile.Description): $(Split-Path $configFile.Path -Leaf) - MISSING" $Red
            $criticalIssues += "Required configuration file missing: $($configFile.Path)"
            $readinessChecks += @{ Check = $configFile.Description; Status = "FAIL"; Details = "Required file missing" }
        }
        else {
            Write-ColorOutput "  ⚠️  $($configFile.Description): $(Split-Path $configFile.Path -Leaf) - Optional file missing" $Yellow
            $readinessChecks += @{ Check = $configFile.Description; Status = "WARNING"; Details = "Optional file missing" }
        }
    }
}

# ==============================================================================
# DOCKER IMAGE READINESS
# ==============================================================================

Write-Section "🎯 DOCKER IMAGE READINESS"

Write-ColorOutput "🔍 Checking for existing Docker images..." $Yellow
try {
    $images = docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>$null
    $romaiImages = $images | Select-String -Pattern "romai"
    
    if ($romaiImages) {
        Write-ColorOutput "  ✅ RomAI Docker images found:" $Green
        $romaiImages | ForEach-Object { Write-ColorOutput "    • $($_.Line)" "White" }
        $readinessChecks += @{ Check = "Docker Images"; Status = "PASS"; Details = "RomAI images available for deployment" }
    }
    else {
        Write-ColorOutput "  ⚠️  No RomAI Docker images found - will build during deployment" $Yellow
        $readinessChecks += @{ Check = "Docker Images"; Status = "WARNING"; Details = "Images will be built during deployment" }
    }
}
catch {
    Write-ColorOutput "  ❌ Error checking Docker images: $($_.Exception.Message)" $Red
    $readinessChecks += @{ Check = "Docker Images"; Status = "FAIL"; Details = $_.Exception.Message }
}

# ==============================================================================
# SYSTEM RESOURCES READINESS
# ==============================================================================

Write-Section "💻 SYSTEM RESOURCES READINESS"

# Check available memory
try {
    $totalMemory = Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum | ForEach-Object {[Math]::Round(($_.sum / 1GB),2)}
    $availableMemory = Get-CimInstance Win32_OperatingSystem | ForEach-Object {[Math]::Round(($_.FreePhysicalMemory / 1MB),2)}
    
    Write-ColorOutput "💾 System Memory:" $Yellow
    Write-ColorOutput "  Total: ${totalMemory}GB" "White"
    Write-ColorOutput "  Available: ${availableMemory}GB" "White"
    
    if ($totalMemory -ge 8) {
        Write-ColorOutput "  ✅ Sufficient memory for RomAI AGI deployment" $Green
        $readinessChecks += @{ Check = "System Memory"; Status = "PASS"; Details = "${totalMemory}GB total, ${availableMemory}GB available" }
    }
    else {
        Write-ColorOutput "  ⚠️  Low memory - recommend 8GB+ for optimal performance" $Yellow
        $readinessChecks += @{ Check = "System Memory"; Status = "WARNING"; Details = "Only ${totalMemory}GB total - recommend 8GB+" }
    }
}
catch {
    Write-ColorOutput "  ❌ Could not check memory: $($_.Exception.Message)" $Red
    $readinessChecks += @{ Check = "System Memory"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Check disk space
try {
    $diskSpace = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "C:" } | ForEach-Object {
        @{
            TotalGB = [Math]::Round($_.Size / 1GB, 2)
            FreeGB = [Math]::Round($_.FreeSpace / 1GB, 2)
        }
    }
    
    Write-ColorOutput "💽 Disk Space (C:):" $Yellow
    Write-ColorOutput "  Total: $($diskSpace.TotalGB)GB" "White"
    Write-ColorOutput "  Free: $($diskSpace.FreeGB)GB" "White"
    
    if ($diskSpace.FreeGB -ge 20) {
        Write-ColorOutput "  ✅ Sufficient disk space" $Green
        $readinessChecks += @{ Check = "Disk Space"; Status = "PASS"; Details = "$($diskSpace.FreeGB)GB free of $($diskSpace.TotalGB)GB" }
    }
    else {
        Write-ColorOutput "  ⚠️  Low disk space - recommend 20GB+ free" $Yellow
        $readinessChecks += @{ Check = "Disk Space"; Status = "WARNING"; Details = "Only $($diskSpace.FreeGB)GB free - recommend 20GB+" }
    }
}
catch {
    Write-ColorOutput "  ❌ Could not check disk space: $($_.Exception.Message)" $Red
    $readinessChecks += @{ Check = "Disk Space"; Status = "FAIL"; Details = $_.Exception.Message }
}

# ==============================================================================
# FINAL READINESS ASSESSMENT
# ==============================================================================

Write-Section "📊 READINESS ASSESSMENT SUMMARY"

$passCount = ($readinessChecks | Where-Object { $_.Status -eq "PASS" }).Count
$warningCount = ($readinessChecks | Where-Object { $_.Status -eq "WARNING" }).Count
$failCount = ($readinessChecks | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $readinessChecks.Count

Write-ColorOutput "Total Checks: $totalCount" "White"
Write-ColorOutput "✅ Passed: $passCount" $Green
Write-ColorOutput "⚠️  Warnings: $warningCount" $Yellow
Write-ColorOutput "❌ Failed: $failCount" $Red

Write-Host ""

if ($criticalIssues.Count -eq 0) {
    Write-ColorOutput "🎉 DEPLOYMENT READY!" $Green
    Write-ColorOutput "All critical requirements met. System ready for RomAI AGI deployment." $Green
    $deploymentReady = $true
}
else {
    Write-ColorOutput "🚫 DEPLOYMENT NOT READY" $Red
    Write-ColorOutput "Critical issues must be resolved before deployment:" $Red
    foreach ($issue in $criticalIssues) {
        Write-ColorOutput "  • $issue" $Red
    }
    $deploymentReady = $false
}

if ($warningCount -gt 0) {
    Write-ColorOutput "`n💡 Recommendations:" $Cyan
    $warnings = $readinessChecks | Where-Object { $_.Status -eq "WARNING" }
    foreach ($warning in $warnings) {
        Write-ColorOutput "  • $($warning.Check): $($warning.Details)" $Yellow
    }
}

# Save assessment to JSON file
$assessmentResults = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    DeploymentReady = $deploymentReady
    TotalChecks = $totalCount
    PassedChecks = $passCount
    WarningChecks = $warningCount
    FailedChecks = $failCount
    CriticalIssues = $criticalIssues
    CheckResults = $readinessChecks
} | ConvertTo-Json -Depth 5

$assessmentFile = "readiness-assessment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$assessmentResults | Out-File -FilePath $assessmentFile -Encoding UTF8

Write-ColorOutput "`n💾 Assessment saved to: $assessmentFile" $Cyan

if ($deploymentReady) {
    Write-ColorOutput "`n🚀 Next Steps:" $Green
    Write-ColorOutput "  1. Run: .\deploy-production.ps1 -Action deploy" "White"
    Write-ColorOutput "  2. Monitor: .\health-check-comprehensive.ps1 -Continuous" "White"
    Write-ColorOutput "  3. Validate: .\health-check-quick.ps1" "White"
}
else {
    Write-ColorOutput "`n🔧 Fix Issues:" $Yellow
    Write-ColorOutput "  Run with -Fix parameter to automatically resolve issues where possible" "White"
    Write-ColorOutput "  Example: .\service-readiness-validator.ps1 -Fix" "White"
}

# Exit with appropriate code
exit $(if ($deploymentReady) { 0 } else { 1 })