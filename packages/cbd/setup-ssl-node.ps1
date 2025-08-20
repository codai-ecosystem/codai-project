# CBD SSL Setup - Windows Node.js Approach
# Simplified approach using built-in Windows features + Node.js

param(
    [string]$Domain = "cbd.memorai.ro",
    [string]$Email = "codaiecosystem@gmail.com"
)

$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Red = "`e[31m"
$Reset = "`e[0m"

function Write-ColorOutput($Color, $Message) {
    Write-Host "$Color$Message$Reset"
}

Write-ColorOutput $Blue "🔒 CBD SSL Setup - Node.js Approach"
Write-ColorOutput $Blue "==================================="
Write-Host "Domain: $Domain"
Write-Host "Email: $Email"
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ColorOutput $Red "❌ This script must be run as Administrator"
    Write-ColorOutput $Yellow "💡 Right-click PowerShell and select 'Run as Administrator'"
    exit 1
}

# Test CBD service
Write-ColorOutput $Yellow "🔍 Testing CBD service connection..."
try {
    $cbdHealth = Invoke-RestMethod -Uri "http://localhost:4180/health" -Method Get -TimeoutSec 5
    Write-ColorOutput $Green "✅ CBD service is running"
    Write-Host "   Service: $($cbdHealth.service)"
    Write-Host "   Version: $($cbdHealth.version)"
} catch {
    Write-ColorOutput $Red "❌ CBD service not accessible on port 4180"
    Write-ColorOutput $Yellow "💡 Please start CBD service first using VS Code task"
    exit 1
}

# Check Node.js installation
Write-ColorOutput $Yellow "📦 Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-ColorOutput $Green "✅ Node.js found: $nodeVersion"
} catch {
    Write-ColorOutput $Red "❌ Node.js not found"
    Write-ColorOutput $Yellow "💡 Please install Node.js from https://nodejs.org/"
    exit 1
}

# Install Win-ACME (Windows ACME client)
$winAcmePath = "C:\ProgramData\win-acme"
$winAcmeExe = "$winAcmePath\wacs.exe"

