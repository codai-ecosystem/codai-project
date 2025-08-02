#!/usr/bin/env pwsh
# CODAI Frontend Deployment Script for Vercel

Write-Host "🚀 CODAI Frontend Deployment to Vercel" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Define services to deploy
$services = @(
    @{
        Name = "Hub Simple"
        Directory = "apps/hub-simple"
        ProjectName = "codai-hub"
        Domain = "hub.codai.ro"
        Description = "Service registry and system coordination"
    },
    @{
        Name = "Auth Simple"
        Directory = "apps/auth-simple"
        ProjectName = "codai-auth"
        Domain = "auth.codai.ro"
        Description = "Authentication and authorization service"
    },
    @{
        Name = "ID Simple"
        Directory = "apps/id-simple"
        ProjectName = "codai-id"
        Domain = "id.codai.ro"
        Description = "Identity and user management service"
    },
    @{
        Name = "CODAI Platform"
        Directory = "apps/codai"
        ProjectName = "codai-main"
        Domain = "api.codai.ro"
        Description = "Main AI development platform"
    },
    @{
        Name = "MemorAI Platform"
        Directory = "apps/memorai"
        ProjectName = "memorai-platform"
        Domain = "memorai.ro"
        Description = "Memory and knowledge management platform"
    }
)

Write-Host "📋 Deployment Plan:" -ForegroundColor Yellow
foreach ($service in $services) {
    Write-Host "  • $($service.Name) → $($service.Domain)" -ForegroundColor White
}
Write-Host ""

# Deploy each service
$deployedServices = @()
$failedServices = @()

foreach ($service in $services) {
    try {
        Write-Host "🚀 Deploying $($service.Name)..." -ForegroundColor Cyan
        Write-Host "   Directory: $($service.Directory)" -ForegroundColor Gray
        Write-Host "   Domain: $($service.Domain)" -ForegroundColor Gray
        
        # Change to service directory
        Set-Location $service.Directory
        
        # Deploy to Vercel
        $deployResult = vercel --prod --yes --name $service.ProjectName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $($service.Name) deployed successfully!" -ForegroundColor Green
            $deployedServices += $service
        } else {
            Write-Host "   ❌ $($service.Name) deployment failed!" -ForegroundColor Red
            Write-Host "   Error: $deployResult" -ForegroundColor Red
            $failedServices += $service
        }
        
        # Return to root directory
        Set-Location "../.."
        
        Write-Host ""
        
    } catch {
        Write-Host "   ❌ $($service.Name) deployment failed with exception!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $failedServices += $service
        Set-Location "../.."
        Write-Host ""
    }
}

# Summary
Write-Host "📊 Deployment Summary" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

if ($deployedServices.Count -gt 0) {
    Write-Host "✅ Successfully Deployed ($($deployedServices.Count)):" -ForegroundColor Green
    foreach ($service in $deployedServices) {
        Write-Host "   • $($service.Name) → $($service.Domain)" -ForegroundColor Green
    }
    Write-Host ""
}

if ($failedServices.Count -gt 0) {
    Write-Host "❌ Failed Deployments ($($failedServices.Count)):" -ForegroundColor Red
    foreach ($service in $failedServices) {
        Write-Host "   • $($service.Name) → $($service.Domain)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domains in Vercel dashboard" -ForegroundColor White
Write-Host "2. Update DNS records to point to Vercel" -ForegroundColor White
Write-Host "3. Configure environment variables" -ForegroundColor White
Write-Host "4. Test cross-service integration" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Backend API Gateway:" -ForegroundColor Magenta
Write-Host "   • api.codai.ro → aba0948c8ba14480982393668b20b88d-1205655413.eu-west-1.elb.amazonaws.com" -ForegroundColor White
Write-Host ""

if ($deployedServices.Count -eq $services.Count) {
    Write-Host "🎉 ALL SERVICES DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some deployments failed. Check errors above." -ForegroundColor Yellow
    exit 1
}
