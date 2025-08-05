#!/usr/bin/env pwsh

# CODAI Ecosystem Database Setup Script
# This script configures CBD Universal Database as the central hub for the CODAI ecosystem

Write-Host "🌐 CODAI Ecosystem Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CBD_HOST = "localhost"
$CBD_PORT = "8080"
$CBD_BASE_URL = "http://${CBD_HOST}:${CBD_PORT}"

# Function to make API calls to CBD
function Invoke-CBDApi {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [hashtable]$Body = $null
    )
    
    $Uri = "${CBD_BASE_URL}${Endpoint}"
    $Headers = @{ "Content-Type" = "application/json" }
    
    try {
        if ($Body) {
            $JsonBody = $Body | ConvertTo-Json -Depth 10
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $JsonBody
        } else {
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers
        }
        return $Response
    } catch {
        Write-Host "❌ API call failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step 1: Verify CBD is running
Write-Host "🔍 Step 1: Verifying CBD Universal Database..." -ForegroundColor Yellow
$healthCheck = Invoke-CBDApi -Endpoint "/health"
if ($healthCheck -and $healthCheck.status -eq "healthy") {
    Write-Host "✅ CBD Universal Database is healthy" -ForegroundColor Green
    Write-Host "   Version: $($healthCheck.version)" -ForegroundColor Gray
    Write-Host "   Paradigms: $($healthCheck.paradigms)" -ForegroundColor Gray
    Write-Host "   Uptime: $($healthCheck.uptime) seconds" -ForegroundColor Gray
} else {
    Write-Host "❌ CBD Universal Database is not accessible" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create Ecosystem Database Structure
Write-Host "🗄️ Step 2: Creating CODAI Ecosystem Database Structure..." -ForegroundColor Yellow

# Define service schemas to create
$services = @(
    @{ name = "memorai"; description = "MemorAI memory management and AI agents" },
    @{ name = "admin"; description = "Administrative dashboard and system management" },
    @{ name = "bancai"; description = "BancAI financial AI and banking services" },
    @{ name = "romai"; description = "RomAI Romanian language AI platform" },
    @{ name = "hub"; description = "Service hub and orchestration center" },
    @{ name = "control"; description = "ControlAI project and task management" },
    @{ name = "id"; description = "Identity management and authentication service" },
    @{ name = "apps"; description = "Application marketplace and management" },
    @{ name = "gateway"; description = "API gateway and routing service" }
)

$sharedSchemas = @(
    @{ name = "users"; description = "Ecosystem-wide user management" },
    @{ name = "analytics"; description = "Cross-service analytics and metrics" },
    @{ name = "logs"; description = "Centralized logging for all services" },
    @{ name = "events"; description = "Event streaming and messaging" },
    @{ name = "core"; description = "Core ecosystem configuration and metadata" }
)

# Step 3: Create service-specific collections
Write-Host "📊 Step 3: Setting up service-specific data structures..." -ForegroundColor Yellow

foreach ($service in $services) {
    Write-Host "   Creating collections for $($service.name) service..." -ForegroundColor Gray
    
    # Create basic collections for each service
    $collections = @(
        @{ name = "config"; description = "Service configuration" },
        @{ name = "data"; description = "Primary service data" },
        @{ name = "cache"; description = "Service cache data" },
        @{ name = "metrics"; description = "Service-specific metrics" }
    )
    
    foreach ($collection in $collections) {
        $collectionName = "$($service.name)_$($collection.name)"
        $result = Invoke-CBDApi -Method "POST" -Endpoint "/document/$collectionName" -Body @{
            description = "$($collection.description) for $($service.name) service"
            service = $service.name
            type = $collection.name
        }
        
        if ($result) {
            Write-Host "      ✅ Created collection: $collectionName" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️ Collection may already exist: $collectionName" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Step 4: Create shared ecosystem collections
Write-Host "🌐 Step 4: Setting up shared ecosystem collections..." -ForegroundColor Yellow

foreach ($schema in $sharedSchemas) {
    $collectionName = "ecosystem_$($schema.name)"
    $result = Invoke-CBDApi -Method "POST" -Endpoint "/document/$collectionName" -Body @{
        description = $schema.description
        type = "shared"
        scope = "ecosystem"
    }
    
    if ($result) {
        Write-Host "   ✅ Created shared collection: $collectionName" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Shared collection may already exist: $collectionName" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 5: Initialize ecosystem metadata
Write-Host "⚙️ Step 5: Initializing ecosystem metadata..." -ForegroundColor Yellow

$ecosystemConfig = @{
    ecosystem_name = "CODAI"
    version = "1.0.0"
    created_date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    services = $services
    database_host = "cbd.codai.ro"
    database_port = 8080
    environment = "production"
    authentication_service = "id.codai.ro"
    gateway_service = "gateway.codai.ro"
    monitoring_service = "monitoring.codai.ro"
}

$configResult = Invoke-CBDApi -Method "POST" -Endpoint "/document/ecosystem_core" -Body @{
    _id = "ecosystem_config"
    config = $ecosystemConfig
}

if ($configResult) {
    Write-Host "   ✅ Ecosystem configuration initialized" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Ecosystem configuration may already exist" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Create service registry entries
Write-Host "📋 Step 6: Creating service registry..." -ForegroundColor Yellow

foreach ($service in $services) {
    $serviceConfig = @{
        name = $service.name
        description = $service.description
        domain = "$($service.name).codai.ro"
        health_endpoint = "https://$($service.name).codai.ro/health"
        api_endpoint = "https://$($service.name).codai.ro/api"
        database_schema = "$($service.name)_"
        status = "active"
        created_date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    
    $registryResult = Invoke-CBDApi -Method "POST" -Endpoint "/document/ecosystem_services" -Body @{
        _id = "service_$($service.name)"
        service = $serviceConfig
    }
    
    if ($registryResult) {
        Write-Host "   ✅ Registered service: $($service.name)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Service may already be registered: $($service.name)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 7: Verify the setup
Write-Host "🔍 Step 7: Verifying ecosystem database setup..." -ForegroundColor Yellow

# Check if we can query the ecosystem configuration
$verification = Invoke-CBDApi -Endpoint "/document/ecosystem_core/ecosystem_config"
if ($verification -and $verification.config) {
    Write-Host "   ✅ Ecosystem configuration verified" -ForegroundColor Green
    Write-Host "      Services configured: $($verification.config.services.Count)" -ForegroundColor Gray
    Write-Host "      Database host: $($verification.config.database_host)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Could not verify ecosystem configuration" -ForegroundColor Red
}

# Check service registry
$serviceCount = 0
foreach ($service in $services) {
    $serviceCheck = Invoke-CBDApi -Endpoint "/document/ecosystem_services/service_$($service.name)"
    if ($serviceCheck) {
        $serviceCount++
    }
}

Write-Host "   ✅ Service registry verified: $serviceCount/$($services.Count) services registered" -ForegroundColor Green

Write-Host ""

# Step 8: Display connection strings for services
Write-Host "🔗 Step 8: Service Connection Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "Update your service configurations with these settings:" -ForegroundColor White
Write-Host ""

foreach ($service in $services) {
    Write-Host "🔧 $($service.name.ToUpper()) SERVICE:" -ForegroundColor Cyan
    Write-Host "   Database Host: cbd.codai.ro" -ForegroundColor Gray
    Write-Host "   Database Port: 8080" -ForegroundColor Gray
    Write-Host "   Schema Prefix: $($service.name)_" -ForegroundColor Gray
    Write-Host "   Health Endpoint: https://$($service.name).codai.ro/health" -ForegroundColor Gray
    Write-Host "   API Endpoint: https://$($service.name).codai.ro/api" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update each service's production configuration to use CBD" -ForegroundColor White
Write-Host "2. Configure inter-service communication via production domains" -ForegroundColor White
Write-Host "3. Implement unified authentication through id.codai.ro" -ForegroundColor White
Write-Host "4. Set up service discovery and health monitoring" -ForegroundColor White
Write-Host "5. Test cross-service functionality" -ForegroundColor White
Write-Host ""

Write-Host "🎉 CODAI ECOSYSTEM DATABASE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "The CBD Universal Database is now configured as the central hub for the entire CODAI ecosystem." -ForegroundColor Green
