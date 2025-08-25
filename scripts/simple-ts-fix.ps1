# Simple Migration Fix Script
# Fixes broken JavaScript to TypeScript conversions with proper syntax

Write-Host "🔧 Fixing JavaScript to TypeScript Migration Issues" -ForegroundColor Yellow

$fixCount = 0
$errorCount = 0

# Function to fix broken TypeScript files
function Fix-TypeScriptFile {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) { return }
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Fix double variable declaration (const nextConfig: NextConfig = const nextConfig = {...})
    $content = $content -replace 'const\s+(\w+):\s*(\w+)\s*=\s*const\s+\1\s*=', 'const $1: $2 ='
    
    # Fix missing semicolon before export
    $content = $content -replace '}(\s*;?\s*)\n\nexport default', '};$1`n`nexport default'
    
    # Fix extra semicolon at end
    $content = $content -replace '}\s*;\s*;\s*$', '};'
    
    # Fix spacing issues
    $content = $content -replace '\n{3,}', "`n`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  ✅ Fixed: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
        $script:fixCount++
    }
}

# Find and fix all TypeScript config files
$apps = Get-ChildItem -Path "apps" -Directory -ErrorAction SilentlyContinue
$packages = Get-ChildItem -Path "packages" -Directory -ErrorAction SilentlyContinue
$allDirs = @($apps) + @($packages)

Write-Host "Processing $($allDirs.Count) directories..." -ForegroundColor Cyan

foreach ($dir in $allDirs) {
    $dirPath = $dir.FullName
    Write-Host "`n📁 $($dir.Name)" -ForegroundColor Yellow
    
    # Fix Next.js configs
    $nextConfig = Join-Path $dirPath "next.config.ts"
    if (Test-Path $nextConfig) {
        Fix-TypeScriptFile $nextConfig
    }
    
    # Fix Tailwind configs
    $tailwindConfig = Join-Path $dirPath "tailwind.config.ts"
    if (Test-Path $tailwindConfig) {
        Fix-TypeScriptFile $tailwindConfig
    }
    
    # Fix PostCSS configs
    $postcssConfig = Join-Path $dirPath "postcss.config.ts"
    if (Test-Path $postcssConfig) {
        Fix-TypeScriptFile $postcssConfig
    }
}

Write-Host "`n🎉 MIGRATION FIX COMPLETE!" -ForegroundColor Green
Write-Host "✅ Files fixed: $fixCount" -ForegroundColor Green
Write-Host "❌ Errors: $errorCount" -ForegroundColor Red

if ($fixCount -gt 0) {
    Write-Host "`n✨ TypeScript syntax issues have been resolved!" -ForegroundColor Green
    Write-Host "   Run 'pnpm type-check' to verify the fixes." -ForegroundColor White
}