#!/usr/bin/env pwsh

# Convert AI module files specifically
$AIModuleFiles = @(
    "modules\apps\bancai-ai.js",
    "modules\apps\aide-ai.js", 
    "modules\apps\codai-ai.js",
    "modules\apps\prezentai-ai.js",
    "modules\apps\memorai-ai.js",
    "modules\apps\metu-ai.js",
    "modules\apps\marketai-ai.js",
    "modules\apps\talentai-ai.js",
    "modules\apps\stocai-ai.js"
)

Write-Host "🚀 Converting AI Module Files to TypeScript" -ForegroundColor Cyan

function Convert-JSToTS {
    param($FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ⚠️  File not found: $FilePath" -ForegroundColor Yellow
        return $false
    }
    
    $tsPath = $FilePath -replace '\.js$', '.ts'
    
    if (Test-Path $tsPath) {
        Write-Host "  ⏭️  TypeScript version exists: $FilePath" -ForegroundColor Gray
        return $false
    }
    
    try {
        # Read content
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        
        # Basic CommonJS to ES modules conversion
        $content = $content -replace 'const\s+(.+?)\s*=\s*require\([''"](.+?)[''"]\)', 'import $1 from ''$2'''
        $content = $content -replace 'module\.exports\s*=\s*(.+)', 'export default $1'
        $content = $content -replace 'module\.exports\.(\w+)\s*=', 'export const $1 ='
        $content = $content -replace 'exports\.(\w+)\s*=', 'export const $1 ='
        
        # Add TypeScript interface for AI modules
        if ($content -match 'module\.exports\s*=|export default') {
            $content = "interface AIModuleConfig {\n  name: string;\n  version: string;\n  capabilities: string[];\n  [key: string]: any;\n}\n\n" + $content
        }
        
        # Write TypeScript file
        $content | Set-Content $tsPath -Encoding UTF8
        
        Write-Host "  ✅ Converted: $FilePath → $tsPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ❌ Failed to convert: $FilePath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

$converted = 0
foreach ($file in $AIModuleFiles) {
    if (Convert-JSToTS $file) { 
        $converted++ 
    }
}

Write-Host "`n✨ Converted $converted AI module files to TypeScript!" -ForegroundColor Green