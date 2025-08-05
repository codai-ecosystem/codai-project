# Phase 4.4.2: Service Instrumentation Implementation

Write-Host "🔧 Phase 4.4.2: Service Instrumentation & Monitoring Deployment" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Gray

$ErrorActionPreference = "Stop"
$WorkspaceRoot = "E:\GitHub\codai-project"

function Deploy-MonitoringStack {
    Write-Host "🚀 Deploying production monitoring stack..." -ForegroundColor Yellow
    
    try {
        # Check if Docker networks exist and create if needed
        $Networks = docker network ls --format "{{.Name}}"
        if ($Networks -notcontains "codai-backend") {
            Write-Host "Creating codai-backend network..." -ForegroundColor Gray
            docker network create codai-backend
        }
        
        # Deploy monitoring stack
        Push-Location "$WorkspaceRoot\monitoring"
        
        Write-Host "Starting monitoring services..." -ForegroundColor Gray
        docker-compose -f docker-compose.monitoring.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Monitoring stack deployed successfully" -ForegroundColor Green
            
            # Wait for services to start
            Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            # Check service health
            $Services = @(
                @{ Name = "Prometheus"; Port = 9090; Path = "/api/v1/status/config" },
                @{ Name = "Grafana"; Port = 3001; Path = "/api/health" },
                @{ Name = "AlertManager"; Port = 9093; Path = "/api/v1/status" },
                @{ Name = "Elasticsearch"; Port = 9200; Path = "/_cluster/health" }
            )
            
            $HealthResults = @()
            foreach ($Service in $Services) {
                try {
                    $Response = Invoke-RestMethod -Uri "http://localhost:$($Service.Port)$($Service.Path)" -Method Get -TimeoutSec 10
                    $HealthResults += @{ Service = $Service.Name; Status = "✅ Healthy"; Response = $Response }
                    Write-Host "✅ $($Service.Name) is healthy" -ForegroundColor Green
                } catch {
                    $HealthResults += @{ Service = $Service.Name; Status = "❌ Unhealthy"; Error = $_.Exception.Message }
                    Write-Host "❌ $($Service.Name) health check failed: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            
            return $HealthResults
        } else {
            Write-Host "❌ Failed to deploy monitoring stack" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error deploying monitoring stack: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Configure-ServiceInstrumentation {
    Write-Host "📊 Configuring service instrumentation..." -ForegroundColor Yellow
    
    # CBD Database Instrumentation
    $CbdInstrumentation = @"
const PerformanceMonitor = require('../../performance/performance-monitor.js');
const promClient = require('prom-client');

class CBDInstrumentation {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics() {
    // Database operation metrics
    this.dbOperations = new promClient.Counter({
      name: 'cbd_operations_total',
      help: 'Total database operations',
      labelNames: ['operation', 'collection', 'status']
    });
    
    this.queryDuration = new promClient.Histogram({
      name: 'cbd_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
    });
    
    this.activeConnections = new promClient.Gauge({
      name: 'cbd_active_connections',
      help: 'Number of active database connections'
    });
    
    this.cacheHitRate = new promClient.Gauge({
      name: 'cbd_cache_hit_rate',
      help: 'Cache hit rate percentage'
    });
    
    // Register metrics
    promClient.register.registerMetric(this.dbOperations);
    promClient.register.registerMetric(this.queryDuration);
    promClient.register.registerMetric(this.activeConnections);
    promClient.register.registerMetric(this.cacheHitRate);
  }
  
  recordOperation(operation, collection, duration, status = 'success') {
    this.dbOperations.labels(operation, collection, status).inc();
    this.queryDuration.labels(operation, collection).observe(duration / 1000);
  }
  
  updateActiveConnections(count) {
    this.activeConnections.set(count);
  }
  
  updateCacheHitRate(rate) {
    this.cacheHitRate.set(rate * 100);
  }
  
  getMiddleware() {
    return this.performanceMonitor.middleware();
  }
  
  getMetrics() {
    return promClient.register.metrics();
  }
}

module.exports = CBDInstrumentation;
"@

    Set-Content -Path "$WorkspaceRoot\packages\cbd\src\instrumentation.js" -Value $CbdInstrumentation

    # Gateway Service Instrumentation
    $GatewayInstrumentation = @"
const PerformanceMonitor = require('../../performance/performance-monitor.js');
const promClient = require('prom-client');

class GatewayInstrumentation {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics() {
    // Request metrics
    this.requestsTotal = new promClient.Counter({
      name: 'gateway_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status']
    });
    
    this.requestDuration = new promClient.Histogram({
      name: 'gateway_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    });
    
    this.concurrentRequests = new promClient.Gauge({
      name: 'gateway_concurrent_requests',
      help: 'Number of concurrent requests'
    });
    
    this.rateLimitHits = new promClient.Counter({
      name: 'gateway_rate_limit_hits_total',
      help: 'Total rate limit hits',
      labelNames: ['endpoint', 'user_type']
    });
    
    // Register metrics
    promClient.register.registerMetric(this.requestsTotal);
    promClient.register.registerMetric(this.requestDuration);
    promClient.register.registerMetric(this.concurrentRequests);
    promClient.register.registerMetric(this.rateLimitHits);
  }
  
  getMiddleware() {
    let currentRequests = 0;
    
    return (req, res, next) => {
      const start = Date.now();
      currentRequests++;
      this.concurrentRequests.set(currentRequests);
      
      // Apply performance monitoring
      this.performanceMonitor.middleware()(req, res, () => {});
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        this.requestsTotal.labels(req.method, route, res.statusCode).inc();
        this.requestDuration.labels(req.method, route).observe(duration);
        
        currentRequests--;
        this.concurrentRequests.set(currentRequests);
      });
      
      next();
    };
  }
  
  recordRateLimitHit(endpoint, userType) {
    this.rateLimitHits.labels(endpoint, userType).inc();
  }
  
  getMetrics() {
    return promClient.register.metrics();
  }
}

module.exports = GatewayInstrumentation;
"@

    Set-Content -Path "$WorkspaceRoot\apps\gateway\src\instrumentation.js" -Value $GatewayInstrumentation

    # MemorAI MCP Instrumentation
    $MemoraiInstrumentation = @"
const PerformanceMonitor = require('../../performance/performance-monitor.js');
const promClient = require('prom-client');

class MemorAIInstrumentation {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCustomMetrics();
  }
  
  setupCustomMetrics() {
    // Memory operation metrics
    this.memoryOperations = new promClient.Counter({
      name: 'memorai_operations_total',
      help: 'Total memory operations',
      labelNames: ['operation', 'agent', 'status']
    });
    
    this.memorySize = new promClient.Gauge({
      name: 'memorai_memory_size_bytes',
      help: 'Total memory size in bytes',
      labelNames: ['agent']
    });
    
    this.vectorSearchDuration = new promClient.Histogram({
      name: 'memorai_vector_search_duration_seconds',
      help: 'Vector search duration in seconds',
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
    });
    
    this.activeAgents = new promClient.Gauge({
      name: 'memorai_active_agents',
      help: 'Number of active agents'
    });
    
    // Register metrics
    promClient.register.registerMetric(this.memoryOperations);
    promClient.register.registerMetric(this.memorySize);
    promClient.register.registerMetric(this.vectorSearchDuration);
    promClient.register.registerMetric(this.activeAgents);
  }
  
  recordMemoryOperation(operation, agent, duration, status = 'success') {
    this.memoryOperations.labels(operation, agent, status).inc();
    
    if (operation === 'search' || operation === 'recall') {
      this.vectorSearchDuration.observe(duration / 1000);
    }
  }
  
  updateMemorySize(agent, size) {
    this.memorySize.labels(agent).set(size);
  }
  
  updateActiveAgents(count) {
    this.activeAgents.set(count);
  }
  
  getMetrics() {
    return promClient.register.metrics();
  }
}

module.exports = MemorAIInstrumentation;
"@

    Set-Content -Path "$WorkspaceRoot\packages\memorai-mcp\src\instrumentation.js" -Value $MemoraiInstrumentation

    Write-Host "✅ Service instrumentation configured" -ForegroundColor Green
    return $true
}

function Setup-GrafanaProvisioning {
    Write-Host "📊 Setting up Grafana provisioning..." -ForegroundColor Yellow
    
    # Datasource configuration
    $DatasourceConfig = @"
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    access: proxy
    isDefault: true
    editable: true
    
  - name: Elasticsearch
    type: elasticsearch
    url: http://elasticsearch:9200
    access: proxy
    database: "codai-logs-*"
    interval: "Daily"
    timeField: "@timestamp"
    editable: true
    
  - name: Redis
    type: redis-datasource
    url: redis:6379
    access: proxy
    editable: true
"@

    New-Item -ItemType Directory -Force -Path "$WorkspaceRoot\monitoring\grafana\provisioning\datasources" | Out-Null
    Set-Content -Path "$WorkspaceRoot\monitoring\grafana\provisioning\datasources\datasources.yml" -Value $DatasourceConfig

    # Dashboard provisioning
    $DashboardProvisioning = @"
apiVersion: 1

providers:
  - name: 'CODAI Dashboards'
    orgId: 1
    folder: 'CODAI Ecosystem'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
"@

    New-Item -ItemType Directory -Force -Path "$WorkspaceRoot\monitoring\grafana\provisioning\dashboards" | Out-Null
    Set-Content -Path "$WorkspaceRoot\monitoring\grafana\provisioning\dashboards\dashboards.yml" -Value $DashboardProvisioning

    Write-Host "✅ Grafana provisioning configured" -ForegroundColor Green
    return $true
}

function Validate-MonitoringDeployment {
    Write-Host "🔍 Validating monitoring deployment..." -ForegroundColor Yellow
    
    $ValidationResults = @()
    
    # Check container status
    $Containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "codai-"
    
    foreach ($Container in $Containers) {
        $Parts = $Container.Line -split "`t"
        $Name = $Parts[0]
        $Status = $Parts[1]
        $Ports = $Parts[2]
        
        $IsHealthy = $Status -match "Up"
        $ValidationResults += @{
            Container = $Name
            Status = if ($IsHealthy) { "✅ Running" } else { "❌ Failed" }
            Details = $Status
            Ports = $Ports
        }
    }
    
    # Test monitoring endpoints
    $Endpoints = @(
        @{ Name = "Prometheus"; URL = "http://localhost:9090/api/v1/targets" },
        @{ Name = "Grafana"; URL = "http://localhost:3001/api/health" },
        @{ Name = "AlertManager"; URL = "http://localhost:9093/api/v1/alerts" },
        @{ Name = "Elasticsearch"; URL = "http://localhost:9200/_cat/health" }
    )
    
    foreach ($Endpoint in $Endpoints) {
        try {
            $Response = Invoke-RestMethod -Uri $Endpoint.URL -Method Get -TimeoutSec 5
            $ValidationResults += @{
                Endpoint = $Endpoint.Name
                Status = "✅ Responding"
                Response = $Response
            }
        } catch {
            $ValidationResults += @{
                Endpoint = $Endpoint.Name
                Status = "❌ Failed"
                Error = $_.Exception.Message
            }
        }
    }
    
    return $ValidationResults
}

function Main {
    Write-Host "🚀 Starting Phase 4.4.2 Service Instrumentation..." -ForegroundColor White
    
    $PhaseResults = @{
        MonitoringDeployment = $false
        ServiceInstrumentation = $false
        GrafanaProvisioning = $false
        ValidationComplete = $false
    }
    
    try {
        # Deploy monitoring stack
        Write-Host "`n📦 Step 1: Monitoring Stack Deployment" -ForegroundColor Magenta
        $DeployResult = Deploy-MonitoringStack
        $PhaseResults.MonitoringDeployment = $DeployResult -ne $false
        
        # Configure service instrumentation
        Write-Host "`n🔧 Step 2: Service Instrumentation" -ForegroundColor Magenta
        $PhaseResults.ServiceInstrumentation = Configure-ServiceInstrumentation
        
        # Setup Grafana provisioning
        Write-Host "`n📊 Step 3: Grafana Provisioning" -ForegroundColor Magenta
        $PhaseResults.GrafanaProvisioning = Setup-GrafanaProvisioning
        
        # Validate deployment
        Write-Host "`n✅ Step 4: Deployment Validation" -ForegroundColor Magenta
        $ValidationResults = Validate-MonitoringDeployment
        $PhaseResults.ValidationComplete = $true
        
        # Display results
        Write-Host "`n🎯 Phase 4.4.2 Results Summary" -ForegroundColor Cyan
        Write-Host "==============================" -ForegroundColor Gray
        
        foreach ($Key in $PhaseResults.Keys) {
            $Status = if ($PhaseResults[$Key]) { "✅ SUCCESS" } else { "❌ FAILED" }
            Write-Host "$($Key.PadRight(25)) | $Status" -ForegroundColor White
        }
        
        # Display validation results
        Write-Host "`n📊 Monitoring Services Status:" -ForegroundColor Cyan
        foreach ($Result in $ValidationResults) {
            if ($Result.Container) {
                Write-Host "$($Result.Container.PadRight(20)) | $($Result.Status)" -ForegroundColor White
            } elseif ($Result.Endpoint) {
                Write-Host "$($Result.Endpoint.PadRight(20)) | $($Result.Status)" -ForegroundColor White
            }
        }
        
        $SuccessCount = ($PhaseResults.Values | Where-Object { $_ -eq $true }).Count
        $TotalCount = $PhaseResults.Count
        
        Write-Host "`n📈 Phase 4.4.2 Success Rate: $SuccessCount/$TotalCount" -ForegroundColor Cyan
        
        if ($SuccessCount -eq $TotalCount) {
            Write-Host "`n🎉 Phase 4.4.2 Service Instrumentation Complete!" -ForegroundColor Green
            Write-Host "`nMonitoring URLs:" -ForegroundColor Yellow
            Write-Host "📊 Grafana Dashboard: http://localhost:3001 (admin/codai-admin-2025)" -ForegroundColor White
            Write-Host "🔍 Prometheus: http://localhost:9090" -ForegroundColor White
            Write-Host "🚨 AlertManager: http://localhost:9093" -ForegroundColor White
            Write-Host "📈 Elasticsearch: http://localhost:9200" -ForegroundColor White
            Write-Host "📋 Kibana: http://localhost:5601" -ForegroundColor White
            
            Write-Host "`nNext Phase: 4.4.3 - Cost Optimization & Resource Management" -ForegroundColor Yellow
            
            exit 0
        } else {
            Write-Host "`n⚠️ Some components failed. Please review the results above." -ForegroundColor Yellow
            exit 1
        }
        
    } catch {
        Write-Host "`n❌ Error during Phase 4.4.2: $_" -ForegroundColor Red
        exit 1
    }
}

# Execute the main function
Main
