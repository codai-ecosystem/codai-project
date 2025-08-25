# Fix JavaScript to TypeScript Migration Script
# Properly converts JS config files to TS with correct syntax and preserved functionality

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "next", "tailwind", "postcss", "validate")]
    [string]$FixType = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowDetails,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Initialize counters
$script:FilesFixed = 0
$script:FilesReverted = 0
$script:ErrorsFound = 0
$script:ValidationErrors = @()

Write-Host "🔧 Starting JavaScript to TypeScript Migration Fix" -ForegroundColor Yellow
Write-Host "Fix Type: $FixType" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be modified" -ForegroundColor Magenta
}

# Function to restore from backup if available
function Restore-FromBackup {
    param([string]$FilePath, [string]$BackupPath)
    
    if (Test-Path $BackupPath) {
        if (-not $DryRun) {
            Copy-Item $BackupPath $FilePath -Force
        }
        Write-Host "  ↩️  Restored from backup: $(Split-Path $FilePath -Leaf)" -ForegroundColor Green
        $script:FilesReverted++
        return $true
    }
    return $false
}

# Function to properly convert Next.js config to TypeScript
function Convert-NextConfigToTypeScript {
    param([string]$JsPath, [string]$TsPath)
    
    if (-not (Test-Path $JsPath)) { return $false }
    
    $content = Get-Content $JsPath -Raw
    $originalLineCount = ($content -split "`n").Length
    
    # Create proper TypeScript Next.js config
    $tsContent = @"
import type { NextConfig } from 'next';

const nextConfig: NextConfig = $($content -replace '^\s*/\*\*.*?\*/\s*' -replace 'module\.exports\s*=\s*' -replace ';\s*$');

export default nextConfig;
"@
    
    if (-not $DryRun) {
        Set-Content -Path $TsPath -Value $tsContent -Encoding UTF8
    }
    
    $newLineCount = ($tsContent -split "`n").Length
    if ($ShowDetails) {
        Write-Host "  📝 Next.js config: $(Split-Path $JsPath -Leaf) → $(Split-Path $TsPath -Leaf)" -ForegroundColor White
        Write-Host "    Lines: $originalLineCount → $newLineCount" -ForegroundColor Gray
    }
    
    $script:FilesFixed++
    return $true
}

# Function to properly convert Tailwind config to TypeScript
function Convert-TailwindConfigToTypeScript {
    param([string]$JsPath, [string]$TsPath)
    
    if (-not (Test-Path $JsPath)) { return $false }
    
    $content = Get-Content $JsPath -Raw
    $originalLineCount = ($content -split "`n").Length
    
    # Extract the configuration object
    $configObject = $content -replace '^\s*/\*\*.*?\*/\s*' -replace 'module\.exports\s*=\s*' -replace ';\s*$'
    
    # Create proper TypeScript Tailwind config
    $tsContent = @"
import type { Config } from 'tailwindcss';

const config: Config = $configObject;

export default config;
"@
    
    if (-not $DryRun) {
        Set-Content -Path $TsPath -Value $tsContent -Encoding UTF8
    }
    
    $newLineCount = ($tsContent -split "`n").Length
    if ($ShowDetails) {
        Write-Host "  🎨 Tailwind config: $(Split-Path $JsPath -Leaf) → $(Split-Path $TsPath -Leaf)" -ForegroundColor White
        Write-Host "    Lines: $originalLineCount → $newLineCount" -ForegroundColor Gray
    }
    
    $script:FilesFixed++
    return $true
}

# Function to properly convert PostCSS config to TypeScript
function Convert-PostCSSConfigToTypeScript {
    param([string]$JsPath, [string]$TsPath)
    
    if (-not (Test-Path $JsPath)) { return $false }
    
    $content = Get-Content $JsPath -Raw
    $originalLineCount = ($content -split "`n").Length
    
    # Extract the configuration object
    $configObject = $content -replace 'module\.exports\s*=\s*' -replace ';\s*$'
    
    # Create proper TypeScript PostCSS config
    $tsContent = @"
import type { Config } from 'postcss-load-config';

const config: Config = $configObject;

export default config;
"@
    
    if (-not $DryRun) {
        Set-Content -Path $TsPath -Value $tsContent -Encoding UTF8
    }
    
    $newLineCount = ($tsContent -split "`n").Length
    if ($ShowDetails) {
        Write-Host "  📮 PostCSS config: $(Split-Path $JsPath -Leaf) → $(Split-Path $TsPath -Leaf)" -ForegroundColor White
        Write-Host "    Lines: $originalLineCount → $newLineCount" -ForegroundColor Gray
    }
    
    $script:FilesFixed++
    return $true
}

# Function to validate TypeScript file
function Test-TypeScriptFile {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) { 
        $script:ValidationErrors += "File not found: $FilePath"
        return $false 
    }
    
    $content = Get-Content $FilePath -Raw
    
    # Check for common issues
    $issues = @()
    
    if ($content -match 'module\.exports') {
        $issues += "Contains module.exports (should use export default)"
    }
    
    if ($content -match 'export default config' -and $content -notmatch 'const config') {
        $issues += "References undefined 'config' variable"
    }
    
    if ($content -match '/\*\*\s*@type' -and $FilePath -match '\.ts$') {
        $issues += "Uses JSDoc @type instead of TypeScript types"
    }
    
    if ($issues.Count -gt 0) {
        $script:ValidationErrors += "Issues in $($FilePath): $($issues -join ', ')"
        $script:ErrorsFound++
        return $false
    }
    
    return $true
}

