#!/usr/bin/env pwsh
# MemorAI Environment Variables Setup Script for Azure Static Web Apps
# This script helps configure environment variables for different environments

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "memorai-resources",
    
    [Parameter(Mandatory=$false)]
    [string]$StaticWebAppName = "memorai-app",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Validate
)

# Environment-specific configurations
$envConfigs = @{
    development = @{
        NODE_ENV = "development"
        NEXT_PUBLIC_APP_URL = "http://localhost:4006"
        NEXT_PUBLIC_API_BASE_URL = "http://localhost:4950"
        NEXTAUTH_URL = "http://localhost:4006"
        NEXT_PUBLIC_MEMORAI_MCP_URL = "http://localhost:4950"
        NEXT_PUBLIC_CBD_BASE_URL = "http://localhost:4180"
        DEBUG_MODE = "true"
        VERBOSE_LOGGING = "true"
    }
    staging = @{
        NODE_ENV = "production"
        NEXT_PUBLIC_APP_URL = "https://memorai-staging.azurestaticapps.net"
        NEXT_PUBLIC_API_BASE_URL = "https://memorai-api-staging.azurestaticapps.net"
        NEXTAUTH_URL = "https://memorai-staging.azurestaticapps.net"
        NEXT_PUBLIC_MEMORAI_MCP_URL = "https://memorai-mcp-staging.azurestaticapps.net"
        NEXT_PUBLIC_CBD_BASE_URL = "https://cbd-api-staging.azurestaticapps.net"
        DEBUG_MODE = "false"
        VERBOSE_LOGGING = "false"
    }
    production = @{
        NODE_ENV = "production"
        NEXT_PUBLIC_APP_URL = "https://memorai.azurestaticapps.net"
        NEXT_PUBLIC_API_BASE_URL = "https://memorai-api.azurestaticapps.net"
        NEXTAUTH_URL = "https://memorai.azurestaticapps.net"
        NEXT_PUBLIC_MEMORAI_MCP_URL = "https://memorai-mcp.azurestaticapps.net"
        NEXT_PUBLIC_CBD_BASE_URL = "https://cbd-api.azurestaticapps.net"
        DEBUG_MODE = "false"
        VERBOSE_LOGGING = "false"
        NEXT_TELEMETRY_DISABLED = "1"
        NODE_OPTIONS = "--max-old-space-size=2048"
    }
}

# Required secrets that must be configured manually
$requiredSecrets = @(
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID", 
    "GOOGLE_CLIENT_SECRET",
    "NEXT_PUBLIC_MEMORAI_API_KEY",
    "JWT_SECRET",
    "CSRF_SECRET"
)

# Optional secrets for enhanced functionality
$optionalSecrets = @(
    "APPLICATIONINSIGHTS_CONNECTION_STRING",
    "DATABASE_URL",
    "SENTRY_DSN",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "AZURE_STORAGE_CONNECTION_STRING"
)

function Write-ColorOutput($Message, $Color = "White") {
    Write-Host $Message -ForegroundColor $Color
}

function Generate-SecureSecret($Length = 64) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $secret = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $secret += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $secret
}

function Test-AzureCLI {
    try {
        $null = az account show 2>$null
        return $true
    } catch {
        return $false
    }
}

function Set-EnvironmentVariables($Config, $ResourceGroup, $AppName) {
    Write-ColorOutput "🔧 Configuring environment variables for $Environment..." "Cyan"
    
    $successCount = 0
    $errorCount = 0
    
    foreach ($key in $Config.Keys) {
        $value = $Config[$key]
        
        if ($DryRun) {
            Write-ColorOutput "  [DRY RUN] Would set: $key = $value" "Yellow"
            continue
        }
        
        try {
            Write-Host "  Setting: $key" -NoNewline
            az staticwebapp appsettings set `
                --name $AppName `
                --resource-group $ResourceGroup `
                --setting-names "$key=$value" `
                --output none 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput " ✅" "Green"
                $successCount++
            } else {
                Write-ColorOutput " ❌" "Red"
                $errorCount++
            }
        } catch {
            Write-ColorOutput "  ❌ Error setting $key`: $_" "Red"
            $errorCount++
        }
    }
    
    Write-ColorOutput "📊 Results: $successCount successful, $errorCount errors" $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
}

