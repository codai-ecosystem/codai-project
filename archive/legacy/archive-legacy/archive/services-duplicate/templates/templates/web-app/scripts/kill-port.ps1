# PowerShell script to kill processes on specified ports
# Usage: .\kill-port.ps1 6388 6389

param(
    [Parameter(Mandatory=$true)]
    [int[]]$Ports
)

foreach ($Port in $Ports) {
    Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Cyan
    
    try {
        # Get processes using the port
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
            
            Write-Host "💀 Found $($pids.Count) process(es) on port $Port, killing..." -ForegroundColor Yellow
            
            foreach ($pid in $pids) {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "✅ Killed process $pid" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️  Could not kill process $pid`: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "✅ No processes found on port $Port" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Error checking port $Port`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 Port clearing completed" -ForegroundColor Green
