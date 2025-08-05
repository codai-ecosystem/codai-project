# 🗄️ CODAI Ecosystem Database Setup - Corrected Version
# This script sets up the centralized ecosystem database structure in CBD Universal Database

param(
    [string]$CBDBaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"
$script:errorCount = 0

# Function to call CBD API correctly
function Invoke-CBDApi {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body
    )
    
    $uri = "$CBDBaseUrl$Endpoint"
    $bodyJson = $Body | ConvertTo-Json -Depth 10
    
    Write-Host "      📡 $Method $uri" -ForegroundColor DarkGray
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $bodyJson -ContentType "application/json" -TimeoutSec 30
        return $response
    }
    catch {
        Write-Host "      ❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:errorCount++
        throw
    }
}

Write-Host ""
Write-Host "🗄️ CODAI Ecosystem Database Setup (Corrected)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Test CBD Connection
Write-Host "🔍 Step 1: Testing CBD Universal Database connection..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-RestMethod -Uri "$CBDBaseUrl/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ CBD Database connected successfully" -ForegroundColor Green
    Write-Host "      Service: $($healthCheck.service)" -ForegroundColor Gray
    Write-Host "      Version: $($healthCheck.version)" -ForegroundColor Gray
    Write-Host "      Uptime: $($healthCheck.uptime)s" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Failed to connect to CBD Database at $CBDBaseUrl" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "      Please ensure CBD Universal Database is running on port 8080" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Create Ecosystem Database Structure
Write-Host "🏗️ Step 2: Creating CODAI Ecosystem Database Structure..." -ForegroundColor Yellow

# Define the ecosystem metadata
$ecosystemMetadata = @{
    collection = "ecosystem_metadata"
    document = @{
        ecosystem_id = "codai-ecosystem"
        name = "CODAI AI Platform Ecosystem"
        version = "1.0.0"
        created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        description = "Centralized metadata for the CODAI AI platform ecosystem"
        administrator = "CODAI Team"
        status = "active"
        configuration = @{
            centralized_database = $true
            service_discovery = $true
            unified_authentication = $true
            cross_service_analytics = $true
        }
    }
}

Write-Host "   Creating ecosystem metadata..." -ForegroundColor Cyan
try {
    $response = Invoke-CBDApi -Method "POST" -Endpoint "/document/" -Body $ecosystemMetadata
    Write-Host "   ✅ Ecosystem metadata created successfully" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Failed to create ecosystem metadata" -ForegroundColor Red
}

# Step 3: Create Service Registry
Write-Host ""
Write-Host "📋 Step 3: Creating Service Registry..." -ForegroundColor Yellow

