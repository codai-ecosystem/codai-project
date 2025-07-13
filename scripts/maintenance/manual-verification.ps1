# Manual Verification Script for Codai Ecosystem
# This script will individually test each service

Write-Host "🔍 MANUAL CODAI ECOSYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Function to test if a service is running
function Test-Service {
    param([int]$port, [string]$serviceName)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $serviceName (Port $port): RUNNING - Status $($response.StatusCode)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $serviceName (Port $port): NOT RUNNING" -ForegroundColor Red
        return $false
    }
}

# Test PNPM availability
Write-Host "`n📦 Testing PNPM Installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ PNPM Version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PNPM not found!" -ForegroundColor Red
    exit 1
}

# Test Node.js availability
Write-Host "`n🟢 Testing Node.js Installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    exit 1
}

# Check workspace structure
Write-Host "`n📁 Checking Workspace Structure..." -ForegroundColor Yellow
$requiredDirs = @("apps", "packages")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ Directory '$dir' exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Directory '$dir' missing" -ForegroundColor Red
    }
}

# Test individual app directories
Write-Host "`n🏗️ Testing App Directories..." -ForegroundColor Yellow
$testApps = @(
    @{name="codai"; port=4030},
    @{name="memorai"; port=4031},
    @{name="bancai"; port=4033},
    @{name="stocai"; port=4063}
)

foreach ($app in $testApps) {
    $appPath = "apps\$($app.name)"
    if (Test-Path $appPath) {
        Write-Host "✅ $($app.name) directory exists" -ForegroundColor Green
        
        # Check if package.json exists
        $packageJsonPath = "$appPath\package.json"
        if (Test-Path $packageJsonPath) {
            Write-Host "  ✅ package.json found" -ForegroundColor Green
        } else {
            Write-Host "  ❌ package.json missing" -ForegroundColor Red
        }
        
        # Check if node_modules exists
        $nodeModulesPath = "$appPath\node_modules"
        if (Test-Path $nodeModulesPath) {
            Write-Host "  ✅ node_modules found" -ForegroundColor Green
        } else {
            Write-Host "  ❌ node_modules missing" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ $($app.name) directory missing" -ForegroundColor Red
    }
}

# Test if services are currently running
Write-Host "`n🌐 Testing Service Availability..." -ForegroundColor Yellow
$runningCount = 0
foreach ($app in $testApps) {
    if (Test-Service -port $app.port -serviceName $app.name) {
        $runningCount++
    }
}

Write-Host "`n📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "Running Services: $runningCount/$($testApps.Length)" -ForegroundColor $(if($runningCount -gt 0){"Green"}else{"Red"})
Write-Host "Overall Status: $(if($runningCount -eq $testApps.Length){"ALL OPERATIONAL"}elseif($runningCount -gt 0){"PARTIALLY OPERATIONAL"}else{"NOT OPERATIONAL"})" -ForegroundColor $(if($runningCount -eq $testApps.Length){"Green"}elseif($runningCount -gt 0){"Yellow"}else{"Red"})

# Check for listening ports
Write-Host "`n🔌 Checking Listening Ports..." -ForegroundColor Yellow
$listeningPorts = netstat -an | Select-String ":40.*LISTENING"
if ($listeningPorts) {
    Write-Host "Found listening ports on 40xx range:" -ForegroundColor Green
    $listeningPorts | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ No services listening on 40xx ports" -ForegroundColor Red
}
