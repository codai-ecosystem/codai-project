#!/usr/bin/env pwsh
# RomAI AGI Docker Build and Deployment Script
# Builds optimized containers for production deployment

param(
    [string]$Action = "build",
    [string]$Environment = "development",
    [switch]$Push = $false,
    [switch]$Clean = $false
)

Write-Host "🚀 RomAI AGI Docker Build Script" -ForegroundColor Cyan
Write-Host "Action: $Action | Environment: $Environment" -ForegroundColor Yellow

# Configuration
$IMAGE_NAME = "codai/romai-agi"
$VERSION = Get-Date -Format "yyyy.MM.dd-HHmm"
$DOCKERFILE = "apps/romai/Dockerfile.agi"

# Clean previous builds if requested
if ($Clean) {
    Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
    docker system prune -f
    docker image prune -f
}

switch ($Action.ToLower()) {
    "build" {
        Write-Host "🔨 Building RomAI AGI Docker image..." -ForegroundColor Green
        
        # Build the AGI server image
        $buildCmd = @(
            "docker", "build",
            "-f", $DOCKERFILE,
            "-t", "${IMAGE_NAME}:latest",
            "-t", "${IMAGE_NAME}:${VERSION}",
            "--build-arg", "ENVIRONMENT=${Environment}",
            "."
        )
        
        Write-Host "Executing: $($buildCmd -join ' ')" -ForegroundColor Gray
        & $buildCmd[0] $buildCmd[1..($buildCmd.Length-1)]
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build completed successfully!" -ForegroundColor Green
            Write-Host "🏷️  Tagged as: ${IMAGE_NAME}:latest and ${IMAGE_NAME}:${VERSION}" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    "compose" {
        Write-Host "🐳 Starting Docker Compose stack..." -ForegroundColor Green
        docker-compose -f docker-compose.agi.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker Compose stack started!" -ForegroundColor Green
            Write-Host "🌐 AGI Server: http://localhost:8000" -ForegroundColor Cyan
            Write-Host "📊 Monitoring: http://localhost:3000" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Docker Compose failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    "stop" {
        Write-Host "🛑 Stopping Docker Compose stack..." -ForegroundColor Yellow
        docker-compose -f docker-compose.agi.yml down
        Write-Host "✅ Stack stopped!" -ForegroundColor Green
    }
    
    "test" {
        Write-Host "🧪 Testing AGI container..." -ForegroundColor Green
        
        # Run health check
        $healthCheck = docker run --rm -d -p 8001:8000 "${IMAGE_NAME}:latest"
        Start-Sleep 30
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 10
            Write-Host "✅ Health check passed: $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        } finally {
            docker stop $healthCheck | Out-Null
        }
    }
    
    "push" {
        if (-not $Push) {
            Write-Host "⚠️  Use -Push flag to push to registry" -ForegroundColor Yellow
            return
        }
        
        Write-Host "📤 Pushing to container registry..." -ForegroundColor Green
        docker push "${IMAGE_NAME}:latest"
        docker push "${IMAGE_NAME}:${VERSION}"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push completed!" -ForegroundColor Green
        } else {
            Write-Host "❌ Push failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    "logs" {
        Write-Host "📋 Showing AGI container logs..." -ForegroundColor Green
        docker-compose -f docker-compose.agi.yml logs -f romai-agi
    }
    
    "status" {
        Write-Host "📊 Container status:" -ForegroundColor Green
        docker-compose -f docker-compose.agi.yml ps
        
        Write-Host "`n🔍 Resource usage:" -ForegroundColor Green
        docker stats --no-stream
    }
    
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Available actions: build, compose, stop, test, push, logs, status" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🎉 RomAI AGI Docker operation completed!" -ForegroundColor Green
