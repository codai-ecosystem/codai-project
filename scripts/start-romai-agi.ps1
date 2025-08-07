# RomAI AGI Model Server Startup Script
# Configures environment and starts the AGI model server on port 6101

Write-Host "🤖 Starting RomAI AGI Model Server..." -ForegroundColor Cyan

# Get the workspace folder (assuming script is in scripts/ subdirectory)
$WorkspaceFolder = Split-Path -Parent $PSScriptRoot

# Set environment variables
$env:PYTHONPATH = "$WorkspaceFolder\apps\romai\src;$WorkspaceFolder\apps\romai\src\ml\serving;$WorkspaceFolder\apps\romai\src\ml\models;$WorkspaceFolder\apps\romai\src\ml\quantum"
$env:PYTORCH_CUDA_ALLOC_CONF = "max_split_size_mb:1024"
$env:TRANSFORMERS_CACHE = "$WorkspaceFolder\.cache\transformers"
$env:HF_HOME = "$WorkspaceFolder\.cache\huggingface"
$env:MODEL_CACHE_DIR = "$WorkspaceFolder\.cache\models"
$env:ROMAI_AGI_PORT = "6101"
$env:ROMAI_AGI_HOST = "0.0.0.0"
$env:ROMAI_LOG_LEVEL = "INFO"
$env:QUANTUM_ENABLED = "true"
$env:CONSCIOUSNESS_ENGINE = "true"

# Display environment configuration
Write-Host "📋 Environment Configuration:" -ForegroundColor Green
Write-Host "   • Workspace: $WorkspaceFolder" -ForegroundColor White
Write-Host "   • AGI Port: $env:ROMAI_AGI_PORT" -ForegroundColor White
Write-Host "   • Quantum: $env:QUANTUM_ENABLED" -ForegroundColor White
Write-Host "   • Consciousness: $env:CONSCIOUSNESS_ENGINE" -ForegroundColor White

# Change to the model server directory
$ModelServerPath = Join-Path $WorkspaceFolder "apps\romai\src\ml\serving"
Write-Host "📂 Changing to: $ModelServerPath" -ForegroundColor Yellow

if (Test-Path $ModelServerPath) {
    Set-Location $ModelServerPath
    
    # Verify model_server.py exists
    if (Test-Path "model_server.py") {
        Write-Host "✅ Found model_server.py" -ForegroundColor Green
        
        # Start the server
        Write-Host "🚀 Starting AGI Model Server on $env:ROMAI_AGI_HOST:$env:ROMAI_AGI_PORT..." -ForegroundColor Cyan
        python server_simple.py
    } else {
        Write-Host "❌ model_server.py not found in $ModelServerPath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Model server directory not found: $ModelServerPath" -ForegroundColor Red
    exit 1
}
