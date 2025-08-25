#!/usr/bin/env pwsh

# Convert remaining package files to TypeScript
$RemainingFiles = @(
    # MemorAI MCP package files
    "packages\memorai-mcp\memorai-graphql-server.js",
    "packages\memorai-mcp\memorai-mcp-server.cjs",
    
    # Glass Browser Automation (if any JS remains)
    "packages\glass-browser-automation\glass-debug-runner.js",
    "packages\glass-browser-automation\browser-element-finder.js",
    
    # Testing utilities configs
    "packages\testing-utils\configs\playwright.config.js",
    "packages\testing-utils\configs\vitest.config.js"
)

# Additional package files discovered
$AdditionalFiles = @(
    "packages\cbd\archive\experimental\start-service.js",
    "packages\cbd\archive\legacy-services\server-phase3-ultra-simple.js",
    "packages\cbd\quick-service-installer.js",
    "packages\cbd\cbd-global-infrastructure.js"
)

$AllFiles = $RemainingFiles + $AdditionalFiles

Write-Host "🚀 Converting Remaining Package Files to TypeScript" -ForegroundColor Cyan
Write-Host "Total files to process: $($AllFiles.Count)" -ForegroundColor Yellow

function Convert-JSToTS {
    param($FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ⚠️  File not found: $FilePath" -ForegroundColor Yellow
        return $false
    }
    
    $tsPath = $FilePath -replace '\.js$', '.ts'
    $tsPath = $tsPath -replace '\.cjs$', '.ts'
    
    if (Test-Path $tsPath) {
        Write-Host "  ⏭️  TypeScript version exists: $FilePath" -ForegroundColor Gray
        return $false
    }
    
    try {
        # Read content
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        
        # Enhanced CommonJS to ES modules conversion
        $content = $content -replace 'const\s+(.+?)\s*=\s*require\([''"](.+?)[''"]\)', 'import $1 from ''$2'''
        $content = $content -replace 'const\s+\{(.+?)\}\s*=\s*require\([''"](.+?)[''"]\)', 'import { $1 } from ''$2'''
        $content = $content -replace 'module\.exports\s*=\s*(.+)', 'export default $1'
        $content = $content -replace 'module\.exports\.(\w+)\s*=', 'export const $1 ='
        $content = $content -replace 'exports\.(\w+)\s*=', 'export const $1 ='
        
        # Handle CommonJS (.cjs) files specially
        if ($FilePath -match '\.cjs$') {
            $content = "// Converted from CommonJS to TypeScript\n" + $content
        }
        
        # Add TypeScript interfaces based on file patterns
        $fileName = Split-Path $FilePath -LeafBase
        $dirName = Split-Path $FilePath -Parent
        
        if ($fileName -match "(server|graphql)") {
            $content = "// Server configuration types\nexport interface ServerOptions {\n  port?: number;\n  host?: string;\n  [key: string]: any;\n}\n\n" + $content
        }
        elseif ($fileName -match "(config|playwright|vitest)") {
            $content = "// Configuration types\nexport interface ConfigOptions {\n  [key: string]: any;\n}\n\n" + $content
        }
        elseif ($fileName -match "(browser|glass|automation)") {
            $content = "// Browser automation types\nexport interface BrowserConfig {\n  headless?: boolean;\n  viewport?: { width: number; height: number; };\n  [key: string]: any;\n}\n\n" + $content
        }
        elseif ($dirName -match "(archive|legacy)") {
            $content = "// Legacy/Archive module\nexport interface LegacyConfig {\n  [key: string]: any;\n}\n\n" + $content
        }
        else {
            $content = "// Package module types\nexport interface PackageOptions {\n  [key: string]: any;\n}\n\n" + $content
        }
        
        # Add return types to functions
        $content = $content -replace 'function\s+(\w+)\s*\(([^)]*)\)\s*\{', 'function $1($2): any {'
        $content = $content -replace 'async\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{', 'async function $1($2): Promise<any> {'
        
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
foreach ($file in $AllFiles) {
    if (Convert-JSToTS $file) { 
        $converted++ 
    }
}

Write-Host "`n✨ Total converted: $converted remaining package files to TypeScript!" -ForegroundColor Green
Write-Host "📈 Additional Progress: $converted files migrated from JavaScript to TypeScript" -ForegroundColor Cyan