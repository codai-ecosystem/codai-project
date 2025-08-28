#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup Husky Pre-commit Hooks
#>

Write-Host "🎣 Setting up Husky pre-commit hooks..." -ForegroundColor Cyan

Write-Host "📦 Installing husky and lint-staged..." -ForegroundColor Yellow
npm install --save-dev husky lint-staged @commitlint/config-conventional @commitlint/cli

Write-Host "🔧 Initializing husky..." -ForegroundColor Yellow
npx husky install

Write-Host "✅ Husky hooks setup complete!" -ForegroundColor Green
