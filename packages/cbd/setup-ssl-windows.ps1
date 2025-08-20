# CBD SSL Certificate Setup - Windows PowerShell Script
# Independent SSL solution using Certbot for Windows

param(
    [Parameter(Mandatory=$false)]
    [string]$Domain = "cbd.memorai.ro",
    
    [Parameter(Mandatory=$false)]
    [string]$Email = "codaiecosystem@gmail.com",
    
    [Parameter(Mandatory=$false)]
    [int]$CBDPort = 4180,
    
    [Parameter(Mandatory=$false)]
    [string]$CertbotPath = "C:\Certbot\bin\certbot.exe"
)

# Colors for PowerShell output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Color, [string]$Message)
    Write-Host "$Color$Message$Reset"
}

Write-ColorOutput $Blue "🔒 CBD SSL Certificate Setup for Windows"
Write-ColorOutput $Blue "========================================"
Write-Host "Domain: $Domain"
Write-Host "Email: $Email"
Write-Host "CBD Port: $CBDPort"
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ColorOutput $Red "❌ This script must be run as Administrator"
    Write-ColorOutput $Yellow "💡 Right-click PowerShell and select 'Run as Administrator'"
    exit 1
}

# Check if Certbot is installed
if (-not (Test-Path $CertbotPath)) {
    Write-ColorOutput $Yellow "📦 Installing Certbot..."
    
    # Download and install Certbot
    $certbotUrl = "https://dl.eff.org/certbot-beta-installer-win32.exe"
    $installerPath = "$env:TEMP\certbot-installer.exe"
    
    Write-ColorOutput $Yellow "⬇️ Downloading Certbot installer..."
    try {
        Invoke-WebRequest -Uri $certbotUrl -OutFile $installerPath -UseBasicParsing
        Write-ColorOutput $Green "✅ Certbot installer downloaded"
    } catch {
        Write-ColorOutput $Red "❌ Failed to download Certbot installer: $($_.Exception.Message)"
        exit 1
    }
    
    Write-ColorOutput $Yellow "🔧 Installing Certbot (this may take a few minutes)..."
    try {
        Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait
        Write-ColorOutput $Green "✅ Certbot installed successfully"
    } catch {
        Write-ColorOutput $Red "❌ Failed to install Certbot: $($_.Exception.Message)"
        exit 1
    }
    
    # Clean up installer
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
}

# Verify Certbot installation
if (-not (Test-Path $CertbotPath)) {
    Write-ColorOutput $Red "❌ Certbot not found at $CertbotPath"
    Write-ColorOutput $Yellow "💡 Please install Certbot manually or check the path"
    exit 1
}

Write-ColorOutput $Green "✅ Certbot found at $CertbotPath"

# Create web root for ACME challenges
$WebRoot = "$PSScriptRoot\ssl-challenges"
$AcmeDir = "$WebRoot\.well-known\acme-challenge"

Write-ColorOutput $Yellow "📁 Creating ACME challenge directory..."
if (-not (Test-Path $AcmeDir)) {
    New-Item -ItemType Directory -Path $AcmeDir -Force | Out-Null
    Write-ColorOutput $Green "✅ ACME directory created: $AcmeDir"
} else {
    Write-ColorOutput $Green "✅ ACME directory exists: $AcmeDir"
}

# Check if CBD service is running
Write-ColorOutput $Yellow "🔍 Checking CBD service..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:$CBDPort/health" -Method Get -TimeoutSec 5
    Write-ColorOutput $Green "✅ CBD service is running on port $CBDPort"
} catch {
    Write-ColorOutput $Red "❌ CBD service not accessible on port $CBDPort"
    Write-ColorOutput $Yellow "💡 Please ensure CBD service is running before requesting SSL certificate"
    Write-ColorOutput $Yellow "💡 Use VS Code task: 'Backend: Start CBD Database'"
    exit 1
}

# Start simple HTTP server for ACME challenges
Write-ColorOutput $Yellow "🌐 Starting HTTP server for ACME challenges..."

$HttpServerScript = @"
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 80;
const CBD_PORT = $CBDPort;
const WEBROOT = '$WebRoot'.replace(/\\\\/g, '/');

// Serve ACME challenges
app.use('/.well-known/acme-challenge', express.static(path.join(WEBROOT, '.well-known/acme-challenge')));

