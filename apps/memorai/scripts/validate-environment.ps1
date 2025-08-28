#!/usr/bin/env pwsh
# MemorAI Environment Validation Script
# Validates that all required environment variables and configurations are properly set

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    
    [Parameter(Mandatory=$false)]
    [switch]$CheckSecrets,
    
    [Parameter(Mandatory=$false)]
    [switch]$CheckServices,
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport
)

function Write-ColorOutput($Message, $Color = "White", [switch]$NoNewline) {
    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Test-EnvironmentVariable($VarName, $IsRequired = $true, $IsSecret = $false) {
    $value = [Environment]::GetEnvironmentVariable($VarName)
    $hasValue = -not [string]::IsNullOrWhiteSpace($value)
    
    $displayValue = if ($IsSecret -and $hasValue) { "*".PadRight($value.Length, '*') } else { $value }
    
    Write-ColorOutput "  $VarName`: " "White" -NoNewline
    
    if ($hasValue) {
        Write-ColorOutput "✅ $displayValue" "Green"
        return @{ Name = $VarName; Status = "OK"; Value = $displayValue; Required = $IsRequired }
    } elseif ($IsRequired) {
        Write-ColorOutput "❌ MISSING (Required)" "Red"
        return @{ Name = $VarName; Status = "MISSING"; Value = ""; Required = $IsRequired }
    } else {
        Write-ColorOutput "⚪ Not set (Optional)" "Yellow"
        return @{ Name = $VarName; Status = "OPTIONAL"; Value = ""; Required = $IsRequired }
    }
}

function Test-ServiceEndpoint($Name, $Url, $ExpectedStatus = 200, $Timeout = 10) {
    Write-ColorOutput "  $Name ($Url)`: " "White" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $Timeout -UseBasicParsing
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-ColorOutput "✅ HEALTHY" "Green"
            return @{ Name = $Name; Url = $Url; Status = "HEALTHY"; StatusCode = $response.StatusCode }
        } else {
            Write-ColorOutput "⚠️ UNEXPECTED STATUS: $($response.StatusCode)" "Yellow"
            return @{ Name = $Name; Url = $Url; Status = "WARNING"; StatusCode = $response.StatusCode }
        }
    } catch {
        Write-ColorOutput "❌ FAILED: $($_.Exception.Message)" "Red"
        return @{ Name = $Name; Url = $Url; Status = "FAILED"; Error = $_.Exception.Message }
    }
}

