# 🌐 CODAI Frontend Deployment Script for Vercel
# Part of Phase 2: Frontend Deployment

param(
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [switch]$DryRun = $false,
    [switch]$Production = $true
)

Write-Host "🌐 CODAI Frontend Deployment to Vercel" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Gray

if (-not $VercelToken) {
    Write-Host "❌ VERCEL_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "Please set your Vercel token: `$env:VERCEL_TOKEN = 'your-token'" -ForegroundColor Yellow
    exit 1
}

# Define applications to deploy
$applications = @(
    @{
        name = "CODAI App"
        path = "apps/codai"
        domain = "codai.com"
        port = "4001"
        description = "Main CODAI application"
    },
    @{
        name = "ID Service"
        path = "apps/id"
        domain = "id.codai.com"
        port = "4004"
        description = "Identity and authentication service"
    },
    @{
        name = "BancAI App"
        path = "apps/bancai"
        domain = "bancai.com"
        port = "4005"
        description = "Romanian banking AI platform"
    },
    @{
        name = "MemorAI App"
        path = "apps/memorai"
        domain = "memorai.com"
        port = "4006"
        description = "Memory and knowledge management"
    },
    @{
        name = "Admin Dashboard"
        path = "apps/admin"
        domain = "admin.codai.com"
        port = "4007"
        description = "Administrative interface"
    },
    @{
        name = "Hub App"
        path = "apps/hub"
        domain = "hub.codai.com"
        port = "4008"
        description = "Central navigation hub"
    },
    @{
        name = "MemorAI Docs"
        path = "apps/memorai-docs"
        domain = "docs.memorai.com"
        port = "4009"
        description = "MemorAI documentation"
    },
    @{
        name = "ControlAI Dashboard"
        path = "apps/controlai-dashboard"
        domain = "control.codai.com"
        port = "4200"
        description = "AI project management dashboard"
    },
    @{
        name = "RomAI App"
        path = "apps/romai"
        domain = "romai.com"
        port = "6100"
        description = "Romanian AI application"
    }
)

$deployedCount = 0
$failedCount = 0
$skippedCount = 0

# Install Vercel CLI if not available
Write-Host "🔧 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel
Write-Host "🔐 Authenticating with Vercel..." -ForegroundColor Yellow
$env:VERCEL_TOKEN = $VercelToken
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel authentication failed" -ForegroundColor Red
    exit 1
}

foreach ($app in $applications) {
    Write-Host ""
    Write-Host "🚀 Deploying: $($app.name)" -ForegroundColor Yellow
    Write-Host "   Domain: $($app.domain)" -ForegroundColor White
    Write-Host "   Path: $($app.path)" -ForegroundColor Gray
    Write-Host "   Description: $($app.description)" -ForegroundColor Gray
    
    $appPath = Join-Path $PSScriptRoot ".." $app.path
    
    if (-not (Test-Path $appPath)) {
        Write-Host "   ⚠️  Application path not found, skipping" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    $packageJsonPath = Join-Path $appPath "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        Write-Host "   ⚠️  package.json not found, skipping" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Change to app directory
    Push-Location $appPath
    
    try {
        # Install dependencies
        Write-Host "   📥 Installing dependencies..." -ForegroundColor Yellow
        pnpm install --prefer-offline
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Dependency installation failed" -ForegroundColor Red
            $failedCount++
            continue
        }
        
        # Build the application
        Write-Host "   🔨 Building application..." -ForegroundColor Yellow
        $env:NODE_ENV = "production"
        $env:NODE_OPTIONS = "--max-old-space-size=4096"
        
        pnpm build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Build failed" -ForegroundColor Red
            $failedCount++
            continue
        }
        
        # Create or update vercel.json configuration
        $vercelConfig = @{
            version = 2
            builds = @(
                @{
                    src = "package.json"
                    use = "@vercel/next"
                }
            )
            regions = @("iad1", "fra1", "sin1")  # US East, Europe, Singapore
            env = @{
                NODE_ENV = "production"
                NODE_OPTIONS = "--max-old-space-size=4096"
            }
        }
        
        $vercelConfig | ConvertTo-Json -Depth 5 | Out-File -FilePath "vercel.json" -Encoding utf8
        Write-Host "   ⚙️  Created vercel.json configuration" -ForegroundColor Gray
        
        # Deploy to Vercel
        if ($DryRun) {
            Write-Host "   🧪 DRY RUN: Would deploy to Vercel" -ForegroundColor Cyan
            $deployedCount++
        } else {
            Write-Host "   🌐 Deploying to Vercel..." -ForegroundColor Green
            
            if ($Production) {
                $deployResult = vercel --prod --token $VercelToken --yes 2>&1
            } else {
                $deployResult = vercel --token $VercelToken --yes 2>&1
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Deployed successfully" -ForegroundColor Green
                
                # Extract deployment URL
                $deploymentUrl = $deployResult | Select-String -Pattern "https://.*\.vercel\.app" | ForEach-Object { $_.Matches[0].Value }
                if ($deploymentUrl) {
                    Write-Host "   🔗 Deployment URL: $deploymentUrl" -ForegroundColor Cyan
                }
                
                # Configure custom domain if specified
                if ($app.domain -and $Production) {
                    Write-Host "   🌍 Configuring domain: $($app.domain)" -ForegroundColor Yellow
                    
                    # Add domain to Vercel
                    $domainResult = vercel domains add $app.domain --token $VercelToken 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "   ✅ Domain configured successfully" -ForegroundColor Green
                    } else {
                        Write-Host "   ⚠️  Domain configuration may need manual setup" -ForegroundColor Yellow
                    }
                    
                    # Configure SSL certificate
                    Write-Host "   🔒 Configuring SSL certificate..." -ForegroundColor Yellow
                    $certResult = vercel certs add $app.domain --token $VercelToken 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "   ✅ SSL certificate configured" -ForegroundColor Green
                    } else {
                        Write-Host "   ⚠️  SSL certificate will be auto-generated" -ForegroundColor Yellow
                    }
                }
                
                $deployedCount++
            } else {
                Write-Host "   ❌ Deployment failed" -ForegroundColor Red
                Write-Host "   Error: $deployResult" -ForegroundColor Gray
                $failedCount++
            }
        }
        
        # Performance validation
        if (-not $DryRun -and $deploymentUrl) {
            Write-Host "   🏃 Running performance check..." -ForegroundColor Yellow
            
            # Test deployment health
            try {
                $response = Invoke-WebRequest -Uri $deploymentUrl -TimeoutSec 30 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Host "   ✅ Health check passed" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️  Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ⚠️  Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "   ❌ Error deploying application: $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Gray
Write-Host "✅ Deployed: $deployedCount" -ForegroundColor Green
Write-Host "❌ Failed: $failedCount" -ForegroundColor Red
Write-Host "⚠️  Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "🌐 Total: $($applications.Count)" -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "🧪 This was a DRY RUN - no applications were actually deployed" -ForegroundColor Cyan
    Write-Host "Run without -DryRun to deploy for real" -ForegroundColor Yellow
}

if ($failedCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 All applications deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Configure DNS nameservers with Vercel" -ForegroundColor White
    Write-Host "2. Verify SSL certificates are active" -ForegroundColor White
    Write-Host "3. Test all application functionality" -ForegroundColor White
    Write-Host "4. Monitor performance and uptime" -ForegroundColor White
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  Some applications failed to deploy" -ForegroundColor Yellow
    exit 1
}