$services = @{
    "memorai" = @{
        name = "MemorAI Service"
        type = "memory_ai"
        domain = "memorai.codai.ro"
        port = 4006
        description = "AI-powered memory management and context storage"
        capabilities = @("memory_management", "context_storage", "intelligent_recall", "agent_memory")
        status = "active"
        health_endpoint = "https://memorai.codai.ro/health"
    }
    "codai" = @{
        name = "CODAI Platform"
        type = "development_platform"
        domain = "codai.ro"
        port = 4001
        description = "Main AI development platform and code generation"
        capabilities = @("code_generation", "ai_assistance", "project_management", "development_tools")
        status = "active"
        health_endpoint = "https://codai.ro/health"
    }
    "romai" = @{
        name = "RomAI Intelligence"
        type = "romanian_ai"
        domain = "romai.codai.ro"
        port = 6100
        description = "Romanian language AI and market intelligence"
        capabilities = @("romanian_nlp", "market_intelligence", "regulatory_compliance", "business_analysis")
        status = "active"
        health_endpoint = "https://romai.codai.ro/health"
    }
    "bancai" = @{
        name = "BancAI FinTech"
        type = "fintech_platform"
        domain = "bancai.codai.ro"
        port = 4004
        description = "AI-powered financial services and banking"
        capabilities = @("financial_services", "payment_processing", "compliance_automation", "risk_analysis")
        status = "active"
        health_endpoint = "https://bancai.codai.ro/health"
    }
    "admin" = @{
        name = "Admin Dashboard"
        type = "admin_platform"
        domain = "admin.codai.ro"
        port = 4002
        description = "Administrative dashboard and system management"
        capabilities = @("system_administration", "user_management", "monitoring", "configuration")
        status = "active"
        health_endpoint = "https://admin.codai.ro/health"
    }
    "hub" = @{
        name = "CODAI Hub"
        type = "integration_hub"
        domain = "hub.codai.ro"
        port = 4003
        description = "Service integration and orchestration hub"
        capabilities = @("service_integration", "data_aggregation", "workflow_orchestration", "api_gateway")
        status = "active"
        health_endpoint = "https://hub.codai.ro/health"
    }
    "control" = @{
        name = "ControlAI"
        type = "project_management"
        domain = "control.codai.ro"
        port = 4005
        description = "AI-powered project and task management"
        capabilities = @("project_management", "task_automation", "resource_allocation", "timeline_optimization")
        status = "active"
        health_endpoint = "https://control.codai.ro/health"
    }
    "id" = @{
        name = "ID Service"
        type = "identity_management"
        domain = "id.codai.ro"
        port = 4007
        description = "Identity management and authentication service"
        capabilities = @("authentication", "authorization", "user_identity", "security_tokens")
        status = "active"
        health_endpoint = "https://id.codai.ro/health"
    }
    "apps" = @{
        name = "Applications Portal"
        type = "app_marketplace"
        domain = "apps.codai.ro"
        port = 4008
        description = "Application marketplace and management portal"
        capabilities = @("app_deployment", "marketplace", "application_management", "service_catalog")
        status = "active"
        health_endpoint = "https://apps.codai.ro/health"
    }
    "gateway" = @{
        name = "API Gateway"
        type = "api_gateway"
        domain = "api.codai.ro"
        port = 3000
        description = "API gateway and routing service"
        capabilities = @("api_routing", "load_balancing", "rate_limiting", "authentication_proxy")
        status = "active"
        health_endpoint = "https://api.codai.ro/health"
    }
}

foreach ($serviceId in $services.Keys) {
    $serviceData = $services[$serviceId]
    
    Write-Host "   Registering service: $serviceId..." -ForegroundColor Cyan
    
    $serviceDocument = @{
        collection = "service_registry"
        document = @{
            service_id = $serviceId
            metadata = $serviceData
            registered_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            last_updated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            ecosystem = "codai-ecosystem"
        }
    }
    
    try {
        $response = Invoke-CBDApi -Method "POST" -Endpoint "/document/" -Body $serviceDocument
        Write-Host "      ✅ Service $serviceId registered successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "      ❌ Failed to register service $serviceId" -ForegroundColor Red
    }
}

# Step 4: Create Communication Matrix
Write-Host ""
Write-Host "🔗 Step 4: Creating Service Communication Matrix..." -ForegroundColor Yellow

$communicationRules = @(
    @{ from = "memorai"; to = "codai"; type = "memory_context"; protocol = "https" },
    @{ from = "codai"; to = "memorai"; type = "store_context"; protocol = "https" },
    @{ from = "romai"; to = "memorai"; type = "romanian_context"; protocol = "https" },
    @{ from = "bancai"; to = "id"; type = "authentication"; protocol = "https" },
    @{ from = "admin"; to = "*"; type = "monitoring"; protocol = "https" },
    @{ from = "hub"; to = "*"; type = "orchestration"; protocol = "https" },
    @{ from = "control"; to = "*"; type = "project_coordination"; protocol = "https" },
    @{ from = "gateway"; to = "*"; type = "api_proxy"; protocol = "https" },
    @{ from = "*"; to = "id"; type = "authentication"; protocol = "https" },
    @{ from = "*"; to = "gateway"; type = "api_access"; protocol = "https" }
)

