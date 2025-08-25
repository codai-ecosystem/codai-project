#!/usr/bin/env pwsh
# ===========================================================
# CODAI Ecosystem - Docker Consolidation Script
# Replaces all duplicate Dockerfiles with standardized versions
# ===========================================================

param(
    [switch]$DryRun,
    [switch]$Backup,
    [switch]$Force
)

# Service configurations with their proper types and ports
$Services = @{
    "cbd" = @{ Type = "cbd-service"; Port = 4180; Description = "Universal Database Service"; Path = "packages/cbd" }
    "memorai" = @{ Type = "nextjs-app"; Port = 4006; Description = "Memory AI Frontend Application"; Path = "apps/memorai" }
    "romai" = @{ Type = "nextjs-app"; Port = 4007; Description = "RomAI AGI Frontend Application"; Path = "apps/romai" }
    "kodex" = @{ Type = "nextjs-app"; Port = 5000; Description = "Code Analysis Application"; Path = "apps/kodex" }
    "bancai" = @{ Type = "nextjs-app"; Port = 4005; Description = "Banking AI Application"; Path = "apps/bancai" }
    "controlai" = @{ Type = "nextjs-app"; Port = 4003; Description = "Control AI Dashboard"; Path = "apps/controlai" }
    "admin" = @{ Type = "nextjs-app"; Port = 4002; Description = "Admin Dashboard Application"; Path = "apps/admin" }
    "talentai" = @{ Type = "nextjs-app"; Port = 4004; Description = "Talent AI Application"; Path = "apps/talentai" }
    "explorer" = @{ Type = "nextjs-app"; Port = 4008; Description = "Blockchain Explorer Application"; Path = "apps/explorer" }
}

function Find-AllDockerfiles {
    Write-Host "🔍 Scanning for Docker files..." -ForegroundColor Cyan
    
    $dockerfiles = Get-ChildItem -Recurse -Name -Include "Dockerfile*" | Where-Object { 
        $_ -notlike "docker/templates/*" -and 
        $_ -notlike ".git/*" -and 
        $_ -notlike "node_modules/*" 
    }
    
    Write-Host "Found $($dockerfiles.Count) Docker files:" -ForegroundColor Yellow
    foreach ($file in $dockerfiles | Sort-Object) {
        Write-Host "  📄 $file"
    }
    
    return $dockerfiles
}

