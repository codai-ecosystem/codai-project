# CODAI Complete Deployment Validation Script
# Validates entire deployment across packages, frontend, and backend

param(
    [string]$Environment = "production",
    [string]$Domain = "codai.ai",
    [switch]$ValidatePackages = $true,
    [switch]$ValidateVercel = $true,
    [switch]$ValidateAWS = $true,
    [switch]$ValidateHealthChecks = $true,
    [switch]$GenerateReport = $true
)

$ErrorActionPreference = "Stop"

# Color functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }

Write-Info "🔍 CODAI Complete Deployment Validation"
Write-Info "Environment: $Environment | Domain: $Domain"
Write-Info "═══════════════════════════════════════════════════════════════"

$ValidationResults = @{
    Packages = @{}
    Frontend = @{}
    Backend = @{}
    HealthChecks = @{}
    Overall = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        SuccessRate = 0
    }
}

# Package validation
if ($ValidatePackages) {
    Write-Info "📦 Validating NPM Packages..."
    
    $Packages = @(
        "@codai/shared-types",
        "@codai/cbd", 
        "@codai/gateway",
        "@codai/websocket-service",
        "@codai/auth-service",
        "@codai/config",
        "@codai/ui-components",
        "@codai/utils"
    )
    
    foreach ($Package in $Packages) {
        try {
            $ValidationResults.Overall.TotalTests++
            
            $PackageInfo = npm view $Package --json | ConvertFrom-Json
            if ($PackageInfo) {
                Write-Success "Package published: $Package@$($PackageInfo.version)"
                $ValidationResults.Packages[$Package] = @{
                    Status = "PUBLISHED"
                    Version = $PackageInfo.version
                    LastPublished = $PackageInfo.time.modified
                }
                $ValidationResults.Overall.PassedTests++
            } else {
                throw "Package not found"
            }
        } catch {
            Write-Error "Package validation failed: $Package"
            $ValidationResults.Packages[$Package] = @{
                Status = "FAILED"
                Error = $_.Exception.Message
            }
            $ValidationResults.Overall.FailedTests++
        }
    }
}

# Frontend validation (Vercel)
if ($ValidateVercel) {
    Write-Info "🌐 Validating Frontend Applications on Vercel..."
    
    $FrontendApps = @{
        "codai" = "https://codai.$Domain"
        "id" = "https://id.$Domain"
        "bancai" = "https://bancai.$Domain"
        "memorai" = "https://memorai.$Domain"
        "admin" = "https://admin.$Domain"
        "hub" = "https://hub.$Domain"
        "controlai" = "https://controlai.$Domain"
        "romai" = "https://romai.$Domain"
        "docs" = "https://docs.$Domain"
    }
    
    foreach ($App in $FrontendApps.Keys) {
        try {
            $ValidationResults.Overall.TotalTests++
            $Url = $FrontendApps[$App]
            
            $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
            if ($Response.StatusCode -eq 200) {
                Write-Success "Frontend accessible: $App ($Url)"
                $ValidationResults.Frontend[$App] = @{
                    Status = "ACCESSIBLE"
                    Url = $Url
                    StatusCode = $Response.StatusCode
                    ResponseTime = "< 10s"
                }
                $ValidationResults.Overall.PassedTests++
            } else {
                throw "HTTP $($Response.StatusCode)"
            }
        } catch {
            Write-Error "Frontend validation failed: $App ($Url)"
            $ValidationResults.Frontend[$App] = @{
                Status = "FAILED"
                Url = $Url
                Error = $_.Exception.Message
            }
            $ValidationResults.Overall.FailedTests++
        }
    }
}

# Backend validation (AWS)
if ($ValidateAWS) {
    Write-Info "☁️ Validating Backend Services on AWS..."
    
    $BackendServices = @{
        "cbd-database" = "https://api.$Domain/cbd/health"
        "gateway-service" = "https://api.$Domain/health"
        "websocket-service" = "https://api.$Domain/ws/health"
        "ai-analytics" = "https://api.$Domain/analytics/health"
        "collaboration-service" = "https://api.$Domain/collaboration/health"
        "graphql-gateway" = "https://api.$Domain/graphql"
    }
    
    foreach ($Service in $BackendServices.Keys) {
        try {
            $ValidationResults.Overall.TotalTests++
            $Url = $BackendServices[$Service]
            
            $Response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 15
            if ($Response) {
                Write-Success "Backend service healthy: $Service"
                $ValidationResults.Backend[$Service] = @{
                    Status = "HEALTHY"
                    Url = $Url
                    Response = $Response
                }
                $ValidationResults.Overall.PassedTests++
            } else {
                throw "No response"
            }
        } catch {
            Write-Error "Backend validation failed: $Service ($Url)"
            $ValidationResults.Backend[$Service] = @{
                Status = "FAILED"
                Url = $Url
                Error = $_.Exception.Message
            }
            $ValidationResults.Overall.FailedTests++
        }
    }
}

