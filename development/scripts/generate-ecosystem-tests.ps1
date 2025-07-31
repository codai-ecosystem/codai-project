#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CODAI Ecosystem Test Generator - Comprehensive testing automation

.DESCRIPTION
    Analyzes the entire CODAI ecosystem and generates appropriate tests for:
    - Frontend applications (Next.js/React)
    - Backend services (Node.js/Express)
    - SDK packages (TypeScript)
    - CLI tools
    - MCP servers

.PARAMETER ComponentType
    Specific component type to process (sdk, service, frontend, cli, mcp, all)

.PARAMETER DryRun
    Show what would be generated without creating files

.PARAMETER Force
    Overwrite existing test files
#>

param(
    [ValidateSet("sdk", "service", "frontend", "cli", "mcp", "all")]
    [string]$ComponentType = "all",
    [switch]$DryRun,
    [switch]$Force,
    [int]$Limit = 0
)

$WorkspaceRoot = "E:\GitHub\codai-project"
$PackagesDir = "$WorkspaceRoot\packages"
$AppsDir = "$WorkspaceRoot\apps"

# Component type detection patterns
$ComponentPatterns = @{
    sdk = @{
        patterns = @("@codai/*", "*-sdk", "core", "ai", "analytics")
        indicators = @("exports", "lib", "library")
        testTypes = @("unit", "integration", "performance")
    }
    service = @{
        patterns = @("*-api", "*-service", "gateway", "server")
        indicators = @("express", "fastify", "server", "api")
        testTypes = @("unit", "integration", "e2e")
    }
    frontend = @{
        patterns = @("*-dashboard", "*-app", "admin", "hub")
        indicators = @("next.js", "react", "pages", "components")
        testTypes = @("unit", "component", "e2e", "visual")
    }
    cli = @{
        patterns = @("*-cli", "cli")
        indicators = @("bin", "commander", "yargs")
        testTypes = @("unit", "integration", "command")
    }
    mcp = @{
        patterns = @("*-mcp", "mcp-*")
        indicators = @("@modelcontextprotocol/sdk", "mcp", "server")
        testTypes = @("unit", "protocol", "functionality")
    }
}

function Get-ComponentType {
    param([string]$PackagePath, [string]$PackageName)
    
    $packageJsonPath = "$PackagePath\package.json"
    if (-not (Test-Path $packageJsonPath)) {
        return $null
    }
    
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    # Check for explicit indicators in package.json
    foreach ($type in $ComponentPatterns.Keys) {
        $patterns = $ComponentPatterns[$type]
        
        # Check package name patterns
        foreach ($pattern in $patterns.patterns) {
            if ($PackageName -like $pattern) {
                return $type
            }
        }
        
        # Check for indicator keywords in dependencies/scripts
        $packageContent = $packageJson | ConvertTo-Json -Depth 10
        foreach ($indicator in $patterns.indicators) {
            if ($packageContent -like "*$indicator*") {
                return $type
            }
        }
    }
    
    # Default classification based on structure
    if (Test-Path "$PackagePath\pages" -or Test-Path "$PackagePath\app") {
        return "frontend"
    } elseif (Test-Path "$PackagePath\bin") {
        return "cli"
    } elseif ($packageJson.main -and $packageJson.main.Contains("server")) {
        return "service"
    } else {
        return "sdk"
    }
}

function Get-PackageInfo {
    param([string]$PackagePath)
    
    $packageJsonPath = "$PackagePath\package.json"
    if (-not (Test-Path $packageJsonPath)) {
        return $null
    }
    
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $componentType = Get-ComponentType $PackagePath $packageJson.name
    
    return @{
        Name = $packageJson.name
        Path = $PackagePath
        Type = $componentType
        HasTypeScript = (Test-Path "$PackagePath\tsconfig.json")
        HasReact = ($packageJson.dependencies.react -or $packageJson.devDependencies.react)
        HasExpress = ($packageJson.dependencies.express -or $packageJson.devDependencies.express)
        HasMCP = ($packageJson.dependencies.'@modelcontextprotocol/sdk' -or $packageJson.devDependencies.'@modelcontextprotocol/sdk')
        HasTests = (Test-Path "$PackagePath\tests") -or (Test-Path "$PackagePath\test")
        HasSrc = (Test-Path "$PackagePath\src")
    }
}

function Generate-TestsForComponent {
    param([object]$ComponentInfo)
    
    $testGeneratorScript = @"
import { TestGenerator } from '@codai/testing-framework/generators';

const options = {
    componentType: '$($ComponentInfo.Type)',
    packageName: '$($ComponentInfo.Name)',
    packagePath: '$($ComponentInfo.Path)',
    hasTypeScript: $($ComponentInfo.HasTypeScript.ToString().ToLower()),
    hasReact: $($ComponentInfo.HasReact.ToString().ToLower()),
    hasExpress: $($ComponentInfo.HasExpress.ToString().ToLower()),
    hasMCP: $($ComponentInfo.HasMCP.ToString().ToLower())
};

await TestGenerator.generateForPackage(options);
console.log('✅ Generated tests for $($ComponentInfo.Name)');
"@
    
    $tempScript = "$($ComponentInfo.Path)\generate-tests.mjs"
    Set-Content -Path $tempScript -Value $testGeneratorScript
    
    try {
        Push-Location $ComponentInfo.Path
        $result = node $tempScript 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Generated tests for $($ComponentInfo.Name)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ Failed to generate tests for $($ComponentInfo.Name)" -ForegroundColor Red
            Write-Host "    Error: $result" -ForegroundColor Yellow
            return $false
        }
    } finally {
        Pop-Location
        Remove-Item $tempScript -ErrorAction SilentlyContinue
    }
}

