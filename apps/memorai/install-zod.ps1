#!/usr/bin/env pwsh
Write-Host "Installing zod dependency for MemorAI..." -ForegroundColor Cyan
Set-Location "e:\GitHub\codai-project\apps\memorai"
pnpm add zod
Write-Host "Zod installation complete!" -ForegroundColor Green
