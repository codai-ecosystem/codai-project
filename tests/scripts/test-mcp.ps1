#!/usr/bin/env pwsh

Write-Host "Starting MCP Test..."
Write-Host "Current directory: $(Get-Location)"
Write-Host "Environment variables:"
Write-Host "  DOTENV_CONFIG_PATH: $env:DOTENV_CONFIG_PATH"

# Set the environment variable
$env:DOTENV_CONFIG_PATH = "E:\GitHub\workspace-ai\.env"
Write-Host "Set DOTENV_CONFIG_PATH to: $env:DOTENV_CONFIG_PATH"

# Change to workspace-ai directory
Set-Location "E:\GitHub\workspace-ai"
Write-Host "Changed to directory: $(Get-Location)"

# Start the MCP server process with output capture
Write-Host "Starting npx @codai/memorai-mcp@latest..."

$processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
$processStartInfo.FileName = "npx"
$processStartInfo.Arguments = "@codai/memorai-mcp@latest"
$processStartInfo.UseShellExecute = $false
$processStartInfo.RedirectStandardInput = $true
$processStartInfo.RedirectStandardOutput = $true
$processStartInfo.RedirectStandardError = $true
$processStartInfo.CreateNoWindow = $true
$processStartInfo.WorkingDirectory = "E:\GitHub\workspace-ai"

$process = [System.Diagnostics.Process]::Start($processStartInfo)

Write-Host "MCP Process started with PID: $($process.Id)"

# Read output asynchronously
$stdout = ""
$stderr = ""

# Wait a bit for startup
Start-Sleep 3

if ($process.HasExited) {
    Write-Host "Process has exited with code: $($process.ExitCode)"
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
} else {
    Write-Host "Process is still running"
    
    # Send an initialize request
    try {
        $initMessage = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{}}}'
        Write-Host "Sending initialize message: $initMessage"
        
        $process.StandardInput.WriteLine($initMessage)
        $process.StandardInput.Flush()
        
        # Wait for response
        Start-Sleep 5
        
        if ($process.HasExited) {
            Write-Host "Process exited after initialize with code: $($process.ExitCode)"
        } else {
            Write-Host "Process still running after initialize"
        }
        
        # Try to read available output
        if ($process.StandardOutput.Peek() -ne -1) {
            $stdout = $process.StandardOutput.ReadToEnd()
        }
        if ($process.StandardError.Peek() -ne -1) {
            $stderr = $process.StandardError.ReadToEnd()
        }
    } catch {
        Write-Host "Error during communication: $_"
    }
    
    # Kill the process if still running
    if (-not $process.HasExited) {
        $process.Kill()
        Write-Host "Process killed"
    }
}

# Read any remaining outputs
try {
    if (-not $stdout) {
        $stdout = $process.StandardOutput.ReadToEnd()
    }
    if (-not $stderr) {
        $stderr = $process.StandardError.ReadToEnd()
    }
} catch {
    Write-Host "Error reading final output: $_"
}

Write-Host "`n=== STDOUT ==="
if ($stdout) {
    Write-Host $stdout
} else {
    Write-Host "No stdout output"
}

Write-Host "`n=== STDERR ==="
if ($stderr) {
    Write-Host $stderr
} else {
    Write-Host "No stderr output"
}

Write-Host "`nTest completed."
