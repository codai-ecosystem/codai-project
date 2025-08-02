# PowerShell Health Check Utility
# Checks service health with retry logic and comprehensive reporting
param(
    [string]$Url,
    [int]$MaxRetries = 5,
    [int]$DelaySeconds = 2,
    [int]$TimeoutSeconds = 5,
    [switch]$Verbose = $false
)

Write-Host "🔍 CODAI Health Check Utility" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

if (-not $Url) {
    Write-Host "❌ URL parameter is required" -ForegroundColor Red
    Write-Host "Usage: .\health-check.ps1 -Url 'http://localhost:4180/health'" -ForegroundColor Yellow
    exit 1
}

function Test-ServiceHealth {
    param(
        [string]$TestUrl,
        [int]$Retries,
        [int]$Delay,
        [int]$Timeout
    )
    
    for ($i = 1; $i -le $Retries; $i++) {
        try {
            Write-Host "🔄 Attempt $i/$Retries - Testing $TestUrl" -ForegroundColor Yellow
            
            # Create a web request with timeout
            $request = [System.Net.WebRequest]::Create($TestUrl)
            $request.Timeout = $Timeout * 1000  # Convert to milliseconds
            $request.Method = "GET"
            
            $response = $request.GetResponse()
            $statusCode = [int]$response.StatusCode
            $response.Close()
            
            if ($statusCode -eq 200) {
                Write-Host "✅ $TestUrl is healthy (Status: $statusCode)" -ForegroundColor Green
                return @{
                    Success = $true
                    StatusCode = $statusCode
                    Attempts = $i
                    Message = "Service is healthy"
                }
            }
            else {
                Write-Host "⚠️ $TestUrl returned status $statusCode" -ForegroundColor Yellow
            }
        }
        catch [System.Net.WebException] {
            $errorMessage = $_.Exception.Message
            if ($Verbose) {
                Write-Host "🔄 Network error on attempt $i`: $errorMessage" -ForegroundColor Gray
            }
        }
        catch {
            $errorMessage = $_.Exception.Message
            if ($Verbose) {
                Write-Host "🔄 General error on attempt $i`: $errorMessage" -ForegroundColor Gray
            }
        }
        
        if ($i -lt $Retries) {
            Write-Host "⏱️ Waiting $Delay seconds before retry..." -ForegroundColor Gray
            Start-Sleep $Delay
        }
    }
    
    Write-Host "❌ $TestUrl failed all $Retries health checks" -ForegroundColor Red
    return @{
        Success = $false
        StatusCode = $null
        Attempts = $Retries
        Message = "Service is not responding"
    }
}

# Perform health check
$result = Test-ServiceHealth -TestUrl $Url -Retries $MaxRetries -Delay $DelaySeconds -Timeout $TimeoutSeconds

# Output results
Write-Host "`n📊 Health Check Results:" -ForegroundColor Cyan
Write-Host "URL: $Url" -ForegroundColor White
Write-Host "Attempts: $($result.Attempts)" -ForegroundColor White
Write-Host "Status: $($result.Message)" -ForegroundColor White

if ($result.Success) {
    Write-Host "Result: ✅ HEALTHY" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Result: ❌ UNHEALTHY" -ForegroundColor Red
    exit 1
}