// Health check for SSL setup
app.get('/ssl-health', (req, res) => {
    res.json({
        status: 'ready-for-ssl',
        domain: '$Domain',
        acme_path: path.join(WEBROOT, '.well-known/acme-challenge'),
        cbd_service: 'http://localhost:' + CBD_PORT
    });
});

// Proxy all other requests to CBD service
app.use('/', createProxyMiddleware({
    target: 'http://localhost:' + CBD_PORT,
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({ error: 'CBD service unavailable' });
    }
}));

app.listen(PORT, () => {
    console.log('🌐 HTTP proxy server running on port ' + PORT);
    console.log('📁 ACME challenges served from: ' + WEBROOT);
    console.log('🔗 Proxying to CBD service on port: ' + CBD_PORT);
});
"@

$ServerScriptPath = "$PSScriptRoot\ssl-http-server.js"
$HttpServerScript | Out-File -FilePath $ServerScriptPath -Encoding UTF8

# Install required npm packages
Write-ColorOutput $Yellow "📦 Installing HTTP server dependencies..."
Push-Location $PSScriptRoot
try {
    if (-not (Test-Path "package.json")) {
        Write-ColorOutput $Yellow "📝 Creating package.json..."
        $packageJson = @{
            name = "cbd-ssl-server"
            version = "1.0.0"
            description = "CBD SSL Certificate HTTP Server"
            main = "ssl-http-server.js"
            dependencies = @{
                express = "^4.18.2"
                "http-proxy-middleware" = "^2.0.6"
            }
        } | ConvertTo-Json -Depth 3
        $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    }
    
    npm install
    Write-ColorOutput $Green "✅ Dependencies installed"
} catch {
    Write-ColorOutput $Red "❌ Failed to install dependencies: $($_.Exception.Message)"
    exit 1
} finally {
    Pop-Location
}

# Start HTTP server in background
Write-ColorOutput $Yellow "🚀 Starting HTTP server..."
$ServerJob = Start-Job -ScriptBlock {
    param($ScriptPath)
    Set-Location (Split-Path $ScriptPath)
    node (Split-Path $ScriptPath -Leaf)
} -ArgumentList $ServerScriptPath

# Wait for server to start
Start-Sleep -Seconds 3

# Test HTTP server
Write-ColorOutput $Yellow "🧪 Testing HTTP server..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost/ssl-health" -Method Get -TimeoutSec 5
    Write-ColorOutput $Green "✅ HTTP server is ready for SSL certificate request"
} catch {
    Write-ColorOutput $Red "❌ HTTP server test failed: $($_.Exception.Message)"
    Stop-Job $ServerJob -Force
    Remove-Job $ServerJob -Force
    exit 1
}

# Request SSL certificate using Certbot
Write-ColorOutput $Yellow "🔒 Requesting SSL certificate from Let's Encrypt..."
Write-ColorOutput $Yellow "⏳ This may take a few minutes..."

$CertbotArgs = @(
    "certonly",
    "--webroot",
    "--webroot-path", $WebRoot,
    "--email", $Email,
    "--agree-tos",
    "--non-interactive",
    "--domains", $Domain,
    "--keep-until-expiring",
    "--verbose"
)

Write-ColorOutput $Blue "📋 Running: $CertbotPath $($CertbotArgs -join ' ')"

try {
    $certbotProcess = Start-Process -FilePath $CertbotPath -ArgumentList $CertbotArgs -Wait -PassThru -NoNewWindow
    
    if ($certbotProcess.ExitCode -eq 0) {
        Write-ColorOutput $Green "✅ SSL certificate obtained successfully!"
        
        # Check certificate files
        $CertPath = "C:\Certbot\live\$Domain"
        if (Test-Path "$CertPath\fullchain.pem" -and Test-Path "$CertPath\privkey.pem") {
            Write-ColorOutput $Green "✅ Certificate files verified:"
            Write-ColorOutput $Green "   - Fullchain: $CertPath\fullchain.pem"
            Write-ColorOutput $Green "   - Private Key: $CertPath\privkey.pem"
        } else {
            Write-ColorOutput $Yellow "⚠️ Certificate files not found in expected location"
            Write-ColorOutput $Yellow "💡 Check Certbot logs for certificate location"
        }
    } else {
        Write-ColorOutput $Red "❌ SSL certificate request failed (Exit code: $($certbotProcess.ExitCode))"
        Write-ColorOutput $Yellow "💡 Check Certbot logs for details"
        Stop-Job $ServerJob -Force
        Remove-Job $ServerJob -Force
        exit 1
    }
} catch {
    Write-ColorOutput $Red "❌ Failed to run Certbot: $($_.Exception.Message)"
    Stop-Job $ServerJob -Force
    Remove-Job $ServerJob -Force
    exit 1
}

