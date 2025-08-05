# 🚀 Improved CBD & MemorAI MCP Startup Script
# Portable script with better process management and crash prevention
# Version: 1.1.0 - Fixed server crash issues
# Date: August 5, 2025

param(
    [string]$CodaiProjectPath = "",
    [int]$CBDPort = 8080,
    [int]$MemorAIPort = 4950,
    [switch]$Verbose,
    [switch]$Help,
    [switch]$StatusCheck,
    [switch]$Stop,
    [switch]$Restart
)

# Global process tracking
$Global:StartedProcesses = @()

# Enhanced logging functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
function Write-Debug { param($Message) if ($Verbose) { Write-Host "[DEBUG] $Message" -ForegroundColor Gray } }

# Show help
if ($Help) {
    Write-Host "🚀 Improved CBD & MemorAI MCP Startup Script v1.1.0" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:"
    Write-Host "  .\start-cbd-memorai-improved.ps1 [OPTIONS] [CODAI_PROJECT_PATH]"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "  -Help            Show this help"
    Write-Host "  -Verbose         Enable verbose logging"
    Write-Host "  -StatusCheck     Check service status"
    Write-Host "  -Stop            Stop all services"
    Write-Host "  -Restart         Restart all services"
    Write-Host "  -CBDPort PORT    CBD port (default: 8080)"
    Write-Host "  -MemorAIPort PORT MemorAI port (default: 4950)"
    Write-Host ""
    Write-Host "🆕 IMPROVEMENTS IN v1.1.0:"
    Write-Host "  • Better process management prevents multiple instances"
    Write-Host "  • Enhanced cleanup to prevent server crashes"
    Write-Host "  • Process tracking and automatic cleanup on exit"
    Write-Host "  • Improved error handling and recovery"
    Write-Host "  • Fixed nohup-style background process issues"
    Write-Host ""
    exit 0
}

# Enhanced cleanup function
function Stop-ServiceOnPort {
    param([int]$Port, [string]$ServiceName)
    
    Write-Debug "Checking for processes on port $Port..."
    
    try {
        # Get processes listening on the port
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                if ($processId -and $processId -ne 0) {
                    Write-Info "🛑 Stopping $ServiceName (PID: $processId) on port $Port"
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                }
            }
            Write-Success "✅ Cleaned up port $Port"
        } else {
            Write-Debug "$ServiceName is not running on port $Port"
        }
    }
    catch {
        Write-Debug "Error checking port ${Port}: $($_.Exception.Message)"
    }
}

# Enhanced process cleanup
function Stop-AllNodeProcesses {
    Write-Info "🧹 Performing comprehensive Node.js cleanup..."
    
    try {
        # Get all node processes
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            Write-Info "Found $($nodeProcesses.Count) Node.js processes to clean up"
            
            foreach ($process in $nodeProcesses) {
                Write-Debug "Stopping Node.js process PID: $($process.Id)"
                try {
                    $process.Kill()
                    $process.WaitForExit(2000)  # Wait up to 2 seconds
                }
                catch {
                    Write-Debug "Force killing process $($process.Id)"
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            }
            
            # Wait for cleanup
            Start-Sleep -Seconds 2
            Write-Success "✅ Node.js processes cleaned up"
        }
        else {
            Write-Debug "No Node.js processes found"
        }
    }
    catch {
        Write-Warning "⚠️ Error during Node.js cleanup: $($_.Exception.Message)"
    }
}

# Enhanced health check with retry
function Test-ServiceHealth {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxRetries = 3,
        [int]$DelayMs = 1000
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            Write-Debug "Health check attempt $i/$MaxRetries for $ServiceName"
            $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Success "✅ $ServiceName is healthy"
            return $true
        }
        catch {
            if ($i -eq $MaxRetries) {
                Write-Warning "⚠️ $ServiceName health check failed after $MaxRetries attempts"
                return $false
            }
            Write-Debug "Health check failed (attempt $i/$MaxRetries), retrying in $($DelayMs/1000)s..."
            Start-Sleep -Milliseconds $DelayMs
        }
    }
    return $false
}

