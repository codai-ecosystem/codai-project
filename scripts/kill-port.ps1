param([Parameter(Mandatory=$true)][int]$Port)

Write-Host ("🔧 Freeing TCP port {0}..." -f $Port) -ForegroundColor Cyan

try {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) { Write-Host "No process listening on port $Port" -ForegroundColor Yellow; exit 0 }
  $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  Write-Host ("Found PIDs: {0}" -f ($pids -join ',')) -ForegroundColor Gray
  foreach ($procId in $pids) {
    try { Stop-Process -Id $procId -Force -ErrorAction Stop; Write-Host ("Killed PID {0}" -f $procId) -ForegroundColor Green }
    catch { Write-Host ("Failed to kill {0}: {1}" -f $procId, $_.Exception.Message) -ForegroundColor Red }
  }
}
catch {
  Write-Host ("Error checking/killing port {0}: {1}" -f $Port, $_.Exception.Message) -ForegroundColor Red
  exit 1
}
