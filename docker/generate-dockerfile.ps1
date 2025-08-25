#!/usr/bin/env pwsh
# ===========================================================
# CODAI Ecosystem - Docker Configuration Generator
# Microsoft Best Practices: Centralized Template Management
# ===========================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("cbd-service", "nextjs-app", "python-api")]
    [string]$ServiceType,
    
    [Parameter(Mandatory=$true)]
    [int]$ServicePort,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceDescription,
    
    [string]$OutputPath = "",
    
    [switch]$Overwrite
)

# Service configurations
$ServiceConfigs = @{
    "cbd" = @{
        Type = "cbd-service"
        Port = 4180
        Description = "Universal Database Service"
    }
    "memorai" = @{
        Type = "nextjs-app"
        Port = 4006
        Description = "Memory AI Frontend Application"
    }
    "romai" = @{
        Type = "nextjs-app"
        Port = 4007
        Description = "RomAI AGI Frontend Application"
    }
    "kodex" = @{
        Type = "nextjs-app"
        Port = 5000
        Description = "Code Analysis Application"
    }
    "bancai" = @{
        Type = "nextjs-app"
        Port = 4005
        Description = "Banking AI Application"
    }
    "controlai" = @{
        Type = "nextjs-app"
        Port = 4003
        Description = "Control AI Dashboard"
    }
    "admin" = @{
        Type = "nextjs-app"
        Port = 4002
        Description = "Admin Dashboard Application"
    }
    "talentai" = @{
        Type = "nextjs-app"
        Port = 4004
        Description = "Talent AI Application"
    }
    "explorer" = @{
        Type = "nextjs-app"
        Port = 4008
        Description = "Blockchain Explorer Application"
    }
}

function Get-TemplateContent {
    param($TemplatePath, $ServiceName, $ServicePort, $ServiceDescription)
    
    $content = Get-Content $TemplatePath -Raw
    $content = $content -replace '\$\{SERVICE_NAME\}', $ServiceName
    $content = $content -replace '\$\{SERVICE_PORT\}', $ServicePort
    $content = $content -replace '\$\{SERVICE_DESCRIPTION\}', $ServiceDescription
    
    return $content
}

function New-DockerFile {
    param($ServiceName, $ServiceType, $ServicePort, $ServiceDescription, $OutputPath, $Overwrite)
    
    Write-Host "🐳 Generating Dockerfile for $ServiceName ($ServiceType)" -ForegroundColor Cyan
    
    $templatePath = "docker/templates/Dockerfile.$ServiceType"
    
    if (-not (Test-Path $templatePath)) {
        Write-Error "❌ Template not found: $templatePath"
        return
    }
    
    # Determine output path
    if ([string]::IsNullOrEmpty($OutputPath)) {
        switch ($ServiceType) {
            "cbd-service" { $OutputPath = "packages/$ServiceName/Dockerfile" }
            "nextjs-app" { $OutputPath = "apps/$ServiceName/Dockerfile" }
            "python-api" { $OutputPath = "apps/$ServiceName/Dockerfile" }
        }
    }
    
    # Check if file exists
    if ((Test-Path $OutputPath) -and -not $Overwrite) {
        Write-Warning "⚠️ Dockerfile already exists: $OutputPath (use -Overwrite to replace)"
        return
    }
    
    # Generate Dockerfile content
    $dockerfileContent = Get-TemplateContent -TemplatePath $templatePath -ServiceName $ServiceName -ServicePort $ServicePort -ServiceDescription $ServiceDescription
    
    # Ensure directory exists
    $directory = Split-Path $OutputPath -Parent
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Write Dockerfile
    Set-Content -Path $OutputPath -Value $dockerfileContent -Encoding UTF8
    
    Write-Host "✅ Generated: $OutputPath" -ForegroundColor Green
    
    return $OutputPath
}

# Main execution
try {
    # Check if we're in the right directory
    if (-not (Test-Path "docker/templates")) {
        Write-Error "❌ Must be run from codai-project root directory"
        exit 1
    }
    
    # Generate Dockerfile
    $generatedFile = New-DockerFile -ServiceName $ServiceName -ServiceType $ServiceType -ServicePort $ServicePort -ServiceDescription $ServiceDescription -OutputPath $OutputPath -Overwrite $Overwrite
    
    if ($generatedFile) {
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Review generated Dockerfile: $generatedFile"
        Write-Host "   2. Test build: docker build -t codai-$ServiceName -f $generatedFile ."
        Write-Host "   3. Remove old Dockerfile variants"
        Write-Host ""
    }
    
} catch {
    Write-Error "❌ Error generating Dockerfile: $($_.Exception.Message)"
    exit 1
}

# Show usage if called without parameters
if ($args.Count -eq 0 -and -not $ServiceName) {
    Write-Host ""
    Write-Host "🐳 CODAI Docker Configuration Generator" -ForegroundColor Cyan
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  ./docker/generate-dockerfile.ps1 -ServiceName cbd -ServiceType cbd-service -ServicePort 4180 -ServiceDescription 'Universal Database Service'"
    Write-Host "  ./docker/generate-dockerfile.ps1 -ServiceName memorai -ServiceType nextjs-app -ServicePort 4006 -ServiceDescription 'Memory AI App'"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -ServiceName        Name of the service (e.g., cbd, memorai, romai)"
    Write-Host "  -ServiceType        Type: cbd-service, nextjs-app, python-api"
    Write-Host "  -ServicePort        Port number for the service"
    Write-Host "  -ServiceDescription Human-readable description"
    Write-Host "  -OutputPath         Custom output path (optional)"
    Write-Host "  -Overwrite          Replace existing Dockerfile"
    Write-Host ""
    Write-Host "Preconfigured Services:"
    foreach ($service in $ServiceConfigs.GetEnumerator()) {
        $config = $service.Value
        Write-Host "  $($service.Key.PadRight(12)) - $($config.Type) on port $($config.Port)"
    }
    Write-Host ""
}