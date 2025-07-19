# CODAI MCP HTTP Servers Startup Script
# This script starts Glass, Memorai, and Romai MCP servers as HTTP services

param(
    [switch]$StartAll = $true,
    [switch]$Glass,
    [switch]$Memorai, 
    [switch]$Romai,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Restart
)

# Configuration
$SCRIPT_VERSION = "1.0.0"
$LOG_FILE = "$env:TEMP\codai-mcp-servers.log"
$PID_FILE_GLASS = "$env:TEMP\glass-mcp-server.pid"
$PID_FILE_MEMORAI = "$env:TEMP\memorai-mcp-server.pid"
$PID_FILE_ROMAI = "$env:TEMP\romai-mcp-server.pid"

# Server Configuration
$GLASS_PORT = 8001
$MEMORAI_PORT = 8002
$ROMAI_PORT = 8003

# Environment Configuration
$DOTENV_PATH = "e:\\GitHub\\workspace-ai\\.env"
$GLASS_LOG_LEVEL = "info"
$MEMORAI_STORAGE_PATH = "C:\\Users\\vladu\\AppData\\Local\\Memorai\\storage"
$MEMORAI_VECTOR_DB_PATH = "C:\\Users\\vladu\\AppData\\Local\\Memorai\\vector_db"
$MEMORAI_CONFIG_PATH = "C:\\Users\\vladu\\AppData\\Local\\Memorai\\config"

# Azure OpenAI Configuration for ROMAI
$AZURE_OPENAI_API_KEY = ""
$AZURE_OPENAI_ENDPOINT = "https://aide-openai-dev.openai.azure.com/"
$AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
$AZURE_OPENAI_DEPLOYMENT_NAME = "gpt-4o"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LOG_FILE -Value $logEntry
}

function Test-ServerHealth {
    param([string]$ServerName, [int]$Port)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $healthData = $response.Content | ConvertFrom-Json
            Write-Log "✅ $ServerName is healthy - Version: $($healthData.version)" "INFO"
            return $true
        }
    } catch {
        Write-Log "❌ $ServerName health check failed on port $Port" "ERROR"
        return $false
    }
    return $false
}

function Start-GlassServer {
    Write-Log "🪟 Starting Glass MCP HTTP Server on port $GLASS_PORT..." "INFO"
    
    # Set environment variables
    $env:GLASS_MCP_PORT = $GLASS_PORT
    $env:GLASS_LOG_LEVEL = $GLASS_LOG_LEVEL
    $env:GLASS_MAX_WINDOWS = "1000"
    $env:GLASS_WINDOW_CACHE_TTL = "5000"
    $env:NODE_ENV = "production"
    $env:DOTENV_CONFIG_PATH = $DOTENV_PATH
    $env:PORT = $GLASS_PORT
    
    try {
        # Start the MCP-compliant server
        $workingDir = "e:\\GitHub\\codai-project\\apps\\glass\\packages\\mcp\\src"
        $process = Start-Process -FilePath "node" -ArgumentList "mcp-compliant-server.cjs" -WorkingDirectory $workingDir -WindowStyle Hidden -PassThru
        $process.Id | Out-File -FilePath $PID_FILE_GLASS -Encoding ascii
        
        Write-Log "Glass MCP-compliant server started with PID: $($process.Id)" "INFO"
        Start-Sleep -Seconds 3
        
        if (Test-ServerHealth "Glass MCP" $GLASS_PORT) {
            Write-Log "✅ Glass MCP-compliant server successfully started and healthy" "INFO"
        } else {
            Write-Log "⚠️ Glass MCP-compliant server started but health check failed" "WARN"
        }
    } catch {
        Write-Log "❌ Failed to start Glass MCP-compliant server: $($_.Exception.Message)" "ERROR"
    }
}

