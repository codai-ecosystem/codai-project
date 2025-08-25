#!/usr/bin/env pwsh

# Convert high-priority package files to TypeScript
$PackageFiles = @(
    # LogAI SDK
    "packages\logai-sdk\src\index.js",
    
    # Glass Browser Automation
    "packages\glass-browser-automation\src\enhanced-vercel-automation.js",
    "packages\glass-browser-automation\src\enhanced-glass-browser.js", 
    "packages\glass-browser-automation\src\dom-inspector.js",
    "packages\glass-browser-automation\src\glass-mcp-connector.js",
    "packages\glass-browser-automation\src\smart-element-interactor.js",
    
    # RomAI MCP Standalone
    "packages\romai-mcp-standalone\src\server.js",
    
    # Realtime Package
    "packages\realtime\src\client.js",
    "packages\realtime\src\events.js", 
    "packages\realtime\src\server.js",
    "packages\realtime\src\utils.js",
    "packages\realtime\src\types.js",
    "packages\realtime\src\sync.js",
    "packages\realtime\src\index.js",
    
    # Core Package
    "packages\core\src\utils.js",
    "packages\core\src\types.js",
    "packages\core\src\index.js",
    
    # MemorAI MCP
    "packages\memorai-mcp\src\instrumentation.js",
    "packages\memorai-mcp\src\enhancements\azure-embeddings.js",
    
    # CBD Package
    "packages\cbd\src\instrumentation.js",
    "packages\cbd\src\memory\MemoryEngine.js",
    
    # Component files
    "apps\aide\packages\memory-graph\src\components\index.js"
)

Write-Host "🚀 Converting High-Priority Package Files to TypeScript" -ForegroundColor Cyan
Write-Host "Total files to process: $($PackageFiles.Count)" -ForegroundColor Yellow

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
        
        # Enhanced CommonJS to ES modules conversion
        $content = $content -replace 'const\s+(.+?)\s*=\s*require\([''"](.+?)[''"]\)', 'import $1 from ''$2'''
        $content = $content -replace 'const\s+\{(.+?)\}\s*=\s*require\([''"](.+?)[''"]\)', 'import { $1 } from ''$2'''
        $content = $content -replace 'module\.exports\s*=\s*(.+)', 'export default $1'
        $content = $content -replace 'module\.exports\.(\w+)\s*=', 'export const $1 ='
        $content = $content -replace 'exports\.(\w+)\s*=', 'export const $1 ='
        
        # Add TypeScript interfaces based on file type
        $fileName = Split-Path $FilePath -Leaf
        $packageName = ($FilePath -split '\\')[1]
        
        switch ($fileName) {
            "index.js" {
                $content = "// TypeScript declarations for $packageName\nexport interface PackageConfig {\n  [key: string]: any;\n}\n\n" + $content
            }
            "types.js" {
                $content = "// TypeScript type definitions\nexport interface BaseType {\n  [key: string]: any;\n}\n\n" + $content
            }
            "server.js" {
                $content = "// Server configuration types\nexport interface ServerConfig {\n  port?: number;\n  host?: string;\n  [key: string]: any;\n}\n\n" + $content
            }
            "client.js" {
                $content = "// Client configuration types\nexport interface ClientConfig {\n  apiUrl?: string;\n  timeout?: number;\n  [key: string]: any;\n}\n\n" + $content
            }
            default {
                if ($content -match 'class\s+\w+') {
                    $content = "// Class-based module\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\n" + $content
                }
            }
        }
        
        # Add 'any' type to function parameters that don't have types
        $content = $content -replace 'function\s+(\w+)\s*\(([^)]*)\)\s*\{', 'function $1($2): any {'
        
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

# Group files by package for better organization
$packageGroups = @{}
foreach ($file in $PackageFiles) {
    $package = ($file -split '\\')[1]
    if (-not $packageGroups.ContainsKey($package)) {
        $packageGroups[$package] = @()
    }
    $packageGroups[$package] += $file
}

$totalConverted = 0
foreach ($package in $packageGroups.Keys | Sort-Object) {
    Write-Host "`n📦 Processing package: $package" -ForegroundColor Cyan
    $packageConverted = 0
    
    foreach ($file in $packageGroups[$package]) {
        if (Convert-JSToTS $file) { 
            $packageConverted++
            $totalConverted++
        }
    }
    
    Write-Host "  📊 Package $package`: $packageConverted files converted" -ForegroundColor Blue
}

Write-Host "`n✨ Total converted: $totalConverted package files to TypeScript!" -ForegroundColor Green
Write-Host "📈 Progress: $totalConverted additional files migrated from JavaScript to TypeScript" -ForegroundColor Cyan