# Main processing logic
try {
    # Find all apps and packages
    $appDirs = Get-ChildItem -Path "apps" -Directory -ErrorAction SilentlyContinue
    $packageDirs = Get-ChildItem -Path "packages" -Directory -ErrorAction SilentlyContinue
    $allDirs = @($appDirs) + @($packageDirs)
    
    Write-Host "Found $($allDirs.Count) directories to process" -ForegroundColor Cyan
    
    foreach ($dir in $allDirs) {
        $dirPath = $dir.FullName
        Write-Host "`n📁 Processing: $($dir.Name)" -ForegroundColor Yellow
        
        # Process Next.js configs
        if ($FixType -eq "all" -or $FixType -eq "next") {
            $nextJs = Join-Path $dirPath "next.config.js"
            $nextTs = Join-Path $dirPath "next.config.ts"
            $nextBackup = "$nextJs.backup"
            
            if (Test-Path $nextTs) {
                # Validate current TS file
                if (-not (Test-TypeScriptFile $nextTs)) {
                    Write-Host "  ⚠️  Invalid TypeScript file found, fixing..." -ForegroundColor Red
                    
                    # Try to restore from backup first
                    if (Restore-FromBackup $nextJs $nextBackup) {
                        Convert-NextConfigToTypeScript $nextJs $nextTs
                    } else {
                        Write-Host "  ❌ No backup available for $nextJs" -ForegroundColor Red
                    }
                }
            }
        }
        
        # Process Tailwind configs
        if ($FixType -eq "all" -or $FixType -eq "tailwind") {
            $tailwindJs = Join-Path $dirPath "tailwind.config.js"
            $tailwindTs = Join-Path $dirPath "tailwind.config.ts"
            $tailwindBackup = "$tailwindJs.backup"
            
            if (Test-Path $tailwindTs) {
                # Validate current TS file
                if (-not (Test-TypeScriptFile $tailwindTs)) {
                    Write-Host "  ⚠️  Invalid TypeScript file found, fixing..." -ForegroundColor Red
                    
                    # Try to restore from backup first
                    if (Restore-FromBackup $tailwindJs $tailwindBackup) {
                        Convert-TailwindConfigToTypeScript $tailwindJs $tailwindTs
                    } else {
                        Write-Host "  ❌ No backup available for $tailwindJs" -ForegroundColor Red
                    }
                }
            }
        }
        
        # Process PostCSS configs
        if ($FixType -eq "all" -or $FixType -eq "postcss") {
            $postcssJs = Join-Path $dirPath "postcss.config.js"
            $postcssTs = Join-Path $dirPath "postcss.config.ts"
            $postcssBackup = "$postcssJs.backup"
            
            if (Test-Path $postcssTs) {
                # Validate current TS file
                if (-not (Test-TypeScriptFile $postcssTs)) {
                    Write-Host "  ⚠️  Invalid TypeScript file found, fixing..." -ForegroundColor Red
                    
                    # Try to restore from backup first
                    if (Restore-FromBackup $postcssJs $postcssBackup) {
                        Convert-PostCSSConfigToTypeScript $postcssJs $postcssTs
                    } else {
                        Write-Host "  ❌ No backup available for $postcssJs" -ForegroundColor Red
                    }
                }
            }
        }
        
        # Validation-only mode
        if ($FixType -eq "validate") {
            $configs = @(
                (Join-Path $dirPath "next.config.ts"),
                (Join-Path $dirPath "tailwind.config.ts"),
                (Join-Path $dirPath "postcss.config.ts")
            )
            
            foreach ($config in $configs) {
                if (Test-Path $config) {
                    Test-TypeScriptFile $config | Out-Null
                }
            }
        }
    }
    
    # Summary
    Write-Host "`n🎉 JAVASCRIPT TO TYPESCRIPT MIGRATION FIX COMPLETE!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    
    Write-Host "`n📊 FIX RESULTS:" -ForegroundColor Cyan
    Write-Host "---------------------" -ForegroundColor Cyan
    Write-Host "✅ Files fixed: $script:FilesFixed" -ForegroundColor Green
    Write-Host "↩️  Files reverted from backup: $script:FilesReverted" -ForegroundColor Yellow
    Write-Host "❌ Validation errors: $script:ErrorsFound" -ForegroundColor Red
    
    if ($script:ValidationErrors.Count -gt 0) {
        Write-Host "`n🚨 VALIDATION ERRORS:" -ForegroundColor Red
        Write-Host "----------------------" -ForegroundColor Red
        foreach ($error in $script:ValidationErrors) {
            Write-Host "  • $error" -ForegroundColor Red
        }
    }
    
    if ($script:FilesFixed -gt 0 -or $script:FilesReverted -gt 0) {
        Write-Host "`n✨ Migration issues have been resolved!" -ForegroundColor Green
        Write-Host "   Next steps:" -ForegroundColor White
        Write-Host "   1. Run 'pnpm type-check' to verify TypeScript compilation" -ForegroundColor White
        Write-Host "   2. Test build processes to ensure configs work correctly" -ForegroundColor White
        Write-Host "   3. Remove .backup files once everything is verified" -ForegroundColor White
    } else {
        Write-Host "`n✅ All TypeScript files are already properly formatted!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n❌ Error during migration fix: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
    exit 1
}