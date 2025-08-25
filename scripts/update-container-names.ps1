#!/usr/bin/env pwsh
# Update Container Names to Follow Microsoft Best Practices
# This script updates docker-compose.yml container names to properly reflect their function

Write-Host "🔄 Updating Docker Container Names to Microsoft Best Practices..." -ForegroundColor Cyan

$dockerComposePath = "docker-compose.yml"
$content = Get-Content $dockerComposePath -Raw

# Database and Infrastructure Services
$content = $content -replace 'container_name: codai-postgres', 'container_name: codai-postgresql-db'
$content = $content -replace 'container_name: codai-redis', 'container_name: codai-redis-cache'  
$content = $content -replace 'container_name: codai-cbd-database', 'container_name: codai-cbd-db'

# API Gateway Services
$content = $content -replace 'container_name: codai-gateway', 'container_name: codai-main-api-gateway'
$content = $content -replace 'container_name: codai-secure-gateway', 'container_name: codai-secure-api-gateway'
$content = $content -replace 'container_name: codai-nginx', 'container_name: codai-nginx-load-balancer'
$content = $content -replace 'container_name: codai-ssl-proxy', 'container_name: codai-ssl-termination-proxy'

# Backend API Services  
$content = $content -replace 'container_name: codai-id-service', 'container_name: codai-identity-api'
$content = $content -replace 'container_name: codai-hub-service', 'container_name: codai-hub-api'
$content = $content -replace 'container_name: codai-memorai-mcp', 'container_name: codai-memorai-mcp-api'
$content = $content -replace 'container_name: codai-memorai-graphql', 'container_name: codai-memorai-graphql-api'
$content = $content -replace 'container_name: codai-websocket-service', 'container_name: codai-websocket-api'

# Frontend Applications
$content = $content -replace 'container_name: codai-memorai-app', 'container_name: codai-memorai-frontend'
$content = $content -replace 'container_name: codai-bancai-service', 'container_name: codai-bancai-frontend'
$content = $content -replace 'container_name: codai-admin-service', 'container_name: codai-admin-frontend'
$content = $content -replace 'container_name: codai-explorer', 'container_name: codai-explorer-frontend'
$content = $content -replace 'container_name: codai-controlai-dashboard', 'container_name: codai-controlai-frontend'

# RomAI Services (already mostly correct)
# codai-romai-ml-api - already correct
# codai-romai-frontend - already correct  
# codai-romai-compliance - should be codai-romai-compliance-api
$content = $content -replace 'container_name: codai-romai-compliance', 'container_name: codai-romai-compliance-api'

# Save the updated content
Set-Content -Path $dockerComposePath -Value $content -Encoding UTF8

Write-Host "✅ Container names updated successfully!" -ForegroundColor Green

# Validate the updated YAML
try {
    docker-compose config | Out-Null
    Write-Host "✅ Docker Compose YAML validation passed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose YAML validation failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 New Container Naming Convention:" -ForegroundColor White
Write-Host "  🗄️  Database Services:     codai-<service>-db" -ForegroundColor Gray
Write-Host "  ⚡ Cache Services:        codai-<service>-cache" -ForegroundColor Gray
Write-Host "  🚪 API Gateway Services:  codai-<service>-api-gateway" -ForegroundColor Gray  
Write-Host "  🔌 Backend API Services:  codai-<service>-api" -ForegroundColor Gray
Write-Host "  🌐 Frontend Applications: codai-<service>-frontend" -ForegroundColor Gray
Write-Host "  🔒 Infrastructure:        codai-<service>-<function>" -ForegroundColor Gray
Write-Host ""
Write-Host "Ready to rebuild containers with proper Microsoft naming conventions!" -ForegroundColor Green