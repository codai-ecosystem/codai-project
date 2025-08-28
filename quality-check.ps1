#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CodAI Services Quality Checks
#>

param([switch]$Fix = $false, [switch]$Coverage = $false)

Write-Host "🔍 CodAI Code Quality Checks" -ForegroundColor Cyan
Write-Host ""

$failureCount = 0

function Invoke-QualityCheck {
    param([string]$Name, [string]$Command, [string]$Color = "White")
    
    Write-Host "🔧 Running $Name..." -ForegroundColor $Color
    try {
        if ($Fix -and $Command.Contains("eslint")) { $Command += " --fix" }
        if ($Fix -and $Command.Contains("prettier")) { $Command = $Command.Replace("--check", "--write") }
        
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $Name PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $Name FAILED" -ForegroundColor Red
            $script:failureCount++
        }
    } catch {
        Write-Host "  ❌ $Name ERROR" -ForegroundColor Red
        $script:failureCount++
    }
}

Invoke-QualityCheck -Name "ESLint" -Command "npx eslint src --ext .ts,.js" -Color "Blue"
Invoke-QualityCheck -Name "Prettier" -Command "npx prettier --check src/**/*.{ts,js}" -Color "Magenta"
Invoke-QualityCheck -Name "TypeScript" -Command "npx tsc --noEmit" -Color "Green"

if ($Coverage) {
    Invoke-QualityCheck -Name "Jest Coverage" -Command "npx jest --coverage" -Color "Yellow"
} else {
    Invoke-QualityCheck -Name "Jest Tests" -Command "npx jest --passWithNoTests" -Color "Yellow"
}

Write-Host ""
if ($failureCount -eq 0) {
    Write-Host "✅ All quality checks PASSED" -ForegroundColor Green
} else {
    Write-Host "❌ $failureCount quality check(s) FAILED" -ForegroundColor Red
}
