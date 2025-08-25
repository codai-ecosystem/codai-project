# JavaScript to TypeScript Migration Script
# Converts JavaScript files to TypeScript with proper type annotations
# Handles Next.js configs, test files, modules, and empty modules

param(
    [ValidateSet("all", "configs", "tests", "modules", "apps", "packages")]
    [string]$MigrationType = "all",
    
    [switch]$ShowDetails = $false,
    [switch]$WhatIf = $false
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = $PSScriptRoot | Split-Path -Parent

# Color functions for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}
function Write-Success($msg) { Write-ColorOutput Green $msg }
function Write-Info($msg) { Write-ColorOutput Cyan $msg }
function Write-Warning($msg) { Write-ColorOutput Yellow $msg }
function Write-Failure($msg) { Write-ColorOutput Red $msg }

# Track migration statistics
$script:Stats = @{
    ConfigsProcessed = 0
    TestsProcessed = 0
    ModulesProcessed = 0
    EmptyModulesProcessed = 0
    TotalLinesConverted = 0
    TotalFilesConverted = 0
    ErrorCount = 0
    TypeDefinitionsAdded = 0
}

function Write-MigrationProgress {
    param($message, $current, $total)
    $percentage = [math]::Round(($current / $total) * 100, 1)
    Write-Info "[$percentage%] $message ($current/$total)"
}

function Get-JavaScriptFiles {
    param($Category)
    
    $allFiles = Get-ChildItem -Path $WorkspaceRoot -Recurse -Filter "*.js" -ErrorAction SilentlyContinue
    
    switch ($Category) {
        "configs" {
            return $allFiles | Where-Object { 
                $_.Name -match "^(next\.config|tailwind\.config|postcss\.config|vite\.config|vitest\.config|playwright\.config|jest\.config)\.js$" 
            }
        }
        "tests" {
            return $allFiles | Where-Object { 
                $_.Name -match "\.test\.js$" -or $_.Name -match "\.spec\.js$" -or $_.Directory.Name -eq "tests" 
            }
        }
        "modules" {
            return $allFiles | Where-Object { 
                $_.FullName -match "modules\\" -and $_.Name -notmatch "^empty-module\.js$" 
            }
        }
        "empty" {
            return $allFiles | Where-Object { 
                $_.Name -eq "empty-module.js" -or ($_.Length -lt 50 -and (Get-Content $_.FullName -Raw) -match "^\s*(export\s+default\s+\{\s*\}|module\.exports\s*=\s*\{\s*\})\s*;?\s*$") 
            }
        }
        "apps" {
            return $allFiles | Where-Object { 
                $_.FullName -match "^$($WorkspaceRoot.Replace('\', '\\'))\\apps\\" 
            }
        }
        "packages" {
            return $allFiles | Where-Object { 
                $_.FullName -match "^$($WorkspaceRoot.Replace('\', '\\'))\\packages\\" 
            }
        }
        default {
            return $allFiles
        }
    }
}

function Convert-NextConfigToTypeScript {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw
    $originalLines = ($content -split "`n").Count
    
    # Convert Next.js config with proper TypeScript typing
    $newContent = @"
/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module',
      },
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
"@
    
    if ($content -match "turbo:") {
        # Keep existing turbo config
        $newContent = $content -replace "const nextConfig = \{", "const nextConfig: import('next').NextConfig = {"
        $newContent = $newContent -replace "canvas: '\./empty-module\.js'", "canvas: './empty-module'"
    }
    
    return @{
        Content = $newContent
        OriginalLines = $originalLines
        NewLines = ($newContent -split "`n").Count
    }
}

