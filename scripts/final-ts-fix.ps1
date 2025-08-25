# Final TypeScript Fix Script
# Fixes remaining syntax issues in converted files

Write-Host "🔧 Final TypeScript Migration Fix" -ForegroundColor Yellow

$fixCount = 0

# Function to fix specific syntax issues
function Fix-FinalIssues {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) { return }
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Fix "const config: Config = export default {" pattern
    $content = $content -replace 'const\s+(\w+):\s*(\w+)\s*=\s*export\s+default\s*{', 'const $1: $2 = {'
    
    # Fix stray variable references before export
    $content = $content -replace '\n(\w+);\s*\n\nexport default', '`n`nexport default'
    
    # Fix double export default
    $content = $content -replace 'export default \w+;\s*export default', 'export default'
    
    # Clean up extra whitespace
    $content = $content -replace '\n{3,}', "`n`n"
    $content = $content.TrimEnd() + "`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  ✅ Fixed: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
        $script:fixCount++
    }
}

# Find and fix all config files
$allDirs = @()
if (Test-Path "apps") { $allDirs += Get-ChildItem -Path "apps" -Directory }
if (Test-Path "packages") { $allDirs += Get-ChildItem -Path "packages" -Directory }

Write-Host "Processing $($allDirs.Count) directories..." -ForegroundColor Cyan

foreach ($dir in $allDirs) {
    $dirPath = $dir.FullName
    Write-Host "📁 $($dir.Name)" -ForegroundColor Yellow
    
    # Fix all config files
    @("next.config.ts", "tailwind.config.ts", "postcss.config.ts") | ForEach-Object {
        $configPath = Join-Path $dirPath $_
        if (Test-Path $configPath) {
            Fix-FinalIssues $configPath
        }
    }
}

Write-Host "`n🎉 FINAL FIX COMPLETE!" -ForegroundColor Green
Write-Host "✅ Files fixed: $fixCount" -ForegroundColor Green