# Stop HTTP server
Write-ColorOutput $Yellow "🛑 Stopping HTTP server..."
Stop-Job $ServerJob -Force
Remove-Job $ServerJob -Force

# Setup certificate renewal task
Write-ColorOutput $Yellow "🔄 Setting up automatic certificate renewal..."

$RenewalScript = @"
# CBD SSL Certificate Auto-Renewal Script
param([string]`$Domain = "$Domain")

`$CertbotPath = "$CertbotPath"
`$LogPath = "$PSScriptRoot\ssl-renewal.log"

Write-Output "`$(Get-Date): Starting certificate renewal for `$Domain" | Out-File -Append `$LogPath

try {
    `$result = & `$CertbotPath renew --quiet
    if (`$LASTEXITCODE -eq 0) {
        Write-Output "`$(Get-Date): Certificate renewal successful" | Out-File -Append `$LogPath
    } else {
        Write-Output "`$(Get-Date): Certificate renewal failed with exit code `$LASTEXITCODE" | Out-File -Append `$LogPath
    }
} catch {
    Write-Output "`$(Get-Date): Certificate renewal error: `$(`$_.Exception.Message)" | Out-File -Append `$LogPath
}
"@

$RenewalScriptPath = "$PSScriptRoot\ssl-renewal.ps1"
$RenewalScript | Out-File -FilePath $RenewalScriptPath -Encoding UTF8

# Create scheduled task for auto-renewal
$TaskName = "CBD-SSL-Renewal"
$TaskDescription = "Automatic SSL certificate renewal for CBD Universal Database"

# Remove existing task if it exists
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
} catch {}

# Create new scheduled task
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$RenewalScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

try {
    Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal
    Write-ColorOutput $Green "✅ Auto-renewal scheduled task created"
} catch {
    Write-ColorOutput $Yellow "⚠️ Failed to create scheduled task: $($_.Exception.Message)"
    Write-ColorOutput $Yellow "💡 You can manually renew using: $CertbotPath renew"
}

# Test certificate renewal (dry run)
Write-ColorOutput $Yellow "🧪 Testing certificate renewal (dry run)..."
try {
    $dryRunResult = & $CertbotPath renew --dry-run
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput $Green "✅ Certificate renewal test passed"
    } else {
        Write-ColorOutput $Yellow "⚠️ Certificate renewal test had issues (this might be normal)"
    }
} catch {
    Write-ColorOutput $Yellow "⚠️ Certificate renewal test failed: $($_.Exception.Message)"
}

# Final summary
Write-ColorOutput $Green "🎉 CBD SSL Certificate Setup Complete!"
Write-ColorOutput $Green "====================================="
Write-Host ""
Write-ColorOutput $Blue "📋 Summary:"
Write-ColorOutput $Green "✅ Domain: $Domain"
Write-ColorOutput $Green "✅ SSL Certificate: Let's Encrypt"
Write-ColorOutput $Green "✅ Certificate Path: C:\Certbot\live\$Domain"
Write-ColorOutput $Green "✅ Auto-renewal: Scheduled daily at 2:00 AM"
Write-Host ""
Write-ColorOutput $Blue "🔧 Next Steps:"
Write-ColorOutput $Yellow "1. Configure your web server (IIS/Nginx) to use the certificate"
Write-ColorOutput $Yellow "2. Update AWS Load Balancer to use the certificate"
Write-ColorOutput $Yellow "3. Test HTTPS access: https://$Domain"
Write-Host ""
Write-ColorOutput $Blue "🌐 Commands:"
Write-Host "Check certificates: $CertbotPath certificates"
Write-Host "Renew certificates: $CertbotPath renew"
Write-Host "Test renewal: $CertbotPath renew --dry-run"
Write-Host ""
Write-ColorOutput $Green "🎯 Your CBD Universal Database can now use SSL!"

# Clean up temporary files
Remove-Item $ServerScriptPath -Force -ErrorAction SilentlyContinue
