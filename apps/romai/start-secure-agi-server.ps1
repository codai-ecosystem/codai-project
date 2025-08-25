# Start Secure RomAI AGI Server
# Microsoft Azure ML Security Standards Compliance

Write-Host "🔒 Starting Secure RomAI AGI Server..." -ForegroundColor Cyan
Write-Host "🛡️ Security Features: Authentication, Rate Limiting, Security Headers" -ForegroundColor Green

# Ensure Python environment
$pythonPath = python -c "import sys; print(sys.executable)" 2>$null
if (-not $pythonPath) {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Start secure server
Set-Location "config"
python secure-model-server.py
