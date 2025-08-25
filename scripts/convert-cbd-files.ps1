#!/usr/bin/env pwsh

# Convert CBD package and testing utilities to TypeScript
$CBDFiles = @(
    # CBD Core Files
    "packages\cbd\ssl-proxy-server.js",
    "packages\cbd\test-enterprise-auth.js",
    "packages\cbd\tests\performance-reporter.js",
    "packages\cbd\tests\cbd-test.js",
    "packages\cbd\quick-acme-setup.js",
    "packages\cbd\cbd-ssl-manager.js",
    "packages\cbd\cbd-ssl-cloud-automation.js",
    "packages\cbd\cbd-production-infrastructure.js",
    "packages\cbd\cbd-multicloud-auth-service.js",
    "packages\cbd\cbd-collaboration-client.js",
    
    # CBD Test Files
    "packages\cbd\tests\src\vector\VectorStore.js",
    "packages\cbd\tests\src\types\index.js",
    "packages\cbd\tests\src\storage\CBDNativeStorageAdapter.js",
    "packages\cbd\tests\src\index.js",
    "packages\cbd\tests\src\embedding\EmbeddingService.js",
    "packages\cbd\tests\src\mcp\config.js",
    "packages\cbd\tests\src\mcp\index.js",
    "packages\cbd\tests\src\mcp\server.js",
    "packages\cbd\tests\src\mcp\types.js",
    "packages\cbd\tests\src\memory\MemoryEngine.js",
    "packages\cbd\tests\src\mcp\tools\monitoring\stats.js",
    "packages\cbd\tests\src\mcp\tools\monitoring\health.js"
)

Write-Host "🚀 Converting CBD Package Files to TypeScript" -ForegroundColor Cyan
Write-Host "Total files to process: $($CBDFiles.Count)" -ForegroundColor Yellow

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
        
        # Add TypeScript interfaces based on file name patterns
        $fileName = Split-Path $FilePath -LeafBase
        
        if ($fileName -match "(ssl|server|auth|client)") {
            $content = "// Network service types\nexport interface ServiceConfig {\n  port?: number;\n  host?: string;\n  ssl?: boolean;\n  [key: string]: any;\n}\n\n" + $content
        }
        elseif ($fileName -match "(vector|embedding|memory)") {
            $content = "// Data processing types\nexport interface DataConfig {\n  vectorSize?: number;\n  embeddingModel?: string;\n  [key: string]: any;\n}\n\n" + $content
        }
        elseif ($fileName -match "(test|spec)") {
            $content = "// Test configuration types\nexport interface TestConfig {\n  timeout?: number;\n  retries?: number;\n  [key: string]: any;\n}\n\n" + $content
        }
        elseif ($fileName -match "(monitoring|health|stats)") {
            $content = "// Monitoring types\nexport interface MonitoringConfig {\n  enabled?: boolean;\n  interval?: number;\n  [key: string]: any;\n}\n\n" + $content
        }
        else {
            $content = "// Module configuration\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\n" + $content
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

# Convert files in logical groups
$groups = @{
    "Core Services" = ($CBDFiles | Where-Object { $_ -match "ssl|auth|client|infrastructure" })
    "Test Infrastructure" = ($CBDFiles | Where-Object { $_ -match "test|performance" })
    "MCP Components" = ($CBDFiles | Where-Object { $_ -match "mcp" })
    "Data Processing" = ($CBDFiles | Where-Object { $_ -match "vector|embedding|memory" })
    "Other Files" = ($CBDFiles | Where-Object { $_ -notmatch "ssl|auth|client|infrastructure|test|performance|mcp|vector|embedding|memory" })
}

$totalConverted = 0
foreach ($groupName in $groups.Keys) {
    $files = $groups[$groupName]
    if ($files.Count -gt 0) {
        Write-Host "`n📁 Processing group: $groupName ($($files.Count) files)" -ForegroundColor Cyan
        $groupConverted = 0
        
        foreach ($file in $files) {
            if (Convert-JSToTS $file) { 
                $groupConverted++
                $totalConverted++
            }
        }
        
        Write-Host "  📊 Group $groupName`: $groupConverted files converted" -ForegroundColor Blue
    }
}

Write-Host "`n✨ Total converted: $totalConverted CBD package files to TypeScript!" -ForegroundColor Green
Write-Host "📈 Progress: $totalConverted additional files migrated from JavaScript to TypeScript" -ForegroundColor Cyan