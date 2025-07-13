# Comprehensive Deployment Status Tracker
# Continuously monitors and reports operational services

$portRanges = @{
    "Apps" = 4030..4080
    "Infrastructure" = 4990..4999
}

function Get-OperationalServices {
    $results = @()
    
    foreach ($range in $portRanges.GetEnumerator()) {
        $connections = Get-NetTCPConnection | Where-Object {
            $_.LocalPort -in $range.Value -and $_.State -eq "Listen"
        } | Sort-Object LocalPort
        
        foreach ($conn in $connections) {
            $results += [PSCustomObject]@{
                Type = $range.Key
                Port = $conn.LocalPort
                Process = $conn.OwningProcess
                Status = "Operational"
            }
        }
    }
    
    return $results
}

# Initial status
$operational = Get-OperationalServices
$totalOperational = $operational.Count
$appServices = ($operational | Where-Object {$_.Type -eq "Apps"}).Count
$microServices = ($operational | Where-Object {$_.Type -eq "Services"}).Count

Write-Host "=== CODAI ECOSYSTEM STATUS ===" -ForegroundColor Cyan
Write-Host "Total Operational: $totalOperational" -ForegroundColor Green
Write-Host "App Services: $appServices" -ForegroundColor Yellow
Write-Host "Microservices: $microServices" -ForegroundColor Magenta
Write-Host ""

Write-Host "Operational Ports:" -ForegroundColor White
$operational | ForEach-Object {
    Write-Host "  $($_.Type) Port $($_.Port) (PID: $($_.Process))" -ForegroundColor Gray
}

# Calculate coverage
$expectedTotal = 35  # Estimated total apps + services
$coverage = [math]::Round(($totalOperational / $expectedTotal) * 100, 2)
Write-Host ""
Write-Host "Coverage: $coverage% ($totalOperational/$expectedTotal)" -ForegroundColor $(if($coverage -gt 75){"Green"}elseif($coverage -gt 50){"Yellow"}else{"Red"})