# Enhanced process start with better tracking
function Start-ServiceProcess {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command,
        [string[]]$Arguments,
        [hashtable]$EnvironmentVars = @{},
        [int]$Port
    )
    
    try {
        Write-Info "🚀 Starting $ServiceName..."
        Write-Debug "Working Directory: $WorkingDirectory"
        Write-Debug "Command: $Command $($Arguments -join ' ')"
        
        # Set environment variables
        foreach ($key in $EnvironmentVars.Keys) {
            Set-Item -Path "env:\$key" -Value $EnvironmentVars[$key]
            Write-Debug "Set env var: $key = $($EnvironmentVars[$key])"
        }
        
        # Create process start info
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = $Command
        $processInfo.Arguments = $Arguments -join " "
        $processInfo.WorkingDirectory = $WorkingDirectory
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        
        # Add environment variables to process
        foreach ($key in $EnvironmentVars.Keys) {
            $processInfo.EnvironmentVariables[$key] = $EnvironmentVars[$key]
        }
        
        # Start the process
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        
        # Add event handlers for output (to prevent buffer overflow)
        $outputBuilder = New-Object System.Text.StringBuilder
        $errorBuilder = New-Object System.Text.StringBuilder
        
        Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action {
            if ($Event.SourceEventArgs.Data) {
                [void]$outputBuilder.AppendLine($Event.SourceEventArgs.Data)
            }
        } | Out-Null
        
        Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action {
            if ($Event.SourceEventArgs.Data) {
                [void]$errorBuilder.AppendLine($Event.SourceEventArgs.Data)
            }
        } | Out-Null
        
        # Start the process
        [void]$process.Start()
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()
        
        # Track the process globally
        $Global:StartedProcesses += @{
            Process = $process
            ServiceName = $ServiceName
            Port = $Port
            StartTime = Get-Date
        }
        
        Write-Success "✅ $ServiceName started (PID: $($process.Id))"
        
        # Give it a moment to initialize
        Start-Sleep -Seconds 3
        
        # Verify health if port specified
        if ($Port) {
            $healthy = Test-ServiceHealth -Url "http://localhost:$Port/health" -ServiceName $ServiceName -MaxRetries 2
            if (-not $healthy) {
                Write-Warning "⚠️ $ServiceName may not have started correctly"
            }
        }
        
        return $process
    }
    catch {
        Write-Error "❌ Failed to start $ServiceName`: $($_.Exception.Message)"
        return $null
    }
}

# Cleanup handler for graceful shutdown
function Stop-TrackedProcesses {
    Write-Info "🧹 Cleaning up tracked processes..."
    
    foreach ($procInfo in $Global:StartedProcesses) {
        try {
            if ($procInfo.Process -and -not $procInfo.Process.HasExited) {
                Write-Info "🛑 Stopping $($procInfo.ServiceName) (PID: $($procInfo.Process.Id))"
                $procInfo.Process.Kill()
                $procInfo.Process.WaitForExit(2000)
            }
        }
        catch {
            Write-Debug "Error stopping process: $($_.Exception.Message)"
        }
    }
    
    $Global:StartedProcesses = @()
}

# Register cleanup handler
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Stop-TrackedProcesses
} | Out-Null

# Auto-detect codai-project path
if (-not $CodaiProjectPath) {
    Write-Info "🔍 Auto-detecting codai-project path..."
    
    $possiblePaths = @(
        "C:\Users\$env:USERNAME\codai-project",
        "C:\Users\$env:USERNAME\GitHub\codai-project",
        "C:\Users\$env:USERNAME\Projects\codai-project",
        ".\codai-project",
        "..\codai-project",
        "..\..\codai-project"
    )
    
    foreach ($path in $possiblePaths) {
        $fullPath = Resolve-Path $path -ErrorAction SilentlyContinue
        if ($fullPath -and (Test-Path "$fullPath\packages\cbd") -and (Test-Path "$fullPath\packages\memorai-mcp")) {
            $CodaiProjectPath = $fullPath.Path
            Write-Success "✅ Found codai-project at: $CodaiProjectPath"
            break
        }
    }
    
    if (-not $CodaiProjectPath) {
        Write-Error "❌ Could not auto-detect codai-project path!"
        Write-Info "Please specify the path as a parameter"
        Write-Host "Example: .\start-cbd-memorai-improved.ps1 'C:\path\to\codai-project'"
        exit 1
    }
}