foreach ($rule in $communicationRules) {
    Write-Host "   Creating communication rule: $($rule.from) → $($rule.to)" -ForegroundColor Cyan
    
    $ruleDocument = @{
        collection = "communication_matrix"
        document = @{
            rule_id = "$($rule.from)_to_$($rule.to)_$($rule.type)"
            from_service = $rule.from
            to_service = $rule.to
            communication_type = $rule.type
            protocol = $rule.protocol
            status = "active"
            created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    }
    
    try {
        $response = Invoke-CBDApi -Method "POST" -Endpoint "/document/" -Body $ruleDocument
        Write-Host "      ✅ Communication rule created successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "      ❌ Failed to create communication rule" -ForegroundColor Red
    }
}

# Step 5: Create Database Schema Mapping
Write-Host ""
Write-Host "🗂️ Step 5: Creating Database Schema Mapping..." -ForegroundColor Yellow

$databaseSchemas = @{
    "ecosystem_users" = @{
        description = "Unified user accounts across all services"
        service_owner = "id"
        data_type = "user_profile"
        retention_policy = "permanent"
        access_level = "restricted"
    }
    "ecosystem_sessions" = @{
        description = "Cross-service authentication sessions"
        service_owner = "id"
        data_type = "session_data"
        retention_policy = "30_days"
        access_level = "restricted"
    }
    "ecosystem_analytics" = @{
        description = "Cross-service analytics and metrics"
        service_owner = "admin"
        data_type = "analytics_data"
        retention_policy = "1_year"
        access_level = "admin_only"
    }
    "ecosystem_logs" = @{
        description = "Centralized logging for all services"
        service_owner = "admin"
        data_type = "log_data"
        retention_policy = "90_days"
        access_level = "admin_only"
    }
    "ecosystem_events" = @{
        description = "Event streaming and inter-service messaging"
        service_owner = "hub"
        data_type = "event_data"
        retention_policy = "7_days"
        access_level = "service_only"
    }
}

foreach ($schemaName in $databaseSchemas.Keys) {
    $schemaData = $databaseSchemas[$schemaName]
    
    Write-Host "   Creating database schema: $schemaName..." -ForegroundColor Cyan
    
    $schemaDocument = @{
        collection = "database_schemas"
        document = @{
            schema_name = $schemaName
            metadata = $schemaData
            created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            ecosystem = "codai-ecosystem"
        }
    }
    
    try {
        $response = Invoke-CBDApi -Method "POST" -Endpoint "/document/" -Body $schemaDocument
        Write-Host "      ✅ Database schema $schemaName created successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "      ❌ Failed to create database schema $schemaName" -ForegroundColor Red
    }
}

# Step 6: Verification
Write-Host ""
Write-Host "🔍 Step 6: Verifying Ecosystem Setup..." -ForegroundColor Yellow

$collections = @("ecosystem_metadata", "service_registry", "communication_matrix", "database_schemas")

foreach ($collection in $collections) {
    Write-Host "   Verifying collection: $collection..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$CBDBaseUrl/document/$collection" -Method GET -TimeoutSec 10
        if ($response.success -and $response.result) {
            $count = $response.result.Count
            Write-Host "      ✅ Collection $collection verified: $count documents" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️ Collection $collection exists but may be empty" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "      ❌ Failed to verify collection $collection" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "📊 Setup Summary" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

if ($script:errorCount -eq 0) {
    Write-Host "✅ Ecosystem database setup completed successfully!" -ForegroundColor Green
    Write-Host "   • Ecosystem metadata created" -ForegroundColor Gray
    Write-Host "   • $($services.Count) services registered" -ForegroundColor Gray
    Write-Host "   • $($communicationRules.Count) communication rules created" -ForegroundColor Gray
    Write-Host "   • $($databaseSchemas.Count) database schemas defined" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 The CODAI ecosystem is now ready for integrated operations!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Setup completed with $script:errorCount errors" -ForegroundColor Yellow
    Write-Host "   Please review the errors above and retry if necessary" -ForegroundColor Gray
}

Write-Host ""
