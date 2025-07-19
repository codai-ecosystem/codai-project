# Git Repository Connection Script for Vercel Projects

param(
    [string]$Team = "codai-ro",
    [string]$GitRepo = "codai-ecosystem/codai-project"
)

$existingProjects = @(
    "acasai", "admin", "aide", "ajutai", "bancai", "codai", "docs", "fabricai", 
    "glass", "hub", "id", "jucai", "kodex", "memorai", "metu-web", "publicai", 
    "romai", "stocai", "wallet", "adoptai"
)

Write-Host "🔗 CODAI Git Repository Connection Commands" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Run these commands to connect Git repository to Vercel projects:" -ForegroundColor Cyan
Write-Host ""

foreach ($app in $existingProjects) {
    Write-Host "# Connect $app to Git repository" -ForegroundColor Yellow
    Write-Host "cd apps\$app"
    Write-Host "vercel git connect $GitRepo --scope $Team"
    Write-Host "cd ..\.. # Back to root"
    Write-Host ""
}

Write-Host "📝 Branch Configuration Commands" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""
Write-Host "After connecting Git, set up branch deployments:" -ForegroundColor Cyan
Write-Host ""

foreach ($app in $existingProjects) {
    Write-Host "# Configure branches for $app" -ForegroundColor Yellow
    Write-Host "cd apps\$app"
    Write-Host "# Production branch: main"
    Write-Host "vercel git branch main production --scope $Team"
    Write-Host "# Preview branch: preview" 
    Write-Host "vercel git branch preview preview --scope $Team"
    Write-Host "# Development branch: dev (if different from preview)"
    Write-Host "vercel git branch dev development --scope $Team"
    Write-Host "cd ..\.. # Back to root"
    Write-Host ""
}

Write-Host "🎯 Deployment Configuration" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Create vercel.json files for each app with proper configuration:" -ForegroundColor Yellow

foreach ($app in $existingProjects) {
    $vercelConfig = @{
        "version" = 2
        "builds" = @(
            @{
                "src" = "package.json"
                "use" = "@vercel/next"
            }
        )
        "regions" = @("fra1")
        "env" = @{
            "NODE_ENV" = "@node_env"
            "AZURE_OPENAI_ENDPOINT" = "@azure_openai_endpoint"
            "NEXTAUTH_URL" = "@nextauth_url"
        }
        "git" = @{
            "deploymentEnabled" = @{
                "main" = $true
                "preview" = $true
                "dev" = $true
            }
        }
    } | ConvertTo-Json -Depth 5

    Write-Host "# Create vercel.json for $app" -ForegroundColor Gray
    $vercelConfig | Out-File -FilePath "apps\$app\vercel.json" -Encoding UTF8
}

Write-Host "✅ Created vercel.json files for all apps" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run the Git connection commands above" -ForegroundColor White
Write-Host "2. Configure branch deployments" -ForegroundColor White
Write-Host "3. Push to trigger first deployments" -ForegroundColor White
Write-Host "4. Set up custom domains in Vercel dashboard" -ForegroundColor White