# Validate paths
if (-not (Test-Path $CodaiProjectPath)) {
    Write-Error "❌ Path not found: $CodaiProjectPath"
    exit 1
}

$CBDPath = Join-Path $CodaiProjectPath "packages\cbd"
$MemorAIPath = Join-Path $CodaiProjectPath "packages\memorai-mcp"

if (-not (Test-Path $CBDPath)) {
    Write-Error "❌ CBD package not found at: $CBDPath"
    exit 1
}

if (-not (Test-Path $MemorAIPath)) {
    Write-Error "❌ MemorAI MCP package not found at: $MemorAIPath"
    exit 1
}

Write-Success "✅ Project paths validated"

# Handle different actions
switch ($true) {
    $StatusCheck {
        Write-Info "🔍 Checking service status..."
        
        $cbdHealthy = Test-ServiceHealth -Url "http://localhost:$CBDPort/health" -ServiceName "CBD Database" -MaxRetries 1
        $memoraiHealthy = Test-ServiceHealth -Url "http://localhost:$MemorAIPort/health" -ServiceName "MemorAI MCP Server" -MaxRetries 1
        
        Write-Host ""
        Write-Host "📊 Service Status Summary:" -ForegroundColor Cyan
        Write-Host "  CBD Database (port $CBDPort): $(if ($cbdHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })"
        Write-Host "  MemorAI MCP (port $MemorAIPort): $(if ($memoraiHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })"
        Write-Host ""
        exit 0
    }
    
    $Stop {
        Write-Info "🛑 Stopping all services..."
        
        Stop-AllNodeProcesses
        Stop-ServiceOnPort -Port $CBDPort -ServiceName "CBD Database"
        Stop-ServiceOnPort -Port $MemorAIPort -ServiceName "MemorAI MCP Server"
        Stop-TrackedProcesses
        
        Write-Success "✅ All services stopped"
        exit 0
    }
    
    $Restart {
        Write-Info "🔄 Restarting services..."
        
        # Full cleanup first
        Stop-AllNodeProcesses
        Stop-ServiceOnPort -Port $CBDPort -ServiceName "CBD Database"
        Stop-ServiceOnPort -Port $MemorAIPort -ServiceName "MemorAI MCP Server"
        Stop-TrackedProcesses
        
        Start-Sleep -Seconds 3
        # Continue to start logic
    }
}

# Header
Write-Host "🚀 Improved CBD & MemorAI MCP Startup Script v1.1.0" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Main startup logic
Write-Info "🚀 Starting CBD Database and MemorAI MCP Server..."

# Comprehensive cleanup before starting
Write-Info "🧹 Performing comprehensive cleanup..."
Stop-AllNodeProcesses
Stop-ServiceOnPort -Port $CBDPort -ServiceName "CBD Database"
Stop-ServiceOnPort -Port $MemorAIPort -ServiceName "MemorAI MCP Server"
Stop-TrackedProcesses

# Wait for cleanup to complete
Start-Sleep -Seconds 2

