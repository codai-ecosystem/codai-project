# Critical Apps Startup Script
# Starts MEMORAI, BANCAI, LOGAI, STOCAI in sequence

Write-Host "🚀 Starting Critical CODAI Apps..." -ForegroundColor Green

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

# Function to start app in new window
function Start-App {
    param([string]$AppName, [int]$Port, [string]$Path)
    
    if (Test-Port -Port $Port) {
        Write-Host "✅ Starting $AppName on port $Port..." -ForegroundColor Cyan
        Start-Process pwsh -ArgumentList '-NoExit', '-Command', "Set-Location '$Path'; pnpm dev --port $Port"
        Start-Sleep 3
    } else {
        Write-Host "❌ Port $Port is already in use for $AppName" -ForegroundColor Red
    }
}

# Start apps in sequence
Start-App -AppName "MEMORAI" -Port 4031 -Path "E:\GitHub\codai-project\apps\memorai"
Start-App -AppName "BANCAI" -Port 4033 -Path "E:\GitHub\codai-project\apps\bancai"  
Start-App -AppName "LOGAI" -Port 4032 -Path "E:\GitHub\codai-project\apps\logai"
Start-App -AppName "STOCAI" -Port 4065 -Path "E:\GitHub\codai-project\apps\stocai"

Write-Host "🎉 All critical apps startup initiated!" -ForegroundColor Green
Write-Host "📝 Access URLs:" -ForegroundColor Yellow
Write-Host "   MEMORAI: http://localhost:4031" -ForegroundColor White
Write-Host "   BANCAI:  http://localhost:4033" -ForegroundColor White  
Write-Host "   LOGAI:   http://localhost:4032" -ForegroundColor White
Write-Host "   STOCAI:  http://localhost:4065" -ForegroundColor White
