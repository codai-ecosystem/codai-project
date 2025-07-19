# CODAI Master Environment Setup Runner
# This script runs all environment variable batches

Write-Host '🚀 CODAI Master Environment Setup' -ForegroundColor Green
Write-Host '===============================' -ForegroundColor Green

Write-Host 'Starting Group1_Core - Apps: codai, admin, hub, docs, id' -ForegroundColor Yellow
.\scripts\env-Group1_Core.bat
Write-Host 'Group1_Core completed!
' -ForegroundColor Green

Write-Host 'Starting Group2_AI_Platforms - Apps: aide, ajutai, memorai, romai, fabricai' -ForegroundColor Yellow
.\scripts\env-Group2_AI_Platforms.bat
Write-Host 'Group2_AI_Platforms completed!
' -ForegroundColor Green

Write-Host 'Starting Group3_Finance - Apps: bancai, stocai, wallet' -ForegroundColor Yellow
.\scripts\env-Group3_Finance.bat
Write-Host 'Group3_Finance completed!
' -ForegroundColor Green

Write-Host 'Starting Group4_Specialized - Apps: acasai, publicai, jucai, glass, kodex' -ForegroundColor Yellow
.\scripts\env-Group4_Specialized.bat
Write-Host 'Group4_Specialized completed!
' -ForegroundColor Green

Write-Host 'Starting Group5_New_Apps - Apps: metu-web, adoptai' -ForegroundColor Yellow
.\scripts\env-Group5_New_Apps.bat
Write-Host 'Group5_New_Apps completed!
' -ForegroundColor Green

Write-Host '✅ All environment variables setup completed!' -ForegroundColor Green
Write-Host '🎯 Next steps:' -ForegroundColor Cyan
Write-Host '  1. Connect Git repositories: .\scripts\connect-git.ps1' -ForegroundColor White
Write-Host '  2. Configure domains in Vercel dashboard' -ForegroundColor White
Write-Host '  3. Test deployments' -ForegroundColor White
