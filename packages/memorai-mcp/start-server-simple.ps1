# MemorAI MCP Server Startup Script
# Simple version to start the server

$ServerPath = "e:\GitHub\codai-project\packages\memorai-mcp\memorai-mcp-vscode.cjs"
$Port = 4950

Write-Host "🧠 Starting MemorAI MCP Server..." -ForegroundColor Cyan

# Check if already running
$existing = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*memorai-mcp-vscode.cjs*"
}

if ($existing) {
    Write-Host "✅ MemorAI MCP Server is already running (PID: $($existing.Id))" -ForegroundColor Green
} else {
    # Start the server
    Write-Host "Starting server process..." -ForegroundColor Yellow
    $process = Start-Process -FilePath "node" -ArgumentList $ServerPath -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 3
    
    # Test health
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health" -Method Get -TimeoutSec 5
        Write-Host "✅ MemorAI MCP Server started successfully!" -ForegroundColor Green
        Write-Host "   PID: $($process.Id)" -ForegroundColor Cyan
        Write-Host "   Service: $($response.service)" -ForegroundColor Cyan
        Write-Host "   Port: $($response.port)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Server may not have started properly: $($_.Exception.Message)" -ForegroundColor Red
    }
}
