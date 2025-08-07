#!/usr/bin/env pwsh
# MemorAI SSL Certificate Background Monitor & Validator
# Runs continuously to monitor and validate SSL certificates

param(
    [int]$IntervalSeconds = 30,
    [int]$MaxAttempts = 120,  # 1 hour max wait
    [string]$LogFile = "ssl-validation.log"
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry -Force
}

function Get-CertificateStatus {
    param($Region, $DomainPattern)
    try {
        $certs = aws acm list-certificates --region $Region --certificate-statuses ISSUED PENDING_VALIDATION --query "CertificateSummaryList[?DomainName==``$DomainPattern``]" --output json | ConvertFrom-Json
        return $certs
    } catch {
        Write-Log "Error checking certificates in $Region : $_" "ERROR"
        return @()
    }
}

function Get-CertificateValidationRecords {
    param($CertArn, $Region)
    try {
        $cert = aws acm describe-certificate --certificate-arn $CertArn --region $Region --output json | ConvertFrom-Json
        return $cert.Certificate.DomainValidationOptions
    } catch {
        Write-Log "Error getting validation records for $CertArn : $_" "ERROR"
        return @()
    }
}

function Ensure-ValidationRecords {
    param($CertArn, $Region, $DomainName)
    Write-Log "Ensuring DNS validation records for $DomainName in $Region"
    
    $validationOptions = Get-CertificateValidationRecords -CertArn $CertArn -Region $Region
    
    foreach ($option in $validationOptions) {
        if ($option.ValidationStatus -eq "PENDING_VALIDATION" -and $option.ResourceRecord) {
            $recordName = $option.ResourceRecord.Name
            $recordValue = $option.ResourceRecord.Value
            $recordType = $option.ResourceRecord.Type
            
            Write-Log "Checking DNS record: $recordName ($recordType)"
            
            # Check if record exists in Route53
            try {
                $hostedZoneId = aws route53 list-hosted-zones --query "HostedZones[?Name=='memorai.ro.'].Id" --output text
                if ($hostedZoneId) {
                    $hostedZoneId = $hostedZoneId.Replace("/hostedzone/", "")
                    
                    $existingRecord = aws route53 list-resource-record-sets --hosted-zone-id $hostedZoneId --query "ResourceRecordSets[?Name=='$recordName' && Type=='$recordType']" --output json | ConvertFrom-Json
                    
                    if (-not $existingRecord -or $existingRecord.Count -eq 0) {
                        Write-Log "Creating DNS validation record: $recordName"
                        
                        $changeSet = @{
                            Comment = "SSL certificate validation for $DomainName"
                            Changes = @(
                                @{
                                    Action = "CREATE"
                                    ResourceRecordSet = @{
                                        Name = $recordName
                                        Type = $recordType
                                        TTL = 60
                                        ResourceRecords = @(
                                            @{ Value = "`"$recordValue`"" }
                                        )
                                    }
                                }
                            )
                        } | ConvertTo-Json -Depth 5
                        
                        $changeSet | Out-File -FilePath "temp-changeset.json" -Encoding UTF8
                        
                        $result = aws route53 change-resource-record-sets --hosted-zone-id $hostedZoneId --change-batch file://temp-changeset.json --output json
                        
                        Remove-Item "temp-changeset.json" -Force -ErrorAction SilentlyContinue
                        
                        if ($result) {
                            Write-Log "DNS record created successfully: $recordName" "SUCCESS"
                        } else {
                            Write-Log "Failed to create DNS record: $recordName" "ERROR"
                        }
                    } else {
                        Write-Log "DNS record already exists: $recordName"
                    }
                }
            } catch {
                Write-Log "Error managing DNS record $recordName : $_" "ERROR"
            }
        }
    }
}

Write-Log "🚀 Starting MemorAI SSL Certificate Background Monitor"
Write-Log "Monitoring certificates in eu-central-1 and us-east-1 regions"
Write-Log "Check interval: $IntervalSeconds seconds, Max attempts: $MaxAttempts"

$attempt = 0
$allCertsIssued = $false

while ($attempt -lt $MaxAttempts -and -not $allCertsIssued) {
    $attempt++
    Write-Log "=== Attempt $attempt/$MaxAttempts ==="
    
    # Check EU Central region (ALB certificate)
    $euCerts = Get-CertificateStatus -Region "eu-central-1" -DomainPattern "memorai.ro"
    $euIssued = $false
    
    foreach ($cert in $euCerts) {
        Write-Log "EU-Central-1 Certificate: $($cert.DomainName) - Status: $($cert.Status)"
        if ($cert.Status -eq "PENDING_VALIDATION") {
            Ensure-ValidationRecords -CertArn $cert.CertificateArn -Region "eu-central-1" -DomainName $cert.DomainName
        } elseif ($cert.Status -eq "ISSUED") {
            $euIssued = $true
            Write-Log "✅ EU-Central-1 certificate ISSUED: $($cert.CertificateArn)" "SUCCESS"
        }
    }
    
    # Check US East region (CloudFront certificate)
    $usCerts = Get-CertificateStatus -Region "us-east-1" -DomainPattern "memorai.ro"
    $usIssued = $false
    
    foreach ($cert in $usCerts) {
        Write-Log "US-East-1 Certificate: $($cert.DomainName) - Status: $($cert.Status)"
        if ($cert.Status -eq "PENDING_VALIDATION") {
            Ensure-ValidationRecords -CertArn $cert.CertificateArn -Region "us-east-1" -DomainName $cert.DomainName
        } elseif ($cert.Status -eq "ISSUED") {
            $usIssued = $true
            Write-Log "✅ US-East-1 certificate ISSUED: $($cert.CertificateArn)" "SUCCESS"
        }
    }
    
    if ($euIssued -and $usIssued) {
        $allCertsIssued = $true
        Write-Log "🎉 ALL SSL CERTIFICATES SUCCESSFULLY ISSUED!" "SUCCESS"
        Write-Log "Both ALB and CloudFront certificates are ready for production use" "SUCCESS"
        
        # Deploy remaining infrastructure
        Write-Log "Deploying CloudFront distribution and final resources..."
        Set-Location $PSScriptRoot
        $terraformResult = terraform apply -auto-approve -target=aws_cloudfront_distribution.main
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ CloudFront distribution deployed successfully!" "SUCCESS"
        } else {
            Write-Log "❌ CloudFront deployment failed" "ERROR"
        }
        
        break
    }
    
    if ($attempt -lt $MaxAttempts) {
        Write-Log "Waiting $IntervalSeconds seconds before next check..."
        Start-Sleep -Seconds $IntervalSeconds
    }
}

if (-not $allCertsIssued) {
    Write-Log "⚠️ SSL certificate validation timed out after $MaxAttempts attempts" "WARNING"
    Write-Log "Certificates may take additional time to validate. Monitor manually if needed." "WARNING"
} else {
    Write-Log "🏁 SSL Certificate monitoring completed successfully!" "SUCCESS"
}