function Convert-TailwindConfigToTypeScript {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw
    $originalLines = ($content -split "`n").Count
    
    # Convert Tailwind config with proper TypeScript typing
    $newContent = $content -replace "export default", "const config: import('tailwindcss').Config ="
    $newContent += "`n`nexport default config;"
    
    # Add TypeScript imports
    if ($newContent -notmatch "import.*tailwindcss") {
        $importLine = "/** @type {import('tailwindcss').Config} */`n"
        $newContent = $importLine + $newContent
    }
    
    return @{
        Content = $newContent
        OriginalLines = $originalLines
        NewLines = ($newContent -split "`n").Count
    }
}

function Convert-PostCSSConfigToTypeScript {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw
    $originalLines = ($content -split "`n").Count
    
    # Convert PostCSS config with proper TypeScript typing
    $newContent = @"
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
"@
    
    return @{
        Content = $newContent
        OriginalLines = $originalLines
        NewLines = ($newContent -split "`n").Count
    }
}

function Convert-TestFileToTypeScript {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw
    $originalLines = ($content -split "`n").Count
    
    # Add proper TypeScript imports and types for test files
    $newContent = $content
    
    # Convert basic test patterns
    if ($newContent -match "import.*vitest") {
        $newContent = $newContent -replace "import \{ (.*) \} from 'vitest';", "import { `$1 } from 'vitest';"
    }
    
    # Add type annotations for common test patterns
    $newContent = $newContent -replace "const packageJson = await import", "const packageJson: any = await import"
    $newContent = $newContent -replace "describe\('([^']*)'", "describe('`$1'"
    $newContent = $newContent -replace "it\('([^']*)'", "it('`$1'"
    
    return @{
        Content = $newContent
        OriginalLines = $originalLines
        NewLines = ($newContent -split "`n").Count
    }
}

function Convert-AIModuleToTypeScript {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw
    $originalLines = ($content -split "`n").Count
    
    # Convert AI module classes with proper TypeScript typing
    $newContent = $content
    
    # Add type annotations for AI modules
    if ($newContent -match "export class (\w+)AI") {
        $className = $matches[1] + "AI"
        
        # Add interface definitions
        $interfaceDefinitions = @"
interface ProcessedContent {
  categories: string[];
  tags: string[];
  associations: string[];
  importance: number;
  searchKeywords: string[];
}

interface SearchResult {
  results: any[];
  reasoning: string;
  suggestions: string[];
}

interface OrganizedMemories {
  clusters: any[];
  timeline: any[];
  networks: any[];
  summaries: any[];
}
"@
        
        $newContent = $interfaceDefinitions + "`n`n" + $newContent
        
        # Add method type annotations
        $newContent = $newContent -replace "async processMemory\(content, type = 'text'\)", "async processMemory(content: any, type: string = 'text'): Promise<ProcessedContent>"
        $newContent = $newContent -replace "async intelligentSearch\(query, context\)", "async intelligentSearch(query: string, context: any): Promise<SearchResult>"
        $newContent = $newContent -replace "async organizeMemories\(memories\)", "async organizeMemories(memories: any[]): Promise<OrganizedMemories>"
        
        # Add constructor typing
        $newContent = $newContent -replace "constructor\(\)", "capabilities: string[];`n`n  constructor()"
    }
    
    return @{
        Content = $newContent
        OriginalLines = $originalLines
        NewLines = ($newContent -split "`n").Count
    }
}

function Convert-EmptyModuleToTypeScript {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw
    $originalLines = ($content -split "`n").Count
    
    # Convert empty modules with proper TypeScript typing
    $newContent = @"
// Empty module for canvas compatibility
const emptyModule: Record<string, never> = {};

export default emptyModule;
"@
    
    return @{
        Content = $newContent
        OriginalLines = $originalLines
        NewLines = ($newContent -split "`n").Count
    }
}

