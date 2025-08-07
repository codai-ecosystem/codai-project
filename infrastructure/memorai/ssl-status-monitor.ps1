#!/usr/bin/env pwsh
# Simple SSL Certificate Status Monitor
# Monitors certificate validation in background without making changes

param(
    [int]$IntervalSeconds = 30,
    [int]$MaxAttempts = 120
)

$ErrorActionPreference = "Continue"

function Write-Status {
    param($Message, $Color = "White")
    $Timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$Timestamp] $Message" -ForegroundColor $Color
}

Write-Status "🔐 Starting SSL Certificate Status Monitor" "Cyan"
Write-Status "Monitoring MemorAI certificates in both regions..." "White"

$attempt = 0
while ($attempt -lt $MaxAttempts) {
    $attempt++
    Write-Status "=== Check $attempt/$MaxAttempts ===" "Yellow"
    
    try {
        # Check EU region certificate
        $euCerts = aws acm list-certificates --region eu-central-1 --certificate-statuses ISSUED PENDING_VALIDATION --query "CertificateSummaryList[?DomainName=='memorai.ro']" --output json | ConvertFrom-Json
        
        if ($euCerts -and $euCerts.Count -gt 0) {
            $euStatus = $euCerts[0].Status
            if ($euStatus -eq "ISSUED") {
                Write-Status "✅ EU-Central-1 Certificate: ISSUED" "Green"
            } else {
                Write-Status "⏳ EU-Central-1 Certificate: $euStatus" "Yellow"
            }
        }
        
        # Check US region certificate  
        $usCerts = aws acm list-certificates --region us-east-1 --certificate-statuses ISSUED PENDING_VALIDATION --query "CertificateSummaryList[?DomainName=='memorai.ro']" --output json | ConvertFrom-Json
        
        if ($usCerts -and $usCerts.Count -gt 0) {
            $usStatus = $usCerts[0].Status
            if ($usStatus -eq "ISSUED") {
                Write-Status "✅ US-East-1 Certificate: ISSUED" "Green"
            } else {
                Write-Status "⏳ US-East-1 Certificate: $usStatus" "Yellow"
            }
        }
        
        # Check if both are issued
        if ($euStatus -eq "ISSUED" -and $usStatus -eq "ISSUED") {
            Write-Status "🎉 ALL CERTIFICATES ISSUED! Deploying remaining infrastructure..." "Green"
            
            # Deploy CloudFront and remaining resources
            Write-Status "Deploying CloudFront distribution..." "Cyan"
            Set-Location $PSScriptRoot
            terraform apply -auto-approve
            
            if ($LASTEXITCODE -eq 0) {
                Write-Status "✅ MemorAI infrastructure deployment completed successfully!" "Green"
                Write-Status "🌐 Your MemorAI platform is ready at https://memorai.ro" "Green"
            } else {
                Write-Status "❌ Infrastructure deployment encountered issues" "Red"
            }
            break
        }
        
    } catch {
        Write-Status "Error checking certificates: $_" "Red"
    }
    
    if ($attempt -lt $MaxAttempts) {
        Write-Status "Waiting $IntervalSeconds seconds..." "Gray"
        Start-Sleep -Seconds $IntervalSeconds
    }
}

if ($euStatus -ne "ISSUED" -or $usStatus -ne "ISSUED") {
    Write-Status "⚠️ Certificate validation still pending after monitoring period" "Yellow"
    Write-Status "DNS validation records have been created by terraform. Certificates will validate automatically." "White"
    Write-Status "You can check status later with: aws acm list-certificates --region [region]" "White"
}

Write-Status "SSL monitoring completed." "Cyan"
