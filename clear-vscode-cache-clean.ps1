# Glass MCP VS Code Cache Cleaner Script
Write-Host "🧹 Clearing VS Code and npm caches for Glass MCP..." -ForegroundColor Cyan

# Clear npm cache
Write-Host "  📦 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force | Out-Null

# Clear npx cache  
Write-Host "  ⚡ Clearing npx cache..." -ForegroundColor Yellow
npx clear-npx-cache 2>$null | Out-Null

# Clear VS Code extension cache
$vscodeCache = "$env:APPDATA\Code\CachedExtensions"
if (Test-Path $vscodeCache) {
    Write-Host "  🔧 Clearing VS Code extension cache..." -ForegroundColor Yellow
    Remove-Item $vscodeCache -Recurse -Force -ErrorAction SilentlyContinue
}

# Clear VS Code user data cache
$vscodeUserCache = "$env:APPDATA\Code\User\workspaceStorage"
if (Test-Path $vscodeUserCache) {
    Write-Host "  🗃️ Clearing VS Code workspace storage..." -ForegroundColor Yellow  
    Get-ChildItem $vscodeUserCache -Directory | Where-Object { $_.Name -like "*codai*" } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# Clear VS Code MCP cache
$mcpCache = "$env:APPDATA\Code\User\globalStorage"
if (Test-Path $mcpCache) {
    Write-Host "  🤖 Clearing VS Code MCP cache..." -ForegroundColor Yellow
    Get-ChildItem $mcpCache -Directory -Recurse | Where-Object { $_.Name -like "*mcp*" -or $_.Name -like "*glass*" } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✅ Cache clearing completed successfully!" -ForegroundColor Green  
Write-Host "🔄 Please restart VS Code to use Glass MCP v9.1.0 with all 37 tools." -ForegroundColor Cyan
Write-Host ""