function Start-MemoraiServer {
    Write-Log "🧠 Starting Memorai MCP HTTP Server on port $MEMORAI_PORT..." "INFO"
    
    # Ensure storage directories exist
    New-Item -ItemType Directory -Force -Path $MEMORAI_STORAGE_PATH | Out-Null
    New-Item -ItemType Directory -Force -Path $MEMORAI_VECTOR_DB_PATH | Out-Null
    New-Item -ItemType Directory -Force -Path $MEMORAI_CONFIG_PATH | Out-Null
    
    # Set environment variables
    $env:MEMORAI_MCP_PORT = $MEMORAI_PORT
    $env:MEMORAI_STORAGE_PATH = $MEMORAI_STORAGE_PATH
    $env:MEMORAI_VECTOR_DB_PATH = $MEMORAI_VECTOR_DB_PATH
    $env:MEMORAI_CONFIG_PATH = $MEMORAI_CONFIG_PATH
    $env:MEMORAI_METADATA_DB_PATH = "C:\\Users\\vladu\\AppData\\Local\\Memorai\\metadata_db"
    $env:MEMORAI_MAX_MEMORIES = "10000"
    $env:MEMORAI_PERSIST_ON_EXIT = "true"
    $env:MEMORAI_EMBEDDING_MODEL = "text-embedding-3-small"
    $env:MEMORAI_LOG_LEVEL = "info"
    $env:NODE_ENV = "production"
    $env:DOTENV_CONFIG_PATH = $DOTENV_PATH
    $env:PORT = $MEMORAI_PORT
    
    try {
        # Start the MCP-compliant server
        $workingDir = "e:\\GitHub\\codai-project\\apps\\memorai\\packages\\mcp\\src"
        $process = Start-Process -FilePath "node" -ArgumentList "mcp-compliant-server.cjs" -WorkingDirectory $workingDir -WindowStyle Hidden -PassThru
        $process.Id | Out-File -FilePath $PID_FILE_MEMORAI -Encoding ascii
        
        Write-Log "Memorai MCP-compliant server started with PID: $($process.Id)" "INFO"
        Start-Sleep -Seconds 3
        
        if (Test-ServerHealth "Memorai MCP" $MEMORAI_PORT) {
            Write-Log "✅ Memorai MCP-compliant server successfully started and healthy" "INFO"
        } else {
            Write-Log "⚠️ Memorai MCP-compliant server started but health check failed" "WARN"
        }
    } catch {
        Write-Log "❌ Failed to start Memorai MCP-compliant server: $($_.Exception.Message)" "ERROR"
    }
}

function Start-RomaiServer {
    Write-Log "🇷🇴 Starting Romai MCP HTTP Server on port $ROMAI_PORT..." "INFO"
    
    # Set environment variables
    $env:ROMAI_MCP_PORT = $ROMAI_PORT
    $env:ROMAI_LOG_LEVEL = "info"
    $env:NODE_ENV = "production"
    $env:DOTENV_CONFIG_PATH = $DOTENV_PATH
    $env:AZURE_OPENAI_API_KEY = $AZURE_OPENAI_API_KEY
    $env:AZURE_OPENAI_ENDPOINT = $AZURE_OPENAI_ENDPOINT
    $env:AZURE_OPENAI_API_VERSION = $AZURE_OPENAI_API_VERSION
    $env:AZURE_OPENAI_DEPLOYMENT_NAME = $AZURE_OPENAI_DEPLOYMENT_NAME
    $env:PORT = $ROMAI_PORT
    
    try {
        # Start the MCP-compliant server
        $workingDir = "e:\\GitHub\\codai-project\\apps\\romai\\packages\\romai-mcp\\src"
        $process = Start-Process -FilePath "node" -ArgumentList "mcp-compliant-server.cjs" -WorkingDirectory $workingDir -WindowStyle Hidden -PassThru
        $process.Id | Out-File -FilePath $PID_FILE_ROMAI -Encoding ascii
        
        Write-Log "Romai MCP-compliant server started with PID: $($process.Id)" "INFO"
        Start-Sleep -Seconds 3
        
        if (Test-ServerHealth "Romai MCP" $ROMAI_PORT) {
            Write-Log "✅ Romai MCP-compliant server successfully started and healthy" "INFO"
        } else {
            Write-Log "⚠️ Romai MCP-compliant server started but health check failed" "WARN"
        }
    } catch {
        Write-Log "❌ Failed to start Romai MCP-compliant server: $($_.Exception.Message)" "ERROR"
    }
}

function Stop-ServerByPidFile {
    param([string]$PidFile, [string]$ServerName)
    
    if (Test-Path $PidFile) {
        try {
            $pid = Get-Content $PidFile -Raw
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $pid -Force
                Write-Log "✅ $ServerName stopped (PID: $pid)" "INFO"
            } else {
                Write-Log "⚠️ $ServerName process (PID: $pid) not found - may have already stopped" "WARN"
            }
            Remove-Item $PidFile -ErrorAction SilentlyContinue
        } catch {
            Write-Log "Failed to stop ${ServerName}: $($_.Exception.Message)" "ERROR"
        }
    } else {
        Write-Log "⚠️ No PID file found for $ServerName - server may not be running" "WARN"
    }
}