function Show-SecretsChecklist($RequiredSecrets, $OptionalSecrets) {
    Write-ColorOutput "`n🔐 REQUIRED SECRETS CHECKLIST:" "Yellow"
    Write-ColorOutput "⚠️  These must be configured manually in Azure Portal or Azure CLI:" "Yellow"
    
    foreach ($secret in $RequiredSecrets) {
        $example = switch ($secret) {
            "NEXTAUTH_SECRET" { "Generate: openssl rand -base64 32" }
            "GOOGLE_CLIENT_ID" { "From Google Cloud Console OAuth 2.0" }
            "GOOGLE_CLIENT_SECRET" { "From Google Cloud Console OAuth 2.0" }
            "NEXT_PUBLIC_MEMORAI_API_KEY" { "Your MemorAI API key" }
            "JWT_SECRET" { "Generate: openssl rand -base64 64" }
            "CSRF_SECRET" { "Generate: openssl rand -base64 32" }
            default { "Configure as needed" }
        }
        Write-ColorOutput "  ❗ $secret" "Red"
        Write-ColorOutput "     $example" "Gray"
    }
    
    Write-ColorOutput "`n🔧 OPTIONAL SECRETS (for enhanced functionality):" "Cyan"
    foreach ($secret in $OptionalSecrets) {
        Write-ColorOutput "  ⚪ $secret" "White"
    }
    
    Write-ColorOutput "`n📝 To set secrets manually:" "Green"
    Write-ColorOutput "az staticwebapp appsettings set --name $StaticWebAppName --resource-group $ResourceGroupName --setting-names `"SECRET_NAME=SECRET_VALUE`"" "Gray"
}

function Validate-Environment($ResourceGroup, $AppName) {
    Write-ColorOutput "`n🔍 Validating environment configuration..." "Cyan"
    
    try {
        $settings = az staticwebapp appsettings list `
            --name $AppName `
            --resource-group $ResourceGroup `
            --query "properties" `
            --output json | ConvertFrom-Json
        
        $configuredSecrets = @()
        $missingSecrets = @()
        
        foreach ($secret in $requiredSecrets) {
            if ($settings.PSObject.Properties.Name -contains $secret) {
                $configuredSecrets += $secret
            } else {
                $missingSecrets += $secret
            }
        }
        
        Write-ColorOutput "✅ Configured secrets ($($configuredSecrets.Count)/$($requiredSecrets.Count)):" "Green"
        foreach ($secret in $configuredSecrets) {
            Write-ColorOutput "  ✅ $secret" "Green"
        }
        
        if ($missingSecrets.Count -gt 0) {
            Write-ColorOutput "`n❌ Missing required secrets:" "Red"
            foreach ($secret in $missingSecrets) {
                Write-ColorOutput "  ❌ $secret" "Red"
            }
        } else {
            Write-ColorOutput "`n🎉 All required secrets are configured!" "Green"
        }
        
        return $missingSecrets.Count -eq 0
        
    } catch {
        Write-ColorOutput "❌ Error validating environment: $_" "Red"
        return $false
    }
}

# Main execution
Write-ColorOutput "🚀 MemorAI Environment Variables Setup" "Green"
Write-ColorOutput "==========================================" "Green"

# Check Azure CLI
if (-not (Test-AzureCLI)) {
    Write-ColorOutput "❌ Azure CLI not found or not logged in." "Red"
    Write-ColorOutput "Please install Azure CLI and run 'az login' first." "Red"
    exit 1
}

Write-ColorOutput "✅ Azure CLI is ready" "Green"

# Validate parameters
if (-not $envConfigs.ContainsKey($Environment)) {
    Write-ColorOutput "❌ Invalid environment: $Environment" "Red"
    exit 1
}

$config = $envConfigs[$Environment]

# Show current configuration
Write-ColorOutput "`n📋 Configuration Summary:" "Cyan"
Write-ColorOutput "Environment: $Environment" "White"
Write-ColorOutput "Resource Group: $ResourceGroupName" "White"
Write-ColorOutput "Static Web App: $StaticWebAppName" "White"
Write-ColorOutput "Dry Run: $DryRun" "White"

if ($Validate) {
    $isValid = Validate-Environment $ResourceGroupName $StaticWebAppName
    exit $(if ($isValid) { 0 } else { 1 })
}

# Set environment variables
Set-EnvironmentVariables $config $ResourceGroupName $StaticWebAppName

# Show secrets checklist
Show-SecretsChecklist $requiredSecrets $optionalSecrets

Write-ColorOutput "`n✨ Environment setup complete!" "Green"
Write-ColorOutput "Remember to configure the required secrets manually." "Yellow"