function Update-PackageJsonForTesting {
    param([object]$ComponentInfo)
    
    $packageJsonPath = "$($ComponentInfo.Path)\package.json"
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    # Add testing framework dependency
    if (-not $packageJson.devDependencies) {
        $packageJson | Add-Member -Type NoteProperty -Name "devDependencies" -Value ([PSCustomObject]@{})
    }
    
    $packageJson.devDependencies | Add-Member -Type NoteProperty -Name "@codai/testing-framework" -Value "workspace:*" -Force
    
    # Add test scripts based on component type
    if (-not $packageJson.scripts) {
        $packageJson | Add-Member -Type NoteProperty -Name "scripts" -Value ([PSCustomObject]@{})
    }
    
    $packageJson.scripts | Add-Member -Type NoteProperty -Name "test" -Value "vitest run" -Force
    $packageJson.scripts | Add-Member -Type NoteProperty -Name "test:watch" -Value "vitest" -Force
    $packageJson.scripts | Add-Member -Type NoteProperty -Name "test:coverage" -Value "vitest run --coverage" -Force
    
    # Add component-specific test scripts
    switch ($ComponentInfo.Type) {
        "frontend" {
            $packageJson.scripts | Add-Member -Type NoteProperty -Name "test:e2e" -Value "playwright test" -Force
            $packageJson.scripts | Add-Member -Type NoteProperty -Name "test:visual" -Value "playwright test --project=visual" -Force
        }
        "service" {
            $packageJson.scripts | Add-Member -Type NoteProperty -Name "test:integration" -Value "vitest run tests/integration" -Force
        }
        "cli" {
            $packageJson.scripts | Add-Member -Type NoteProperty -Name "test:command" -Value "vitest run tests/commands" -Force
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
    Write-Host "  📝 Updated package.json for $($ComponentInfo.Name)"
}

function Test-GeneratedTests {
    param([object]$ComponentInfo)
    
    Push-Location $ComponentInfo.Path
    try {
        Write-Host "  🧪 Testing generated tests for $($ComponentInfo.Name)..."
        
        # Install dependencies first
        pnpm install --silent 2>&1 | Out-Null
        
        # Run tests
        $result = pnpm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Tests passed for $($ComponentInfo.Name)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠️ Tests need implementation for $($ComponentInfo.Name)" -ForegroundColor Yellow
            return $false
        }
    } finally {
        Pop-Location
    }
}

# Main execution
Write-Host "🚀 CODAI Ecosystem Test Generator" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Discover all components
$allComponents = @()

# Scan packages directory
if (Test-Path $PackagesDir) {
    Get-ChildItem -Path $PackagesDir -Directory | ForEach-Object {
        $info = Get-PackageInfo $_.FullName
        if ($info) {
            $allComponents += $info
        }
    }
}

# Scan apps directory
if (Test-Path $AppsDir) {
    Get-ChildItem -Path $AppsDir -Directory | ForEach-Object {
        $info = Get-PackageInfo $_.FullName
        if ($info) {
            $allComponents += $info
        }
    }
}

# Filter by component type
if ($ComponentType -ne "all") {
    $allComponents = $allComponents | Where-Object { $_.Type -eq $ComponentType }
}

# Apply limit if specified
if ($Limit -gt 0) {
    $allComponents = $allComponents | Select-Object -First $Limit
}

Write-Host "📊 Analysis Summary:" -ForegroundColor Yellow
Write-Host "Total Components: $($allComponents.Count)"

$componentTypeCounts = $allComponents | Group-Object Type | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) components"
}

$componentsNeedingTests = $allComponents | Where-Object { -not $_.HasTests }
Write-Host "Components Needing Tests: $($componentsNeedingTests.Count)" -ForegroundColor Red

if ($DryRun) {
    Write-Host "`n🔍 Dry Run - Components that would get tests:" -ForegroundColor Cyan
    $componentsNeedingTests | ForEach-Object {
        Write-Host "  📦 $($_.Name) ($($_.Type))"
    }
    exit 0
}

# Generate tests
Write-Host "`n🏗️ Generating Tests..." -ForegroundColor Cyan
$successCount = 0
$totalProcessed = 0

foreach ($component in $componentsNeedingTests) {
    $totalProcessed++
    Write-Host "`n📦 Processing: $($component.Name) ($($component.Type))" -ForegroundColor Yellow
    
    try {
        # Skip if tests exist and not forcing
        if ($component.HasTests -and -not $Force) {
            Write-Host "  ⏭️ Skipping - tests already exist" -ForegroundColor Gray
            continue
        }
        
        # Generate tests
        $generateSuccess = Generate-TestsForComponent $component
        
        if ($generateSuccess) {
            # Update package.json
            Update-PackageJsonForTesting $component
            
            # Test the generated tests
            $testSuccess = Test-GeneratedTests $component
            
            if ($testSuccess) {
                $successCount++
            }
        }
        
    } catch {
        Write-Host "  ❌ Error processing $($component.Name): $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n📊 Test Generation Summary" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host "Total Components Processed: $totalProcessed"
Write-Host "Successfully Generated: $successCount"
Write-Host "Success Rate: $(if ($totalProcessed -gt 0) { [math]::Round(($successCount / $totalProcessed) * 100, 2) } else { 0 })%"

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Review generated test files and implement specific test cases"
Write-Host "2. Run 'pnpm test' in each package to verify tests work"
Write-Host "3. Add component-specific test implementations"
Write-Host "4. Set up CI/CD integration for automated testing"
Write-Host "5. Implement performance and security testing"