function Stop-AllServers {
    Write-Log "🛑 Stopping all CODAI MCP HTTP Servers..." "INFO"
    
    Stop-ServerByPidFile $PID_FILE_GLASS "Glass MCP Server"
    Stop-ServerByPidFile $PID_FILE_MEMORAI "Memorai MCP Server" 
    Stop-ServerByPidFile $PID_FILE_ROMAI "Romai MCP Server"
    
    # Kill any remaining npx processes related to our MCPs
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "node" -and 
        ($_.CommandLine -like "*glass-mcp*" -or 
         $_.CommandLine -like "*memorai-mcp*" -or 
         $_.CommandLine -like "*romai-mcp*")
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Log "✅ All servers stopped" "INFO"
}

function Show-ServerStatus {
    Write-Log "📊 CODAI MCP HTTP Servers Status:" "INFO"
    
    $glassHealthy = Test-ServerHealth "Glass MCP" $GLASS_PORT
    $memoraiHealthy = Test-ServerHealth "Memorai MCP" $MEMORAI_PORT  
    $romaiHealthy = Test-ServerHealth "Romai MCP" $ROMAI_PORT
    
    Write-Host "`n=== Server Status Summary ===" -ForegroundColor Cyan
    Write-Host "Glass MCP (Port $GLASS_PORT): $(if($glassHealthy) { '✅ Healthy' } else { '❌ Unhealthy/Stopped' })" -ForegroundColor $(if($glassHealthy) { 'Green' } else { 'Red' })
    Write-Host "Memorai MCP (Port $MEMORAI_PORT): $(if($memoraiHealthy) { '✅ Healthy' } else { '❌ Unhealthy/Stopped' })" -ForegroundColor $(if($memoraiHealthy) { 'Green' } else { 'Red' })
    Write-Host "Romai MCP (Port $ROMAI_PORT): $(if($romaiHealthy) { '✅ Healthy' } else { '❌ Unhealthy/Stopped' })" -ForegroundColor $(if($romaiHealthy) { 'Green' } else { 'Red' })
    Write-Host "==============================`n" -ForegroundColor Cyan
}

# Main execution logic
Write-Log "🚀 CODAI MCP HTTP Servers Manager v$SCRIPT_VERSION" "INFO"
Write-Log "Log file: $LOG_FILE" "INFO"

if ($Status) {
    Show-ServerStatus
    exit 0
}

if ($Stop) {
    Stop-AllServers
    exit 0
}

if ($Restart) {
    Write-Log "🔄 Restarting all CODAI MCP HTTP Servers..." "INFO"
    Stop-AllServers
    Start-Sleep -Seconds 2
}

# Start servers based on parameters
if ($StartAll -and -not ($Glass -or $Memorai -or $Romai)) {
    Write-Log "🌟 Starting all CODAI MCP HTTP Servers..." "INFO"
    Start-GlassServer
    Start-MemoraiServer
    Start-RomaiServer
} else {
    if ($Glass) { Start-GlassServer }
    if ($Memorai) { Start-MemoraiServer }
    if ($Romai) { Start-RomaiServer }
}

# Final status check
Start-Sleep -Seconds 2
Show-ServerStatus

Write-Log "✅ CODAI MCP HTTP Servers startup completed" "INFO"
Write-Host "`n🎉 All servers are now running! Use the following URLs:" -ForegroundColor Green
Write-Host "   Glass MCP: http://localhost:$GLASS_PORT/health" -ForegroundColor Yellow
Write-Host "   Memorai MCP: http://localhost:$MEMORAI_PORT/health" -ForegroundColor Yellow  
Write-Host "   Romai MCP: http://localhost:$ROMAI_PORT/health" -ForegroundColor Yellow
Write-Host "`n📋 Usage examples:" -ForegroundColor Cyan
Write-Host "   Start all: .\Start-CODAI-MCP-Servers.ps1" -ForegroundColor White
Write-Host "   Start specific: .\Start-CODAI-MCP-Servers.ps1 -Glass -Romai" -ForegroundColor White
Write-Host "   Check status: .\Start-CODAI-MCP-Servers.ps1 -Status" -ForegroundColor White
Write-Host "   Stop all: .\Start-CODAI-MCP-Servers.ps1 -Stop" -ForegroundColor White
Write-Host "   Restart: .\Start-CODAI-MCP-Servers.ps1 -Restart" -ForegroundColor White
