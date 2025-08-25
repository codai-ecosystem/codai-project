#!/usr/bin/env pwsh

# Convert empty module files
$EmptyModuleFiles = @(
    "apps\talentai\empty-module.js",
    "apps\x\empty-module.js"
)

Write-Host "🚀 Converting Empty Module Files to TypeScript" -ForegroundColor Cyan

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
        
        # For empty modules, add proper TypeScript export
        if ([string]::IsNullOrWhiteSpace($content) -or $content.Trim() -eq "") {
            $content = "// Empty module placeholder`nexport {};"
        } else {
            # Basic CommonJS to ES modules conversion
            $content = $content -replace 'module\.exports\s*=\s*\{\}', 'export {};'
            $content = $content -replace 'module\.exports\s*=\s*(.+)', 'export default $1'
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
foreach ($file in $EmptyModuleFiles) {
    if (Convert-JSToTS $file) { 
        $converted++ 
    }
}

Write-Host "`n✨ Converted $converted empty module files to TypeScript!" -ForegroundColor Green