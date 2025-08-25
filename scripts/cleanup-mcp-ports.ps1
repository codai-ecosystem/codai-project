# ControlAI MCP Port Cleanup Script
# This script helps clean up ports used by MCP servers before restart

Write-Host "🔧 ControlAI MCP Port Cleanup Script" -ForegroundColor Green
Write-Host ""

# Ports used by MCP servers
$ports = @(6001, 6002, 6003, 4180, 6366, 6367)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Yellow
    
    $connections = netstat -ano | findstr ":$port"
    if ($connections) {
        Write-Host "Found processes using port $port:" -ForegroundColor Red
        $connections | ForEach-Object {
            if ($_ -match '\s+(\d+)$') {
                $pid = $matches[1]
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  PID: $pid - $($process.ProcessName)" -ForegroundColor Red
                        Write-Host "  Killing process $pid..." -ForegroundColor Yellow
                        taskkill /PID $pid /F | Out-Null
                        Write-Host "  ✅ Process $pid terminated" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  ⚠️ Could not terminate PID: $pid" -ForegroundColor Orange
                }
            }
        }
    } else {
        Write-Host "  ✅ Port $port is free" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Port cleanup completed! You can now restart the MCP servers." -ForegroundColor Green
Write-Host ""

# Verify all ports are free
Write-Host "Final verification:" -ForegroundColor Yellow
foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port"
    if ($connections) {
        Write-Host "  ⚠️ Port $port still in use" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Port $port is free" -ForegroundColor Green
    }
}
