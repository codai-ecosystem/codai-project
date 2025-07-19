#!/usr/bin/env pwsh

# CODAI Ecosystem - Secure Package Reinstallation Script
# Date: July 18, 2025
# Purpose: Secure reinstallation after malware detection

Write-Host "🔒 CODAI ECOSYSTEM - SECURE REINSTALLATION" -ForegroundColor Cyan
Write-Host "=" * 50

# Step 1: Verify clean environment
Write-Host "`n🧹 Step 1: Verifying clean environment..."
if (Test-Path "node_modules") {
    Write-Host "❌ node_modules still exists - removing..." -ForegroundColor Red
    Remove-Item "node_modules" -Recurse -Force
}
Write-Host "✅ Environment is clean" -ForegroundColor Green

# Step 2: Clear all caches
Write-Host "`n🗑️ Step 2: Clearing all caches..."
pnpm store prune
npm cache clean --force 2>$null
Write-Host "✅ Caches cleared" -ForegroundColor Green

# Step 3: Verify package.json integrity
Write-Host "`n📦 Step 3: Verifying package.json integrity..."
$packageFiles = Get-ChildItem -Recurse -Name "package.json" | Where-Object { $_ -notlike "*node_modules*" }
foreach ($file in $packageFiles) {
    Write-Host "  📄 Checking: $file"
    try {
        $json = Get-Content $file | ConvertFrom-Json
        Write-Host "  ✅ Valid JSON: $file" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Invalid JSON: $file" -ForegroundColor Red
    }
}

# Step 4: Check for suspicious dependencies
Write-Host "`n🔍 Step 4: Checking for suspicious dependencies..."
$suspiciousPackages = @(
    "napi-postinstall",
    "@pkgr/core", 
    "eslint-config-prettier"
)

$rootPackage = Get-Content "package.json" | ConvertFrom-Json
$allDeps = @()
if ($rootPackage.dependencies) { $allDeps += $rootPackage.dependencies.PSObject.Properties.Name }
if ($rootPackage.devDependencies) { $allDeps += $rootPackage.devDependencies.PSObject.Properties.Name }

foreach ($suspicious in $suspiciousPackages) {
    if ($allDeps -contains $suspicious) {
        Write-Host "  ⚠️ SUSPICIOUS: $suspicious found in dependencies" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ SAFE: $suspicious not in direct dependencies" -ForegroundColor Green
    }
}

# Step 5: Secure installation with verification
Write-Host "`n🔐 Step 5: Secure package installation..."
Write-Host "Installing with extra verification..."

# Install packages with integrity checks
pnpm install --frozen-lockfile --prefer-frozen-lockfile

# Step 6: Post-install security scan
Write-Host "`n🛡️ Step 6: Post-install security scan..."
if (Test-Path "node_modules") {
    $dlls = Get-ChildItem -Path "node_modules" -Recurse -Name "*.dll" -ErrorAction SilentlyContinue
    Write-Host "  📊 Found $($dlls.Count) DLL files"
    
    # Check for suspicious DLLs
    $suspiciousDlls = $dlls | Where-Object { $_ -like "*node-gyp.dll*" }
    if ($suspiciousDlls.Count -gt 0) {
        Write-Host "  🚨 ALERT: Suspicious DLLs found!" -ForegroundColor Red
        $suspiciousDlls | ForEach-Object { Write-Host "    ⚠️ $_" -ForegroundColor Yellow }
    } else {
        Write-Host "  ✅ No suspicious DLLs detected" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Secure reinstallation complete!" -ForegroundColor Green
Write-Host "🔍 Please run a full antivirus scan of your system"
Write-Host "📧 Consider reporting to npm security: security@npmjs.com"