# Comprehensive health checks
if ($ValidateHealthChecks) {
    Write-Info "🩺 Running Comprehensive Health Checks..."
    
    $HealthChecks = @{
        "SSL Certificate" = {
            try {
                $CertCheck = Invoke-WebRequest -Uri "https://api.$Domain" -UseBasicParsing -TimeoutSec 10
                return $CertCheck.StatusCode -eq 200
            } catch {
                return $false
            }
        }
        "Domain Resolution" = {
            try {
                $DnsCheck = Resolve-DnsName $Domain
                return $DnsCheck.Count -gt 0
            } catch {
                return $false
            }
        }
        "CDN Performance" = {
            try {
                $Start = Get-Date
                $CdnCheck = Invoke-WebRequest -Uri "https://cdn.$Domain" -UseBasicParsing -TimeoutSec 10
                $Duration = ((Get-Date) - $Start).TotalMilliseconds
                return $Duration -lt 2000 -and $CdnCheck.StatusCode -eq 200
            } catch {
                return $false
            }
        }
        "Database Connectivity" = {
            try {
                $DbCheck = Invoke-RestMethod -Uri "https://api.$Domain/cbd/stats" -TimeoutSec 15
                return $DbCheck -ne $null
            } catch {
                return $false
            }
        }
        "Cache Performance" = {
            try {
                $CacheCheck = Invoke-RestMethod -Uri "https://api.$Domain/health" -TimeoutSec 10
                return $CacheCheck.cache -eq "healthy"
            } catch {
                return $false
            }
        }
    }
    
    foreach ($Check in $HealthChecks.Keys) {
        try {
            $ValidationResults.Overall.TotalTests++
            $Result = & $HealthChecks[$Check]
            
            if ($Result) {
                Write-Success "Health check passed: $Check"
                $ValidationResults.HealthChecks[$Check] = @{
                    Status = "PASSED"
                    Timestamp = Get-Date
                }
                $ValidationResults.Overall.PassedTests++
            } else {
                throw "Check failed"
            }
        } catch {
            Write-Error "Health check failed: $Check"
            $ValidationResults.HealthChecks[$Check] = @{
                Status = "FAILED"
                Error = $_.Exception.Message
                Timestamp = Get-Date
            }
            $ValidationResults.Overall.FailedTests++
        }
    }
}

# Calculate success rate
if ($ValidationResults.Overall.TotalTests -gt 0) {
    $ValidationResults.Overall.SuccessRate = [math]::Round(($ValidationResults.Overall.PassedTests / $ValidationResults.Overall.TotalTests) * 100, 2)
}