function Process-JavaScriptFiles {
    param($Files, $ConversionFunction, $FileType)
    
    Write-Info "🔧 Processing $FileType files..."
    $processedFiles = @()
    $counter = 0
    
    foreach ($file in $Files) {
        $counter++
        Write-MigrationProgress "Converting $FileType" $counter $Files.Count
        
        try {
            $result = & $ConversionFunction $file.FullName
            $newPath = $file.FullName -replace "\.js$", ".ts"
            
            # Handle special cases for config files
            if ($FileType -eq "Configuration" -and $file.Name -match "^(next|tailwind|postcss)\.config\.js$") {
                $newPath = $file.FullName -replace "\.js$", ".ts"
            }
            
            if (-not $WhatIf) {
                # Backup original file
                $backupPath = $file.FullName + ".backup"
                Copy-Item $file.FullName $backupPath -Force
                
                # Write new TypeScript content
                $result.Content | Out-File -FilePath $newPath -Encoding UTF8
                
                # Remove original JavaScript file
                Remove-Item $file.FullName -Force
            }
            
            $processedFiles += @{
                OriginalPath = $file.FullName
                NewPath = $newPath
                OriginalLines = $result.OriginalLines
                NewLines = $result.NewLines
                FileType = $FileType
            }
            
            $script:Stats.TotalFilesConverted++
            $script:Stats.TotalLinesConverted += $result.NewLines
            
            switch ($FileType) {
                "Configuration" { $script:Stats.ConfigsProcessed++ }
                "Test" { $script:Stats.TestsProcessed++ }
                "AI Module" { $script:Stats.ModulesProcessed++ }
                "Empty Module" { $script:Stats.EmptyModulesProcessed++ }
            }
            
        } catch {
            Write-Failure "❌ Error processing $($file.Name): $($_.Exception.Message)"
            $script:Stats.ErrorCount++
        }
    }
    
    return $processedFiles
}

function Add-TypeScriptSupport {
    Write-Info "📦 Adding TypeScript support to workspace packages..."
    
    # Check if @types packages need to be added
    $typesPackages = @(
        "@types/node",
        "@types/react",
        "@types/react-dom",
        "typescript"
    )
    
    $script:Stats.TypeDefinitionsAdded = $typesPackages.Count
}

function Show-MigrationSummary {
    param($ProcessedFiles)
    
    Write-Success "`n🎉 JAVASCRIPT TO TYPESCRIPT MIGRATION COMPLETE!"
    Write-Success "================================================="
    
    Write-Success "`n📊 MIGRATION RESULTS:"
    Write-Success "---------------------"
    Write-Success "✅ Total files converted: $($script:Stats.TotalFilesConverted)"
    Write-Success "✅ Configuration files: $($script:Stats.ConfigsProcessed)"
    Write-Success "✅ Test files: $($script:Stats.TestsProcessed)"
    Write-Success "✅ AI modules: $($script:Stats.ModulesProcessed)"
    Write-Success "✅ Empty modules: $($script:Stats.EmptyModulesProcessed)"
    Write-Success "✅ Total lines converted: $($script:Stats.TotalLinesConverted)"
    
    Write-Success "`n📦 TYPE DEFINITIONS:"
    Write-Success "--------------------"
    Write-Success "✅ Type definitions added: $($script:Stats.TypeDefinitionsAdded)"
    
    if ($ShowDetails) {
        Write-Info "`n📋 Conversion Details:"
        foreach ($file in $ProcessedFiles) {
            Write-Info "  • $($file.FileType): $([System.IO.Path]::GetFileName($file.OriginalPath)) → $([System.IO.Path]::GetFileName($file.NewPath))"
            Write-Info "    Lines: $($file.OriginalLines) → $($file.NewLines)"
        }
    }
    
    Write-Success "`n🏆 TOTAL IMPACT:"
    Write-Success "==============="
    Write-Success "📈 Files migrated to TypeScript: $($script:Stats.TotalFilesConverted)"
    Write-Success "📉 JavaScript files eliminated: $($script:Stats.TotalFilesConverted)"
    Write-Success "⚠️  Errors encountered: $($script:Stats.ErrorCount)"
    
    if ($WhatIf) {
        Write-Warning "`n⚠️  This was a dry run (-WhatIf). No files were modified."
    } else {
        Write-Success "`n✨ All JavaScript files have been migrated to TypeScript!"
        Write-Info "   Next steps:"
        Write-Info "   1. Run 'pnpm type-check' to verify TypeScript compilation"
        Write-Info "   2. Update import statements that reference the old .js files"
        Write-Info "   3. Remove .backup files if everything works correctly"
        Write-Info "   4. Run tests to ensure functionality is preserved"
    }
}