if (-not (Test-Path $winAcmeExe)) {
    Write-ColorOutput $Yellow "📦 Installing Win-ACME (Windows ACME client)..."
    
    # Create directory
    New-Item -ItemType Directory -Path $winAcmePath -Force | Out-Null
    
    # Download Win-ACME
    $downloadUrl = "https://github.com/win-acme/win-acme/releases/latest/download/win-acme.v2.2.7.1612.x64.pluggable.zip"
    $zipPath = "$env:TEMP\win-acme.zip"
    
    try {
        Write-ColorOutput $Yellow "⬇️ Downloading Win-ACME..."
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
        
        Write-ColorOutput $Yellow "📂 Extracting Win-ACME..."
        Expand-Archive -Path $zipPath -DestinationPath $winAcmePath -Force
        
        Remove-Item $zipPath -Force
        Write-ColorOutput $Green "✅ Win-ACME installed successfully"
    } catch {
        Write-ColorOutput $Red "❌ Failed to install Win-ACME: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-ColorOutput $Green "✅ Win-ACME already installed"
}

# Start SSL Proxy Server
Write-ColorOutput $Yellow "🚀 Starting SSL Proxy Server..."
$proxyJob = Start-Job -ScriptBlock {
    param($ScriptRoot)
    Set-Location $ScriptRoot
    node ssl-proxy-server.js
} -ArgumentList $PSScriptRoot

# Wait for proxy to start
Start-Sleep -Seconds 5

# Test proxy server
Write-ColorOutput $Yellow "🧪 Testing SSL Proxy Server..."
try {
    $proxyHealth = Invoke-RestMethod -Uri "http://localhost/ssl-proxy-health" -Method Get -TimeoutSec 10
    Write-ColorOutput $Green "✅ SSL Proxy Server is running"
    Write-Host "   Status: $($proxyHealth.status)"
    Write-Host "   Domain: $($proxyHealth.domain)"
} catch {
    Write-ColorOutput $Red "❌ SSL Proxy Server failed to start"
    Write-ColorOutput $Yellow "💡 Check if port 80 is available"
    
    # Check proxy job for errors
    $proxyJobResult = Receive-Job $proxyJob -ErrorAction SilentlyContinue
    if ($proxyJobResult) {
        Write-ColorOutput $Yellow "📋 Proxy output:"
        $proxyJobResult | ForEach-Object { Write-Host "   $_" }
    }
    
    Stop-Job $proxyJob -Force
    Remove-Job $proxyJob -Force
    exit 1
}

# Test domain accessibility
Write-ColorOutput $Yellow "🌐 Testing domain accessibility..."
try {
    $domainTest = Invoke-RestMethod -Uri "http://$Domain/.well-known/acme-challenge/test" -Method Get -TimeoutSec 10 -ErrorAction SilentlyContinue
} catch {
    # This is expected to fail, we're just testing connectivity
}

Write-ColorOutput $Yellow "🔒 Requesting SSL certificate..."
Write-ColorOutput $Blue "📋 Win-ACME will now run interactively..."
Write-Host ""

# Request certificate using Win-ACME
$wacArgs = @(
    "--target", "manual",
    "--host", $Domain,
    "--validation", "http-01-webroot",
    "--webroot", (Join-Path $PSScriptRoot "ssl-challenges"),
    "--emailaddress", $Email,
    "--accepttos",
    "--unattended"
)

Write-ColorOutput $Blue "📋 Running: $winAcmeExe $($wacArgs -join ' ')"

try {
    $wacProcess = Start-Process -FilePath $winAcmeExe -ArgumentList $wacArgs -Wait -PassThru -NoNewWindow
    
    if ($wacProcess.ExitCode -eq 0) {
        Write-ColorOutput $Green "✅ SSL certificate requested successfully!"
        
        # Check for certificate files
        $certStore = "Cert:\LocalMachine\My"
        $certificates = Get-ChildItem $certStore | Where-Object { $_.Subject -like "*$Domain*" }
        
        if ($certificates.Count -gt 0) {
            Write-ColorOutput $Green "✅ Certificate found in Windows Certificate Store"
            $cert = $certificates[0]
            Write-Host "   Subject: $($cert.Subject)"
            Write-Host "   Thumbprint: $($cert.Thumbprint)"
            Write-Host "   Expires: $($cert.NotAfter)"
        }
    } else {
        Write-ColorOutput $Red "❌ SSL certificate request failed"
        Write-ColorOutput $Yellow "💡 Check Win-ACME logs for details"
    }
} catch {
    Write-ColorOutput $Red "❌ Failed to run Win-ACME: $($_.Exception.Message)"
}

# Setup IIS binding (if IIS is available)
if (Get-WindowsFeature -Name "IIS-WebServer" -ErrorAction SilentlyContinue) {
    Write-ColorOutput $Yellow "🌐 Configuring IIS HTTPS binding..."
    
    try {
        Import-Module WebAdministration -ErrorAction SilentlyContinue
        
        # Get certificate
        $cert = Get-ChildItem "Cert:\LocalMachine\My" | Where-Object { $_.Subject -like "*$Domain*" } | Select-Object -First 1
        
        if ($cert) {
            # Create HTTPS binding
            New-WebBinding -Name "Default Web Site" -Protocol https -Port 443 -HostHeader $Domain -SslFlags 1
            
            # Bind certificate
            $binding = Get-WebBinding -Name "Default Web Site" -Protocol https -Port 443 -HostHeader $Domain
            $binding.AddSslCertificate($cert.Thumbprint, "my")
            
            Write-ColorOutput $Green "✅ IIS HTTPS binding configured"
        }
    } catch {
        Write-ColorOutput $Yellow "⚠️ IIS configuration failed: $($_.Exception.Message)"
    }
}

# Create certificate renewal task
Write-ColorOutput $Yellow "🔄 Setting up automatic renewal..."

$renewalScript = @"
# CBD SSL Certificate Renewal
`$winAcmePath = "$winAcmeExe"
`$logPath = "$PSScriptRoot\ssl-renewal.log"

Write-Output "`$(Get-Date): Starting certificate renewal" | Out-File -Append `$logPath

try {
    `$result = & `$winAcmePath --renew --baseuri https://acme-v02.api.letsencrypt.org/
    Write-Output "`$(Get-Date): Renewal completed with exit code `$LASTEXITCODE" | Out-File -Append `$logPath
} catch {
    Write-Output "`$(Get-Date): Renewal error: `$(`$_.Exception.Message)" | Out-File -Append `$logPath
}
"@

$renewalScriptPath = "$PSScriptRoot\ssl-renewal.ps1"
$renewalScript | Out-File -FilePath $renewalScriptPath -Encoding UTF8

# Create scheduled task
$taskName = "CBD-SSL-Renewal"
try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$renewalScriptPath`""
    $trigger = New-ScheduledTaskTrigger -Daily -At "03:00AM"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal
    Write-ColorOutput $Green "✅ Renewal task scheduled"
} catch {
    Write-ColorOutput $Yellow "⚠️ Failed to create renewal task: $($_.Exception.Message)"
}

# Clean up proxy job
Write-ColorOutput $Yellow "🛑 Stopping SSL Proxy Server..."
Stop-Job $proxyJob -Force
Remove-Job $proxyJob -Force

# Final summary
Write-ColorOutput $Green "🎉 CBD SSL Setup Complete!"
Write-ColorOutput $Green "========================="
Write-Host ""
Write-ColorOutput $Blue "📋 Summary:"
Write-ColorOutput $Green "✅ Domain: $Domain"
Write-ColorOutput $Green "✅ SSL Client: Win-ACME"
Write-ColorOutput $Green "✅ Certificate Store: Windows Certificate Store"
Write-ColorOutput $Green "✅ Proxy Server: Node.js (ssl-proxy-server.js)"
Write-Host ""
Write-ColorOutput $Blue "🔧 Next Steps:"
Write-ColorOutput $Yellow "1. Configure your web server to use the certificate"
Write-ColorOutput $Yellow "2. Test HTTPS access: https://$Domain"
Write-ColorOutput $Yellow "3. Monitor renewal logs: $PSScriptRoot\ssl-renewal.log"
Write-Host ""
Write-ColorOutput $Blue "🌐 Commands:"
Write-Host "Start proxy: node ssl-proxy-server.js"
Write-Host "Check certificates: Get-ChildItem Cert:\LocalMachine\My"
Write-Host "Test domain: curl https://$Domain/health"
Write-Host ""
Write-ColorOutput $Green "🎯 Your CBD Universal Database SSL setup is ready!"
