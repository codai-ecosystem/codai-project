#!/usr/bin/env pwsh
# 🔍 Quick Dependencies Check - No installs, just inventory

Write-Host "🔍 Quick Dependencies Inventory" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Gray

$services = @(
    @{ Name = "Admin Dashboard"; Path = "apps/admin" },
    @{ Name = "ID Service"; Path = "apps/id" },
    @{ Name = "Gateway Service"; Path = "apps/gateway" },
    @{ Name = "Hub Application"; Path = "apps/hub" }
)

foreach ($service in $services) {
    Write-Host "`n📦 $($service.Name) - $($service.Path)" -ForegroundColor White
    
    $packagePath = Join-Path $service.Path "package.json"
    
    if (Test-Path $packagePath) {
        $package = Get-Content $packagePath | ConvertFrom-Json
        
        # Check existing test frameworks
        $testFrameworks = @()
        $buildTools = @()
        $testScripts = @()
        
        # Check dependencies and devDependencies
        $allDeps = @{}
        if ($package.dependencies) { 
            $package.dependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value }
        }
        if ($package.devDependencies) { 
            $package.devDependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value }
        }
        
        # Test frameworks
        if ($allDeps["vitest"]) { $testFrameworks += "Vitest $($allDeps["vitest"])" }
        if ($allDeps["jest"]) { $testFrameworks += "Jest $($allDeps["jest"])" }
        if ($allDeps["@playwright/test"]) { $testFrameworks += "Playwright $($allDeps["@playwright/test"])" }
        if ($allDeps["@testing-library/react"]) { $testFrameworks += "Testing Library $($allDeps["@testing-library/react"])" }
        
        # Build tools
        if ($allDeps["next"]) { $buildTools += "Next.js $($allDeps["next"])" }
        if ($allDeps["typescript"]) { $buildTools += "TypeScript $($allDeps["typescript"])" }
        if ($allDeps["tailwindcss"]) { $buildTools += "Tailwind $($allDeps["tailwindcss"])" }
        
        # Test scripts
        if ($package.scripts) {
            $package.scripts.PSObject.Properties | ForEach-Object {
                if ($_.Name -match "test|spec|e2e") {
                    $testScripts += "$($_.Name): $($_.Value)"
                }
            }
        }
        
        # Display results
        if ($testFrameworks.Count -gt 0) {
            Write-Host "  ✅ Test Frameworks:" -ForegroundColor Green
            $testFrameworks | ForEach-Object { Write-Host "     - $_" -ForegroundColor White }
        } else {
            Write-Host "  ⚠️  No test frameworks found" -ForegroundColor Yellow
        }
        
        if ($buildTools.Count -gt 0) {
            Write-Host "  🔧 Build Tools:" -ForegroundColor Cyan
            $buildTools | ForEach-Object { Write-Host "     - $_" -ForegroundColor White }
        }
        
        if ($testScripts.Count -gt 0) {
            Write-Host "  📝 Test Scripts:" -ForegroundColor Blue
            $testScripts | ForEach-Object { Write-Host "     - $_" -ForegroundColor White }
        } else {
            Write-Host "  ⚠️  No test scripts found" -ForegroundColor Yellow
        }
        
        # Check for existing test files
        $testFiles = Get-ChildItem -Path $service.Path -Recurse -Include "*.test.*", "*.spec.*" -ErrorAction SilentlyContinue
        if ($testFiles.Count -gt 0) {
            Write-Host "  📁 Existing Test Files: $($testFiles.Count)" -ForegroundColor Green
            $testFiles | Select-Object -First 3 | ForEach-Object { 
                $relativePath = $_.FullName.Replace((Get-Location).Path, "").TrimStart("\")
                Write-Host "     - $relativePath" -ForegroundColor Gray
            }
            if ($testFiles.Count -gt 3) {
                Write-Host "     - ... and $($testFiles.Count - 3) more" -ForegroundColor Gray
            }
        } else {
            Write-Host "  📁 Test Files: None found" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "  ❌ No package.json found" -ForegroundColor Red
    }
}

Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
Write-Host "   1. Use fast-validation.ps1 for quick health checks" -ForegroundColor White
Write-Host "   2. Most services have good build tools already installed" -ForegroundColor White
Write-Host "   3. Add test frameworks only where specifically needed" -ForegroundColor White
Write-Host "   4. Focus on testing existing functionality first" -ForegroundColor White

Write-Host "`n🎯 Quick Test Options:" -ForegroundColor Cyan
Write-Host "   • Health checks: scripts/test-fast-validation.ps1" -ForegroundColor White
Write-Host "   • API testing: Direct curl/Invoke-RestMethod calls" -ForegroundColor White
Write-Host "   • Build testing: pnpm build in each service directory" -ForegroundColor White
Write-Host "   • Manual UI testing: Open http://localhost:4007, 4004, 4008" -ForegroundColor White
