#!/usr/bin/env pwsh
# Package Manager Diagnostic and Fix Script
# Comprehensive solution for npm/pnpm hanging and output issues

param(
    [switch]$Force,
    [switch]$CleanAll,
    [switch]$Verbose,
    [switch]$DryRun
)

Write-Host "🔧 Package Manager Diagnostic and Fix Utility" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Gray

$ErrorActionPreference = "Continue"
$ProgressPreference = "Continue"

# Enable verbose output if requested
if ($Verbose) {
    $VerbosePreference = "Continue"
}

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host "📋 $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Step 1: Environment Diagnosis
Write-Status "Step 1: Environment Diagnosis" "Cyan"

$nodeVersion = node --version
$npmVersion = npm --version
$pnpmVersion = if (Test-Command "pnpm") { pnpm --version } else { "Not installed" }

Write-Host "Node.js: $nodeVersion" -ForegroundColor White
Write-Host "npm: $npmVersion" -ForegroundColor White
Write-Host "pnpm: $pnpmVersion" -ForegroundColor White

# Step 2: Check for hanging processes
Write-Status "Step 2: Checking for hanging Node processes" "Cyan"

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Warning "Found $($nodeProcesses.Count) running Node processes"
    if ($Force -or $CleanAll) {
        Write-Status "Terminating hanging Node processes..."
        $nodeProcesses | ForEach-Object {
            try {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
                Write-Success "Terminated process $($_.Id)"
            }
            catch {
                Write-Warning "Could not terminate process $($_.Id): $($_.Exception.Message)"
            }
        }
    } else {
        Write-Warning "Use -Force to terminate hanging processes"
    }
}

# Step 3: Fix npm configuration
Write-Status "Step 3: Fixing npm configuration" "Cyan"

if (-not $DryRun) {
    # Clear npm cache
    Write-Status "Clearing npm cache..."
    npm cache clean --force
    
    # Fix npm registry and configuration
    npm config set registry https://registry.npmjs.org/
    npm config set progress true
    npm config set loglevel info
    npm config delete proxy
    npm config delete https-proxy
    npm config set fetch-retries 3
    npm config set fetch-retry-factor 2
    npm config set fetch-retry-mintimeout 10000
    npm config set fetch-retry-maxtimeout 60000
    
    Write-Success "npm configuration fixed"
}

# Step 4: Fix pnpm store and configuration
Write-Status "Step 4: Fixing pnpm store and configuration" "Cyan"

if (Test-Command "pnpm") {
    if (-not $DryRun) {
        # Check and fix pnpm store
        try {
            Write-Status "Checking pnpm store integrity..."
            $storeStatus = pnpm store status 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "pnpm store is corrupted, rebuilding..."
                
                # Clean pnpm store
                pnpm store prune --force
                
                # Remove corrupted store directory
                $storeDir = "E:\.pnpm-store"
                if (Test-Path $storeDir) {
                    Write-Status "Removing corrupted store directory..."
                    Remove-Item $storeDir -Recurse -Force -ErrorAction SilentlyContinue
                }
                
                # Remove cache directory
                $cacheDir = "E:\.pnpm-cache"
                if (Test-Path $cacheDir) {
                    Write-Status "Removing cache directory..."
                    Remove-Item $cacheDir -Recurse -Force -ErrorAction SilentlyContinue
                }
                
                Write-Success "pnpm store cleaned"
            }
        }
        catch {
            Write-Warning "Error checking pnpm store: $($_.Exception.Message)"
        }
    }
}

# Step 5: Create optimized .npmrc
Write-Status "Step 5: Creating optimized .npmrc configuration" "Cyan"

$npmrcContent = @"
# Performance and Reliability Configuration
# Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# PNPM Performance Optimization
shamefully-hoist=true
node-linker=hoisted
prefer-symlinked-executables=false
public-hoist-pattern=*
hoist-pattern=*

# Speed and reliability optimizations
store-dir=E:\.pnpm-store
cache-dir=E:\.pnpm-cache
prefer-offline=false
network-concurrency=8
child-concurrency=4
fetch-retries=3
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
strict-peer-dependencies=false

# Fixed output and progress settings
progress=true
reporter=default
loglevel=info
enable-pre-post-scripts=false
side-effects-cache=true
registry-supports-cache=true

# Workspace optimizations
link-workspace-packages=true
shared-workspace-lockfile=true
save-workspace-protocol=rolling
dedupe-peer-dependents=true
auto-install-peers=true

# Cache and lockfile optimizations
resolution-mode=time-based
lockfile-include-tarball-url=false
package-import-method=copy
verify-store-integrity=true

# Windows-specific optimizations
symlink=false
prefer-frozen-lockfile=false

# Registry configuration
registry=https://registry.npmjs.org/
"@

if (-not $DryRun) {
    $npmrcPath = ".\.npmrc"
    $npmrcContent | Out-File -FilePath $npmrcPath -Encoding UTF8
    Write-Success "Created optimized .npmrc configuration"
}

# Step 6: Clean workspace locks and caches
Write-Status "Step 6: Cleaning workspace locks and caches" "Cyan"

if ($CleanAll -and -not $DryRun) {
    $filesToRemove = @(
        "pnpm-lock.yaml",
        "package-lock.json",
        "yarn.lock",
        "node_modules"
    )
    
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            Write-Status "Removing $file..."
            Remove-Item $file -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Removed $file"
        }
    }
    
    # Clean all workspace node_modules
    $workspaceNodeModules = Get-ChildItem -Path "." -Recurse -Name "node_modules" -Directory | Where-Object { $_ -notmatch "\.pnpm" }
    foreach ($nodeModules in $workspaceNodeModules) {
        Write-Status "Removing workspace node_modules: $nodeModules"
        Remove-Item $nodeModules -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Step 7: Test package manager functionality
Write-Status "Step 7: Testing package manager functionality" "Cyan"

if (-not $DryRun) {
    # Test npm
    Write-Status "Testing npm functionality..."
    $npmTest = npm config list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "npm is working correctly"
    } else {
        Write-Error "npm test failed: $npmTest"
    }
    
    # Test pnpm
    if (Test-Command "pnpm") {
        Write-Status "Testing pnpm functionality..."
        $pnpmTest = pnpm config list 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "pnpm is working correctly"
        } else {
            Write-Error "pnpm test failed: $pnpmTest"
        }
    }
}

# Step 8: Recommendations
Write-Status "Step 8: Recommendations and Next Steps" "Cyan"

Write-Host @"
🎯 Recommended actions:

1. Fresh installation:
   pnpm install --force --reporter=append-only

2. For individual apps:
   cd apps/your-app
   pnpm install --verbose --reporter=append-only

3. Monitor with verbose output:
   pnpm install --verbose --reporter=append-only --loglevel=info

4. If still hanging, use timeout:
   timeout 300 pnpm install

5. Alternative: Use npm for problematic packages:
   npm install --verbose --progress=true

⚠️  If problems persist:
- Check antivirus software (exclude E:\.pnpm-store)
- Check disk space and permissions
- Consider using WSL2 for Node.js development
- Use --no-optional flag for faster installs

"@ -ForegroundColor Yellow

Write-Host "🎉 Package manager diagnostic and fix completed!" -ForegroundColor Green

if ($DryRun) {
    Write-Warning "This was a dry run. Use without -DryRun to apply changes."
}