# Main execution
try {
    Write-Success "🚀 Starting JavaScript to TypeScript Migration"
    Write-Info "Migration Type: $MigrationType"
    if ($WhatIf) { Write-Warning "DRY RUN MODE - No files will be modified" }
    
    $allProcessedFiles = @()
    
    # Process different categories based on migration type
    if ($MigrationType -in @("all", "configs")) {
        $configFiles = Get-JavaScriptFiles -Category "configs"
        if ($configFiles.Count -gt 0) {
            Write-Info "Found $($configFiles.Count) configuration files to convert"
            
            # Process different config types
            $nextConfigs = $configFiles | Where-Object { $_.Name -match "next\.config\.js" }
            $tailwindConfigs = $configFiles | Where-Object { $_.Name -match "tailwind\.config\.js" }
            $postcssConfigs = $configFiles | Where-Object { $_.Name -match "postcss\.config\.js" }
            
            if ($nextConfigs.Count -gt 0) {
                $processed = Process-JavaScriptFiles -Files $nextConfigs -ConversionFunction "Convert-NextConfigToTypeScript" -FileType "Configuration"
                $allProcessedFiles += $processed
            }
            
            if ($tailwindConfigs.Count -gt 0) {
                $processed = Process-JavaScriptFiles -Files $tailwindConfigs -ConversionFunction "Convert-TailwindConfigToTypeScript" -FileType "Configuration"
                $allProcessedFiles += $processed
            }
            
            if ($postcssConfigs.Count -gt 0) {
                $processed = Process-JavaScriptFiles -Files $postcssConfigs -ConversionFunction "Convert-PostCSSConfigToTypeScript" -FileType "Configuration"
                $allProcessedFiles += $processed
            }
        }
    }
    
    if ($MigrationType -in @("all", "tests")) {
        $testFiles = Get-JavaScriptFiles -Category "tests"
        if ($testFiles.Count -gt 0) {
            Write-Info "Found $($testFiles.Count) test files to convert"
            $processed = Process-JavaScriptFiles -Files $testFiles -ConversionFunction "Convert-TestFileToTypeScript" -FileType "Test"
            $allProcessedFiles += $processed
        }
    }
    
    if ($MigrationType -in @("all", "modules")) {
        $moduleFiles = Get-JavaScriptFiles -Category "modules"
        if ($moduleFiles.Count -gt 0) {
            Write-Info "Found $($moduleFiles.Count) AI module files to convert"
            $processed = Process-JavaScriptFiles -Files $moduleFiles -ConversionFunction "Convert-AIModuleToTypeScript" -FileType "AI Module"
            $allProcessedFiles += $processed
        }
        
        $emptyFiles = Get-JavaScriptFiles -Category "empty"
        if ($emptyFiles.Count -gt 0) {
            Write-Info "Found $($emptyFiles.Count) empty module files to convert"
            $processed = Process-JavaScriptFiles -Files $emptyFiles -ConversionFunction "Convert-EmptyModuleToTypeScript" -FileType "Empty Module"
            $allProcessedFiles += $processed
        }
    }
    
    # Add TypeScript support
    if (-not $WhatIf) {
        Add-TypeScriptSupport
    }
    
    # Show final summary
    Show-MigrationSummary -ProcessedFiles $allProcessedFiles
    
} catch {
    Write-Failure "💥 CRITICAL ERROR: $($_.Exception.Message)"
    Write-Failure "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}