function Get-EnvironmentConfiguration($EnvType) {
    switch ($EnvType) {
        "development" {
            return @{
                RequiredVars = @("NODE_ENV", "NEXTAUTH_SECRET", "NEXTAUTH_URL")
                OptionalVars = @("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXT_PUBLIC_MEMORAI_API_KEY")
                Secrets = @("NEXTAUTH_SECRET", "GOOGLE_CLIENT_SECRET", "NEXT_PUBLIC_MEMORAI_API_KEY")
                Services = @(
                    @{ Name = "Next.js App"; Url = "http://localhost:4006" },
                    @{ Name = "MemorAI MCP"; Url = "http://localhost:4950/health" },
                    @{ Name = "CBD Database"; Url = "http://localhost:4180/health" }
                )
            }
        }
        "staging" {
            return @{
                RequiredVars = @("NODE_ENV", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_API_BASE_URL")
                OptionalVars = @("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "APPLICATIONINSIGHTS_CONNECTION_STRING", "SENTRY_DSN")
                Secrets = @("NEXTAUTH_SECRET", "GOOGLE_CLIENT_SECRET", "JWT_SECRET", "CSRF_SECRET", "NEXT_PUBLIC_MEMORAI_API_KEY")
                Services = @(
                    @{ Name = "Staging App"; Url = "https://memorai-staging.azurestaticapps.net" },
                    @{ Name = "Staging API"; Url = "https://memorai-api-staging.azurestaticapps.net/health" }
                )
            }
        }
        "production" {
            return @{
                RequiredVars = @("NODE_ENV", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_MEMORAI_MCP_URL", "NEXT_PUBLIC_CBD_BASE_URL")
                OptionalVars = @("APPLICATIONINSIGHTS_CONNECTION_STRING", "SENTRY_DSN", "DATABASE_URL", "NEXT_PUBLIC_GA_MEASUREMENT_ID")
                Secrets = @("NEXTAUTH_SECRET", "GOOGLE_CLIENT_SECRET", "JWT_SECRET", "CSRF_SECRET", "NEXT_PUBLIC_MEMORAI_API_KEY")
                Services = @(
                    @{ Name = "Production App"; Url = "https://memorai.azurestaticapps.net" },
                    @{ Name = "Production API"; Url = "https://memorai-api.azurestaticapps.net/health" },
                    @{ Name = "MemorAI MCP"; Url = "https://memorai-mcp.azurestaticapps.net/health" },
                    @{ Name = "CBD API"; Url = "https://cbd-api.azurestaticapps.net/health" }
                )
            }
        }
    }
}

# Main validation logic
Write-ColorOutput "🔍 MemorAI Environment Validation Report" "Green"
Write-ColorOutput "=========================================" "Green"
Write-ColorOutput "Environment: $Environment" "Cyan"
Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')" "Gray"
Write-ColorOutput ""

$config = Get-EnvironmentConfiguration $Environment
$results = @{
    Environment = $Environment
    Timestamp = Get-Date
    Variables = @()
    Services = @()
    Summary = @{}
}

# Test environment variables
Write-ColorOutput "📋 Environment Variables Check:" "Cyan"

foreach ($varName in $config.RequiredVars) {
    $isSecret = $varName -in $config.Secrets
    $result = Test-EnvironmentVariable $varName $true $isSecret
    $results.Variables += $result
}

foreach ($varName in $config.OptionalVars) {
    $isSecret = $varName -in $config.Secrets
    $result = Test-EnvironmentVariable $varName $false $isSecret
    $results.Variables += $result
}

# Test services if requested
if ($CheckServices -and $config.Services) {
    Write-ColorOutput "`n🌐 Service Endpoints Check:" "Cyan"
    
    foreach ($service in $config.Services) {
        $result = Test-ServiceEndpoint $service.Name $service.Url
        $results.Services += $result
    }
}

# Generate summary
$requiredVars = $results.Variables | Where-Object { $_.Required }
$missingRequired = $requiredVars | Where-Object { $_.Status -eq "MISSING" }
$healthyServices = $results.Services | Where-Object { $_.Status -eq "HEALTHY" }

$results.Summary = @{
    TotalVariables = $results.Variables.Count
    RequiredVariables = $requiredVars.Count
    MissingRequired = $missingRequired.Count
    ConfigurationComplete = ($missingRequired.Count -eq 0)
    TotalServices = $results.Services.Count
    HealthyServices = $healthyServices.Count
    ServicesHealthy = ($results.Services.Count -eq 0 -or $healthyServices.Count -eq $results.Services.Count)
}

# Display summary
Write-ColorOutput "`n📊 Validation Summary:" "Yellow"
Write-ColorOutput "Environment Variables: $($requiredVars.Count - $missingRequired.Count)/$($requiredVars.Count) required configured" $(if ($missingRequired.Count -eq 0) { "Green" } else { "Red" })

if ($results.Services.Count -gt 0) {
    Write-ColorOutput "Service Endpoints: $($healthyServices.Count)/$($results.Services.Count) healthy" $(if ($results.Summary.ServicesHealthy) { "Green" } else { "Red" })
}

# Overall status
$overallStatus = $results.Summary.ConfigurationComplete -and $results.Summary.ServicesHealthy
Write-ColorOutput "`n🎯 Overall Status: " "White" -NoNewline
if ($overallStatus) {
    Write-ColorOutput "✅ READY FOR $($Environment.ToUpper())" "Green"
} else {
    Write-ColorOutput "❌ CONFIGURATION INCOMPLETE" "Red"
}

# Show missing requirements
if ($missingRequired.Count -gt 0) {
    Write-ColorOutput "`n🚨 Missing Required Variables:" "Red"
    foreach ($missing in $missingRequired) {
        Write-ColorOutput "  ❌ $($missing.Name)" "Red"
    }
    
    Write-ColorOutput "`n💡 Quick Fix Commands:" "Yellow"
    Write-ColorOutput "# Set missing variables (replace with actual values):" "Gray"
    foreach ($missing in $missingRequired) {
        Write-ColorOutput "`$env:$($missing.Name) = 'YOUR_VALUE_HERE'" "Gray"
    }
}

# Generate report file if requested
if ($GenerateReport) {
    $reportPath = ".\memorai-environment-validation-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $results | ConvertTo-Json -Depth 4 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-ColorOutput "`n📄 Detailed report saved to: $reportPath" "Cyan"
}

Write-ColorOutput ""
Write-ColorOutput "🔧 For more details, see:" "Cyan"
Write-ColorOutput "  • docs/GITHUB_SECRETS_SETUP_GUIDE.md" "Gray"
Write-ColorOutput "  • scripts/setup-environment-variables.ps1" "Gray"
Write-ColorOutput "  • .env.azure-production (template)" "Gray"

# Exit with appropriate code
exit $(if ($overallStatus) { 0 } else { 1 })