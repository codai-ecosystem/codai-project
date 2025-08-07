#!/usr/bin/env pwsh
# Extended SSL Certificate Monitor - 24/7 Background Process
# Will check certificates and auto-deploy when ready

param(
    [int]$IntervalMinutes = 5,
    [int]$MaxHours = 72,
    [string]$LogFile = "ssl-validation-extended.log"
)

$ErrorActionPreference = "Continue"

function Write-ExtendedLog {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry -Force
}

function Test-CertificateValidation {
    param($Region, $CertArn)
    try {
        $cert = aws acm describe-certificate --certificate-arn $CertArn --region $Region --output json | ConvertFrom-Json
        return $cert.Certificate.Status
    } catch {
        Write-ExtendedLog "Error checking certificate $CertArn in $Region : $_" "ERROR"
        return "ERROR"
    }
}

function Deploy-MemorAIInfrastructure {
    Write-ExtendedLog "🚀 Deploying complete MemorAI infrastructure..." "SUCCESS"
    
    Set-Location $PSScriptRoot
    
    # Deploy all remaining resources
    $deployResult = terraform apply -auto-approve
    
    if ($LASTEXITCODE -eq 0) {
        Write-ExtendedLog "✅ MemorAI infrastructure deployment COMPLETED!" "SUCCESS"
        Write-ExtendedLog "🌐 MemorAI is now available at: https://memorai.ro" "SUCCESS"
        Write-ExtendedLog "🔗 API endpoint: https://api.memorai.ro" "SUCCESS"
        Write-ExtendedLog "🔗 MCP endpoint: https://mcp.memorai.ro" "SUCCESS"
        
        # Test the deployed endpoints
        Write-ExtendedLog "Testing deployed endpoints..." "INFO"
        
        try {
            $mainSite = Invoke-WebRequest -Uri "https://memorai.ro" -Method Head -TimeoutSec 30 -SkipCertificateCheck
            Write-ExtendedLog "✅ Main site (https://memorai.ro): $($mainSite.StatusCode)" "SUCCESS"
        } catch {
            Write-ExtendedLog "⚠️ Main site check: $_" "WARNING"
        }
        
        return $true
    } else {
        Write-ExtendedLog "❌ Infrastructure deployment failed" "ERROR"
        return $false
    }
}

Write-ExtendedLog "🔐 Starting Extended SSL Certificate Monitor (24/7)" "INFO"
Write-ExtendedLog "Will check every $IntervalMinutes minutes for up to $MaxHours hours" "INFO"
Write-ExtendedLog "Certificates to monitor:" "INFO"
Write-ExtendedLog "  - EU-Central-1: arn:aws:acm:eu-central-1:567877624442:certificate/fd428366-658c-4b18-a816-b8e7a7d0707a" "INFO"
Write-ExtendedLog "  - US-East-1: arn:aws:acm:us-east-1:567877624442:certificate/543ca315-f090-4974-8cfe-05d22ea2eac6" "INFO"

$maxChecks = ($MaxHours * 60) / $IntervalMinutes
$check = 0
$deployed = $false

while ($check -lt $maxChecks -and -not $deployed) {
    $check++
    $hoursElapsed = [math]::Round(($check * $IntervalMinutes) / 60, 1)
    
    Write-ExtendedLog "=== Check $check/$maxChecks (${hoursElapsed}h elapsed) ===" "INFO"
    
    # Check both certificates
    $euStatus = Test-CertificateValidation -Region "eu-central-1" -CertArn "arn:aws:acm:eu-central-1:567877624442:certificate/fd428366-658c-4b18-a816-b8e7a7d0707a"
    $usStatus = Test-CertificateValidation -Region "us-east-1" -CertArn "arn:aws:acm:us-east-1:567877624442:certificate/543ca315-f090-4974-8cfe-05d22ea2eac6"
    
    Write-ExtendedLog "EU-Central-1 Certificate: $euStatus" "INFO"
    Write-ExtendedLog "US-East-1 Certificate: $usStatus" "INFO"
    
    if ($euStatus -eq "ISSUED" -and $usStatus -eq "ISSUED") {
        Write-ExtendedLog "🎉 BOTH CERTIFICATES ARE ISSUED! Starting deployment..." "SUCCESS"
        $deployed = Deploy-MemorAIInfrastructure
        break
    } elseif ($euStatus -eq "ISSUED" -or $usStatus -eq "ISSUED") {
        Write-ExtendedLog "📈 Progress: One certificate issued, waiting for the other..." "INFO"
    }
    
    if ($check -lt $maxChecks) {
        Write-ExtendedLog "Next check in $IntervalMinutes minutes..." "INFO"
        Start-Sleep -Seconds ($IntervalMinutes * 60)
    }
}

if (-not $deployed) {
    Write-ExtendedLog "⚠️ Certificate validation taking longer than expected (${MaxHours}h)" "WARNING"
    Write-ExtendedLog "This is normal for AWS ACM - certificates can take up to 72 hours to validate" "INFO"
    Write-ExtendedLog "Consider manual deployment with self-signed certificates for immediate testing" "INFO"
}

Write-ExtendedLog "Extended SSL monitoring completed." "INFO"