# Generate comprehensive report
if ($GenerateReport) {
    Write-Info "📊 Generating Deployment Validation Report..."
    
    $ReportPath = "DEPLOYMENT_VALIDATION_REPORT_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
    
    $Report = @"
# 🚀 CODAI Deployment Validation Report

**Environment**: $Environment  
**Domain**: $Domain  
**Validation Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')  
**Overall Success Rate**: $($ValidationResults.Overall.SuccessRate)%

## 📊 Summary Statistics
- **Total Tests**: $($ValidationResults.Overall.TotalTests)
- **Passed Tests**: $($ValidationResults.Overall.PassedTests)
- **Failed Tests**: $($ValidationResults.Overall.FailedTests)
- **Success Rate**: $($ValidationResults.Overall.SuccessRate)%

## 📦 Package Validation Results
$(if ($ValidationResults.Packages.Count -gt 0) {
    foreach ($Package in $ValidationResults.Packages.Keys) {
        $Result = $ValidationResults.Packages[$Package]
        if ($Result.Status -eq "PUBLISHED") {
            "✅ **$Package**: Published v$($Result.Version) (Modified: $($Result.LastPublished))"
        } else {
            "❌ **$Package**: FAILED - $($Result.Error)"
        }
    }
} else {
    "⏭️ Package validation was skipped"
} | Out-String)

## 🌐 Frontend Application Results
$(if ($ValidationResults.Frontend.Count -gt 0) {
    foreach ($App in $ValidationResults.Frontend.Keys) {
        $Result = $ValidationResults.Frontend[$App]
        if ($Result.Status -eq "ACCESSIBLE") {
            "✅ **$App**: [$($Result.Url)]($($Result.Url)) (Status: $($Result.StatusCode))"
        } else {
            "❌ **$App**: FAILED - $($Result.Error)"
        }
    }
} else {
    "⏭️ Frontend validation was skipped"
} | Out-String)

## ☁️ Backend Service Results
$(if ($ValidationResults.Backend.Count -gt 0) {
    foreach ($Service in $ValidationResults.Backend.Keys) {
        $Result = $ValidationResults.Backend[$Service]
        if ($Result.Status -eq "HEALTHY") {
            "✅ **$Service**: [$($Result.Url)]($($Result.Url)) - HEALTHY"
        } else {
            "❌ **$Service**: FAILED - $($Result.Error)"
        }
    }
} else {
    "⏭️ Backend validation was skipped"
} | Out-String)

## 🩺 Health Check Results
$(if ($ValidationResults.HealthChecks.Count -gt 0) {
    foreach ($Check in $ValidationResults.HealthChecks.Keys) {
        $Result = $ValidationResults.HealthChecks[$Check]
        if ($Result.Status -eq "PASSED") {
            "✅ **$Check**: PASSED ($(Get-Date $Result.Timestamp -Format 'HH:mm:ss'))"
        } else {
            "❌ **$Check**: FAILED - $($Result.Error) ($(Get-Date $Result.Timestamp -Format 'HH:mm:ss'))"
        }
    }
} else {
    "⏭️ Health checks were skipped"
} | Out-String)

## 🎯 Deployment Status

$(if ($ValidationResults.Overall.SuccessRate -ge 95) {
    "🟢 **EXCELLENT**: Deployment is fully successful and production-ready!"
} elseif ($ValidationResults.Overall.SuccessRate -ge 80) {
    "🟡 **GOOD**: Deployment is mostly successful with minor issues to address."
} else {
    "🔴 **NEEDS ATTENTION**: Deployment has significant issues that need immediate attention."
})

## 🛠️ Recommendations

$(if ($ValidationResults.Overall.FailedTests -gt 0) {
    "### Issues to Address:"
    "- Review failed tests above and fix underlying issues"
    "- Check service logs for detailed error information"
    "- Verify DNS and SSL certificate configuration"
    "- Ensure all environment variables are properly set"
    ""
} else {
    "### Excellent Deployment!"
    "All validation tests passed successfully. Your CODAI ecosystem is fully operational and production-ready."
    ""
})

### Next Steps:
1. **Monitor Performance**: Set up monitoring dashboards
2. **Security Review**: Conduct security audit
3. **Performance Testing**: Run load tests
4. **Backup Verification**: Verify backup procedures
5. **Documentation Update**: Update operational runbooks

## 📞 Support Information
- **Monitoring Dashboard**: https://monitor.$Domain
- **Status Page**: https://status.$Domain
- **Documentation**: https://docs.$Domain
- **Support**: support@$Domain

---
*Report generated by CODAI Deployment Validation Script*  
*Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')*
"@
    
    Set-Content -Path $ReportPath -Value $Report -Encoding UTF8
    Write-Success "Validation report saved: $ReportPath"
}

# Display final results
Write-Info ""
Write-Info "🎯 FINAL VALIDATION RESULTS"
Write-Info "═══════════════════════════════════════════════════════════════"
Write-Info "Total Tests: $($ValidationResults.Overall.TotalTests)"
Write-Info "Passed: $($ValidationResults.Overall.PassedTests)"
Write-Info "Failed: $($ValidationResults.Overall.FailedTests)"
Write-Info "Success Rate: $($ValidationResults.Overall.SuccessRate)%"

if ($ValidationResults.Overall.SuccessRate -ge 95) {
    Write-Success "🟢 EXCELLENT: Deployment is fully successful and production-ready!"
    exit 0
} elseif ($ValidationResults.Overall.SuccessRate -ge 80) {
    Write-Warning "🟡 GOOD: Deployment is mostly successful with minor issues to address."
    exit 0
} else {
    Write-Error "🔴 NEEDS ATTENTION: Deployment has significant issues that need immediate attention."
    exit 1
}