function Backup-DockerFiles {
    param($Dockerfiles)
    
    $backupDir = "docker/backup/$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    Write-Host "💾 Backing up Docker files to: $backupDir" -ForegroundColor Yellow
    
    foreach ($dockerfile in $Dockerfiles) {
        $backupPath = Join-Path $backupDir $dockerfile.Replace("/", "_").Replace("\", "_")
        Copy-Item $dockerfile -Destination $backupPath
        Write-Host "  📄 Backed up: $dockerfile"
    }
    
    return $backupDir
}

function Remove-DuplicateDockerfiles {
    param($ServiceName, $ServicePath, $DryRun)
    
    $servicePath = $ServicePath
    if (-not (Test-Path $servicePath)) {
        Write-Warning "⚠️ Service path not found: $servicePath"
        return
    }
    
    # Find all Dockerfiles in service directory
    $dockerfiles = Get-ChildItem -Path $servicePath -Name -Include "Dockerfile*"
    
    if ($dockerfiles.Count -le 1) {
        Write-Host "  ✅ $ServiceName - No duplicates found" -ForegroundColor Green
        return
    }
    
    Write-Host "  🔄 $ServiceName - Found $($dockerfiles.Count) Docker files:" -ForegroundColor Yellow
    foreach ($file in $dockerfiles) {
        Write-Host "    📄 $servicePath/$file"
    }
    
    # Keep only the main Dockerfile, remove variants
    $toRemove = $dockerfiles | Where-Object { $_ -ne "Dockerfile" }
    
    foreach ($file in $toRemove) {
        $fullPath = Join-Path $servicePath $file
        if ($DryRun) {
            Write-Host "    🗑️  Would remove: $fullPath" -ForegroundColor Red
        } else {
            Remove-Item $fullPath -Force
            Write-Host "    ✅ Removed: $fullPath" -ForegroundColor Green
        }
    }
}

function Generate-StandardDockerfile {
    param($ServiceName, $ServiceConfig, $DryRun)
    
    $outputPath = Join-Path $ServiceConfig.Path "Dockerfile"
    
    if ($DryRun) {
        Write-Host "  📝 Would generate: $outputPath" -ForegroundColor Cyan
        return
    }
    
    # Use the generator script
    $params = @{
        ServiceName = $ServiceName
        ServiceType = $ServiceConfig.Type
        ServicePort = $ServiceConfig.Port
        ServiceDescription = $ServiceConfig.Description
        OutputPath = $outputPath
        Overwrite = $true
    }
    
    try {
        & "docker/generate-dockerfile.ps1" @params
        Write-Host "  ✅ Generated standardized Dockerfile for $ServiceName" -ForegroundColor Green
    } catch {
        Write-Error "  ❌ Failed to generate Dockerfile for $ServiceName`: $($_.Exception.Message)"
    }
}

function Remove-DeploymentDockerDuplicates {
    param($DryRun)
    
    Write-Host "🗑️  Removing deployment/docker/ duplicates..." -ForegroundColor Yellow
    
    $deploymentDockerPath = "deployment/docker"
    if (-not (Test-Path $deploymentDockerPath)) {
        Write-Host "  ✅ No deployment/docker directory found" -ForegroundColor Green
        return
    }
    
    $deploymentDockers = Get-ChildItem -Path $deploymentDockerPath -Name -Include "Dockerfile*"
    
    foreach ($file in $deploymentDockers) {
        $fullPath = Join-Path $deploymentDockerPath $file
        if ($DryRun) {
            Write-Host "  🗑️  Would remove: $fullPath" -ForegroundColor Red
        } else {
            Remove-Item $fullPath -Force
            Write-Host "  ✅ Removed: $fullPath" -ForegroundColor Green
        }
    }
    
    # Remove empty directory
    if ((Get-ChildItem -Path $deploymentDockerPath | Measure-Object).Count -eq 0) {
        if ($DryRun) {
            Write-Host "  🗑️  Would remove empty directory: $deploymentDockerPath" -ForegroundColor Red
        } else {
            Remove-Item $deploymentDockerPath -Force
            Write-Host "  ✅ Removed empty directory: $deploymentDockerPath" -ForegroundColor Green
        }
    }
}

# Main execution
try {
    Write-Host ""
    Write-Host "🐳 CODAI Docker Consolidation Script" -ForegroundColor Cyan
    Write-Host "====================================="
    Write-Host ""
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
        Write-Host ""
    }
    
    # Scan for all Docker files
    $allDockerfiles = Find-AllDockerfiles
    
    # Backup if requested
    if ($Backup -and -not $DryRun) {
        Backup-DockerFiles -Dockerfiles $allDockerfiles
        Write-Host ""
    }
    
    # Process each service
    Write-Host "🔧 Processing services..." -ForegroundColor Cyan
    foreach ($service in $Services.GetEnumerator()) {
        $serviceName = $service.Key
        $serviceConfig = $service.Value
        
        Write-Host "  🎯 Processing $serviceName..." -ForegroundColor White
        
        # Remove duplicate Dockerfiles
        Remove-DuplicateDockerfiles -ServiceName $serviceName -ServicePath $serviceConfig.Path -DryRun $DryRun
        
        # Generate standard Dockerfile
        if (-not $DryRun) {
            Generate-StandardDockerfile -ServiceName $serviceName -ServiceConfig $serviceConfig -DryRun $DryRun
        }
    }
    
    Write-Host ""
    
    # Remove deployment/docker duplicates
    Remove-DeploymentDockerDuplicates -DryRun $DryRun
    
    Write-Host ""
    Write-Host "✅ Docker consolidation complete!" -ForegroundColor Green
    
    if ($DryRun) {
        Write-Host ""
        Write-Host "To apply changes, run without -DryRun flag:" -ForegroundColor Yellow
        Write-Host "  ./docker/consolidate-dockerfiles.ps1 -Backup" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Yellow
        Write-Host "  1. Test builds: docker-compose build"
        Write-Host "  2. Review generated Dockerfiles"
        Write-Host "  3. Update docker-compose.yml if needed"
        Write-Host ""
    }
    
} catch {
    Write-Error "❌ Consolidation failed: $($_.Exception.Message)"
    exit 1
}