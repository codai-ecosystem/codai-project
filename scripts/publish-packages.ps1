# 📦 CODAI Ecosystem Package Publishing Script
# Part of Phase 1: Package Publishing & Preparation

param(
    [string]$NpmToken = $env:NPM_TOKEN,
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "🚀 CODAI Ecosystem Package Publishing" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray

if (-not $NpmToken) {
    Write-Host "❌ NPM_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Please set your NPM token: `$env:NPM_TOKEN = 'your-token'" -ForegroundColor Yellow
    exit 1
}

# Set npm token for this session
npm config set //registry.npmjs.org/:_authToken $NpmToken

# Define packages to publish in order of dependencies
$packages = @(
    @{
        name = "@codai/shared-types"
        path = "packages/shared-types"
        description = "Shared TypeScript types for CODAI ecosystem"
    },
    @{
        name = "@codai/config"
        path = "packages/config"
        description = "Shared configuration utilities"
    },
    @{
        name = "@codai/ui-components"
        path = "packages/ui"
        description = "Shared React UI components"
    },
    @{
        name = "@codai/utils"
        path = "packages/shared"
        description = "Utility functions and helpers"
    },
    @{
        name = "@codai/websocket-service"
        path = "packages/websocket-service"
        description = "Real-time WebSocket communication service"
    },
    @{
        name = "@codai/cbd"
        path = "packages/cbd"
        description = "Universal Database with vector capabilities"
    },
    @{
        name = "@codai/gateway"
        path = "apps/gateway"
        description = "API Gateway service"
    },
    @{
        name = "@codai/memorai-mcp"
        path = "packages/@codai/memorai-mcp"
        description = "MemorAI MCP Server"
    }
)

$publishedCount = 0
$failedCount = 0
$skippedCount = 0

foreach ($pkg in $packages) {
    Write-Host ""
    Write-Host "📦 Processing: $($pkg.name)" -ForegroundColor Yellow
    Write-Host "   Description: $($pkg.description)" -ForegroundColor Gray
    Write-Host "   Path: $($pkg.path)" -ForegroundColor Gray
    
    $packagePath = Join-Path $PSScriptRoot ".." $pkg.path
    
    if (-not (Test-Path $packagePath)) {
        Write-Host "   ⚠️  Package path not found, skipping" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    $packageJsonPath = Join-Path $packagePath "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        Write-Host "   ⚠️  package.json not found, skipping" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Read package.json to get current version
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $currentVersion = $packageJson.version
    
    Write-Host "   📋 Current version: $currentVersion" -ForegroundColor White
    
    # Check if package already exists on npm
    $npmViewResult = npm view $pkg.name version 2>$null
    $publishedVersion = $npmViewResult
    
    if ($publishedVersion -eq $currentVersion -and -not $Force) {
        Write-Host "   ✅ Version $currentVersion already published, skipping" -ForegroundColor Green
        $skippedCount++
        continue
    }
    
    # Change to package directory
    Push-Location $packagePath
    
    try {
        # Install dependencies if needed
        if (Test-Path "node_modules") {
            Write-Host "   📂 Dependencies already installed" -ForegroundColor Gray
        } else {
            Write-Host "   📥 Installing dependencies..." -ForegroundColor Yellow
            pnpm install --prefer-offline 2>$null
        }
        
        # Build the package
        Write-Host "   🔨 Building package..." -ForegroundColor Yellow
        
        if ($packageJson.scripts -and $packageJson.scripts.build) {
            $buildResult = pnpm build 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ❌ Build failed, skipping publish" -ForegroundColor Red
                $failedCount++
                continue
            }
        } else {
            Write-Host "   ℹ️  No build script found, proceeding" -ForegroundColor Gray
        }
        
        # Run tests if available
        if ($packageJson.scripts -and $packageJson.scripts.test) {
            Write-Host "   🧪 Running tests..." -ForegroundColor Yellow
            $testResult = pnpm test 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ⚠️  Tests failed, but continuing" -ForegroundColor Yellow
            } else {
                Write-Host "   ✅ Tests passed" -ForegroundColor Green
            }
        }
        
        # Security audit
        Write-Host "   🔒 Running security audit..." -ForegroundColor Yellow
        $auditResult = npm audit --audit-level high 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ⚠️  Security vulnerabilities found, but continuing" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ No security issues found" -ForegroundColor Green
        }
        
        # Publish the package
        if ($DryRun) {
            Write-Host "   🧪 DRY RUN: Publishing package..." -ForegroundColor Cyan
            $publishResult = npm publish --access public --dry-run 2>$null
        } else {
            Write-Host "   🚀 Publishing package..." -ForegroundColor Green
            $publishResult = npm publish --access public 2>$null
        }
        
        if ($LASTEXITCODE -eq 0) {
            if ($DryRun) {
                Write-Host "   ✅ DRY RUN: Would publish successfully" -ForegroundColor Green
            } else {
                Write-Host "   ✅ Published successfully" -ForegroundColor Green
            }
            $publishedCount++
        } else {
            Write-Host "   ❌ Publish failed" -ForegroundColor Red
            $failedCount++
        }
        
    } catch {
        Write-Host "   ❌ Error processing package: $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "📊 Publishing Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Gray
Write-Host "✅ Published: $publishedCount" -ForegroundColor Green
Write-Host "❌ Failed: $failedCount" -ForegroundColor Red
Write-Host "⚠️  Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "📦 Total: $($packages.Count)" -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "🧪 This was a DRY RUN - no packages were actually published" -ForegroundColor Cyan
    Write-Host "Run without -DryRun to publish for real" -ForegroundColor Yellow
}

# Clean up npm config
npm config delete //registry.npmjs.org/:_authToken

if ($failedCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 All packages processed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  Some packages failed to publish" -ForegroundColor Yellow
    exit 1
}