# Start CBD Database
$cbdProcess = Start-ServiceProcess -ServiceName "CBD Database" `
    -WorkingDirectory $CBDPath `
    -Command "npx" `
    -Arguments @("tsx", "src/start.ts") `
    -EnvironmentVars @{
        "CBD_PORT" = $CBDPort
        "CBD_LOG_LEVEL" = if ($Verbose) { "debug" } else { "info" }
        "NODE_ENV" = "development"
    } `
    -Port $CBDPort

if (-not $cbdProcess) {
    Write-Error "❌ Failed to start CBD Database - aborting"
    Stop-TrackedProcesses
    exit 1
}

# Wait for CBD to initialize
Write-Info "⏳ Waiting for CBD Database to initialize..."
Start-Sleep -Seconds 5

# Verify CBD is responding
if (-not (Test-ServiceHealth -Url "http://localhost:$CBDPort/health" -ServiceName "CBD Database" -MaxRetries 3)) {
    Write-Error "❌ CBD Database failed to become healthy"
    Stop-TrackedProcesses
    exit 1
}

# Start MemorAI MCP Server
$memoraiProcess = Start-ServiceProcess -ServiceName "MemorAI MCP Server" `
    -WorkingDirectory $MemorAIPath `
    -Command "node" `
    -Arguments @("memorai-mcp-vscode.cjs") `
    -EnvironmentVars @{
        "MEMORAI_API_KEY" = "memorai-dev-key-2025"
        "MEMORAI_MCP_PORT" = $MemorAIPort
        "PORT" = $MemorAIPort
        "NODE_ENV" = "development"
        "DEBUG" = if ($Verbose) { "memorai:*" } else { "" }
        "MEMORAI_DEBUG" = if ($Verbose) { "true" } else { "false" }
        "MEMORAI_LOG_LEVEL" = if ($Verbose) { "debug" } else { "info" }
        "MEMORAI_CBD_PATH" = "./memorai-cbd-data"
    } `
    -Port $MemorAIPort

if (-not $memoraiProcess) {
    Write-Error "❌ Failed to start MemorAI MCP Server"
    Write-Warning "🛑 Stopping CBD Database due to MemorAI failure..."
    Stop-TrackedProcesses
    exit 1
}

# Final health check
Write-Info "🔍 Performing final health check..."
Start-Sleep -Seconds 3

$cbdHealthy = Test-ServiceHealth -Url "http://localhost:$CBDPort/health" -ServiceName "CBD Database" -MaxRetries 2
$memoraiHealthy = Test-ServiceHealth -Url "http://localhost:$MemorAIPort/health" -ServiceName "MemorAI MCP Server" -MaxRetries 2

# Summary
Write-Host ""
Write-Host "🎉 Startup Complete!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "  🗃️ CBD Database:"
Write-Host "    - Port: $CBDPort"
Write-Host "    - Health: $(if ($cbdHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })"
Write-Host "    - URL: http://localhost:$CBDPort"
Write-Host ""
Write-Host "  🧠 MemorAI MCP Server:"
Write-Host "    - Port: $MemorAIPort"
Write-Host "    - Health: $(if ($memoraiHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })"
Write-Host "    - URL: http://localhost:$MemorAIPort"
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "  Check Status: .\start-cbd-memorai-improved.ps1 -StatusCheck"
Write-Host "  Stop Services: .\start-cbd-memorai-improved.ps1 -Stop"
Write-Host "  Restart Services: .\start-cbd-memorai-improved.ps1 -Restart"
Write-Host ""

if ($cbdHealthy -and $memoraiHealthy) {
    Write-Success "🎯 All services are running successfully!"
    Write-Info "💡 Services are running in tracked background processes"
    Write-Info "💡 Use Ctrl+C to stop or use -Stop parameter"
    Write-Info "💡 Processes will be automatically cleaned up on script exit"
} else {
    Write-Warning "⚠️ Some services may not be fully operational"
    Write-Info "💡 Check the service logs for more details"
    Write-Info "💡 Use -Verbose for detailed diagnostic information"
}

Write-Host "=====================================================" -ForegroundColor Cyan

# Keep script running to monitor processes (unless non-interactive)
if ($Host.Name -eq "ConsoleHost") {
    Write-Info "💡 Press Ctrl+C to stop all services and exit"
    try {
        while ($true) {
            Start-Sleep -Seconds 30
            
            # Check if processes are still running
            $runningCount = 0
            foreach ($procInfo in $Global:StartedProcesses) {
                if ($procInfo.Process -and -not $procInfo.Process.HasExited) {
                    $runningCount++
                }
            }
            
            if ($runningCount -eq 0) {
                Write-Warning "⚠️ All tracked processes have exited"
                break
            }
        }
    }
    catch {
        Write-Info "🛑 Interrupt received, stopping services..."
    }
    finally {
        Stop-TrackedProcesses
    }
}
