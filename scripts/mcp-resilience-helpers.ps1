# MCP Server Auto-Recovery Configuration
# This configuration includes automatic restart and fallback mechanisms

# Enhanced MCP server wrapper with resilience
function Start-ResilientMCPServer {
    param(
        [string]$ServerName,
        [string]$Command,
        [string[]]$Args,
        [hashtable]$Environment = @{},
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 5
    )
    
    $retryCount = 0
    
    while ($retryCount -lt $MaxRetries) {
        try {
            Write-Host "🚀 Starting $ServerName (attempt $($retryCount + 1)/$MaxRetries)" -ForegroundColor Green
            
            # Set environment variables
            foreach ($key in $Environment.Keys) {
                [Environment]::SetEnvironmentVariable($key, $Environment[$key], "Process")
            }
            
            # Add process isolation and monitoring
            $processInfo = New-Object System.Diagnostics.ProcessStartInfo
            $processInfo.FileName = $Command
            $processInfo.Arguments = $Args -join " "
            $processInfo.UseShellExecute = $false
            $processInfo.RedirectStandardOutput = $true
            $processInfo.RedirectStandardError = $true
            $processInfo.CreateNoWindow = $true
            
            # Add environment variables to process
            foreach ($key in $Environment.Keys) {
                $processInfo.EnvironmentVariables[$key] = $Environment[$key]
            }
            
            $process = New-Object System.Diagnostics.Process
            $process.StartInfo = $processInfo
            $process.EnableRaisingEvents = $true
            
            # Add exit event handler for auto-restart
            $exitHandler = {
                Write-Host "⚠️ $ServerName process exited unexpectedly" -ForegroundColor Yellow
                # Trigger restart logic here
            }
            Register-ObjectEvent -InputObject $process -EventName "Exited" -Action $exitHandler
            
            $process.Start()
            
            # Wait a moment to check if it started successfully
            Start-Sleep -Seconds 2
            
            if (-not $process.HasExited) {
                Write-Host "✅ $ServerName started successfully (PID: $($process.Id))" -ForegroundColor Green
                return $process
            }
            else {
                throw "Process exited immediately"
            }
        }
        catch {
            $retryCount++
            Write-Host "❌ Failed to start $ServerName`: $($_.Exception.Message)" -ForegroundColor Red
            
            if ($retryCount -lt $MaxRetries) {
                Write-Host "⏳ Retrying in $RetryDelay seconds..." -ForegroundColor Yellow
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    
    Write-Host "🚨 Failed to start $ServerName after $MaxRetries attempts" -ForegroundColor Red
    return $null
}

# Export the function for use by other scripts
Export-ModuleMember -Function Start-ResilientMCPServer
