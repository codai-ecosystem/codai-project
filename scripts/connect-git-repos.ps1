# Connect Git repository to Vercel projects
# This script handles Git connections separately since it requires special permissions

$vercelTeam = "codai-ro"
$gitRepository = "codai-ecosystem/codai-project"

# Get list of projects
Write-Host "🔗 Connecting Git repository to Vercel projects..." -ForegroundColor Cyan
Write-Host "Repository: $gitRepository" -ForegroundColor Gray
Write-Host "Team: $vercelTeam" -ForegroundColor Gray

$projects = vercel projects ls --scope $vercelTeam --format json | ConvertFrom-Json

foreach ($project in $projects) {
    $projectName = $project.name
    
    Write-Host "🔗 Connecting $projectName to Git..." -ForegroundColor Yellow
    
    try {
        # Connect Git repository to project
        vercel project settings $projectName --scope $vercelTeam --git-repository $gitRepository
        
        # Set up automatic deployments
        vercel project settings $projectName --scope $vercelTeam --auto-assign-custom-domains true
        vercel project settings $projectName --scope $vercelTeam --protection-bypass-for-automation true
        
        Write-Host "✅ Connected $projectName to Git" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to connect $projectName`: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep 1
}

Write-Host ""
Write-Host "🎉 Git connection setup complete!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Verify Git connections in Vercel dashboard" -ForegroundColor White
Write-Host "   2. Configure branch settings for each project" -ForegroundColor White
Write-Host "   3. Test deployments" -ForegroundColor White
