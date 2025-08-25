#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Monitoring & Observability Setup
# Microsoft Azure ML Production Standards Compliance
# ==============================================================================

param(
    [ValidateSet("setup", "start", "stop", "status", "validate")]
    [string]$Action = "setup",
    [string]$Environment = "production",
    [switch]$SkipDocker = $false
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput {
    param($Message, $Color = "White")
    if ($Color -eq "Green") { Write-Host $Message -ForegroundColor Green }
    elseif ($Color -eq "Red") { Write-Host $Message -ForegroundColor Red }
    elseif ($Color -eq "Yellow") { Write-Host $Message -ForegroundColor Yellow }
    elseif ($Color -eq "Cyan") { Write-Host $Message -ForegroundColor Cyan }
    else { Write-Host $Message }
}

function Test-ServiceHealth {
    param($ServiceName, $Url, $Timeout = 10)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $Timeout
        return @{ Status = "Healthy"; Response = $response }
    }
    catch {
        return @{ Status = "Unhealthy"; Error = $_.Exception.Message }
    }
}

Write-ColorOutput "📊 RomAI AGI Monitoring & Observability Setup" "Cyan"
Write-ColorOutput "Action: $Action | Environment: $Environment" "Yellow"
Write-ColorOutput "Microsoft Azure ML Standards Compliance" "Yellow"
Write-Host ""

switch ($Action) {
    "setup" {
        Write-ColorOutput "🔧 Setting up comprehensive monitoring infrastructure..." "Cyan"
        
        # 1. Create monitoring configuration for AGI-specific metrics
        Write-ColorOutput "📝 Creating AGI-specific Prometheus configuration..." "Yellow"
        
        $agiPrometheusConfig = @"
# RomAI AGI Production Monitoring - Microsoft Azure ML Standards
# Specialized configuration for AI/ML model performance tracking

global:
  scrape_interval: 15s
  evaluation_interval: 30s
  external_labels:
    cluster: 'romai-agi-production'
    environment: '$Environment'
    service_type: 'ai-ml-inference'

rule_files:
  - "agi_alert_rules.yml"
  - "performance_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # AGI Model Server - Core metrics (Microsoft best practice: 15s interval)
  - job_name: 'romai-agi-inference'
    scrape_interval: 15s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:6101']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'agi-production-server'
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'agi_(inference|training|performance).*'
        target_label: __tmp_agi_metric
        replacement: 'agi_core'

  # AGI Health Monitoring - Enhanced health checks
  - job_name: 'romai-agi-health'
    scrape_interval: 30s
    metrics_path: '/health'
    static_configs:
      - targets: ['localhost:6101']
    scrape_timeout: 10s

  # AGI Training Systems Metrics - All 14 systems
  - job_name: 'romai-agi-training-systems'
    scrape_interval: 60s
    metrics_path: '/training/metrics'
    static_configs:
      - targets: ['localhost:6101']
    params:
      systems: ['mathematical_reasoning', 'autonomous_problem_solving', 'meta_learning', 
                'real_time_learning', 'code_generation', 'rlhf_training', 
                'constitutional_ai', 'multimodal_training', 'synthetic_data_generation',
                'advanced_training_methodologies', 'romanian_language_specialization',
                'consciousness_processing', 'quantum_computing']

  # AGI Capability Scores - Performance tracking
  - job_name: 'romai-agi-capabilities'
    scrape_interval: 120s
    metrics_path: '/capabilities/scores'
    static_configs:
      - targets: ['localhost:6101']

  # Romanian Language Processing Metrics
  - job_name: 'romai-romanian-processing'
    scrape_interval: 60s
    metrics_path: '/romanian/metrics'
    static_configs:
      - targets: ['localhost:6101']

  # System Resource Monitoring
  - job_name: 'node-exporter'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:9100']

  # Memory & Cache Performance
  - job_name: 'memory-cache-metrics'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:4950']  # MemorAI MCP Server

  # Self-monitoring
  - job_name: 'prometheus'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:9090']
"@

        # Save AGI Prometheus config
        $configPath = "e:\GitHub\codai-project\monitoring\prometheus-agi-production.yml"
        $agiPrometheusConfig | Out-File -FilePath $configPath -Encoding UTF8
        Write-ColorOutput "✅ AGI Prometheus config saved: $configPath" "Green"

        # 2. Create AGI-specific alert rules (Microsoft Azure ML standards)
        Write-ColorOutput "📝 Creating AGI alert rules..." "Yellow"
        
        $agiAlertRules = @"
# RomAI AGI Alert Rules - Microsoft Azure ML Production Standards
# Performance and reliability monitoring for AI/ML systems

groups:
  - name: agi_model_performance
    rules:
      # Model Performance Alerts
      - alert: AGIModelResponseTimeHigh
        expr: agi_inference_response_time_seconds > 5.0
        for: 2m
        labels:
          severity: warning
          component: agi-inference
        annotations:
          summary: "AGI model response time is high"
          description: "AGI inference response time has been above 5 seconds for more than 2 minutes"

      - alert: AGIModelErrorRateHigh
        expr: (rate(agi_inference_errors_total[5m]) / rate(agi_inference_requests_total[5m])) > 0.05
        for: 1m
        labels:
          severity: critical
          component: agi-inference
        annotations:
          summary: "AGI model error rate is high"
          description: "AGI model error rate is above 5% for the last 5 minutes"

      # Training System Health
      - alert: AGITrainingSystemDown
        expr: agi_training_system_status == 0
        for: 1m
        labels:
          severity: critical
          component: agi-training
        annotations:
          summary: "AGI training system is down"
          description: "One or more AGI training systems are not responding"

      # Romanian Language Processing
      - alert: RomanianProcessingDegraded
        expr: romanian_processing_accuracy < 0.85
        for: 5m
        labels:
          severity: warning
          component: romanian-processing
        annotations:
          summary: "Romanian language processing accuracy degraded"
          description: "Romanian processing accuracy has dropped below 85%"

      # Resource Utilization
      - alert: AGIMemoryUsageHigh
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.85
        for: 2m
        labels:
          severity: warning
          component: system-resources
        annotations:
          summary: "High memory usage on AGI server"
          description: "Memory usage is above 85%"

      - alert: AGICPUUsageHigh
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          component: system-resources
        annotations:
          summary: "High CPU usage on AGI server"
          description: "CPU usage is above 80% for more than 5 minutes"

  - name: agi_availability
    rules:
      # Service Availability
      - alert: AGIServiceDown
        expr: up{job="romai-agi-inference"} == 0
        for: 1m
        labels:
          severity: critical
          component: agi-service
        annotations:
          summary: "AGI service is down"
          description: "AGI inference service is not responding"

      - alert: AGIHealthCheckFailing
        expr: agi_health_check_status == 0
        for: 2m
        labels:
          severity: critical
          component: agi-health
        annotations:
          summary: "AGI health check is failing"
          description: "AGI service health check has been failing for more than 2 minutes"
"@

        $alertRulesPath = "e:\GitHub\codai-project\monitoring\agi_alert_rules.yml"
        $agiAlertRules | Out-File -FilePath $alertRulesPath -Encoding UTF8
        Write-ColorOutput "✅ AGI alert rules saved: $alertRulesPath" "Green"

        # 3. Create Grafana dashboard configuration for AGI monitoring
        Write-ColorOutput "📝 Creating AGI Grafana dashboard..." "Yellow"
        
        $agiDashboard = @"
{
  "dashboard": {
    "id": null,
    "title": "RomAI AGI Production Monitoring",
    "tags": ["agi", "romai", "production", "ml"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "AGI Model Performance",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(agi_inference_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 80},
                {"color": "red", "value": 100}
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "AGI Training Systems Status",
        "type": "heatmap",
        "targets": [
          {
            "expr": "agi_training_system_status",
            "legendFormat": "{{system}}"
          }
        ]
      },
      {
        "id": 3,
        "title": "Romanian Language Processing Accuracy",
        "type": "timeseries",
        "targets": [
          {
            "expr": "romanian_processing_accuracy",
            "legendFormat": "Accuracy"
          }
        ]
      },
      {
        "id": 4,
        "title": "System Resources",
        "type": "timeseries",
        "targets": [
          {
            "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          },
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
"@

        $dashboardPath = "e:\GitHub\codai-project\monitoring\dashboards\romai-agi-production-dashboard.json"
        $agiDashboard | Out-File -FilePath $dashboardPath -Encoding UTF8
        Write-ColorOutput "✅ AGI Grafana dashboard saved: $dashboardPath" "Green"

        # 4. Create monitoring validation script
        Write-ColorOutput "📝 Creating monitoring validation script..." "Yellow"
        
        $validationScript = @"
#!/usr/bin/env pwsh
# AGI Monitoring Validation Script

`$services = @(
    @{ Name = "Prometheus"; URL = "http://localhost:9090/api/v1/query?query=up"; Port = 9090 },
    @{ Name = "Grafana"; URL = "http://localhost:3002/api/health"; Port = 3002 },
    @{ Name = "AlertManager"; URL = "http://localhost:9093/api/v1/status"; Port = 9093 },
    @{ Name = "AGI Model Server"; URL = "http://localhost:6101/health"; Port = 6101 },
    @{ Name = "Node Exporter"; URL = "http://localhost:9100/metrics"; Port = 9100 }
)

`$healthyCount = 0
foreach (`$service in `$services) {
    Write-Host "Checking `$(`$service.Name)..." -NoNewline
    try {
        `$response = Invoke-RestMethod -Uri `$service.URL -Method Get -TimeoutSec 5
        Write-Host " ✅ Healthy" -ForegroundColor Green
        `$healthyCount++
    }
    catch {
        Write-Host " ❌ Unhealthy" -ForegroundColor Red
    }
}

`$healthPercentage = (`$healthyCount / `$services.Count) * 100
Write-Host "`nMonitoring Health: `$([math]::Round(`$healthPercentage, 1))% (`$healthyCount/`$(`$services.Count) services)" -ForegroundColor $(if (`$healthPercentage -ge 80) { "Green" } else { "Red" })
"@

        $validationPath = "e:\GitHub\codai-project\monitoring\validate-monitoring.ps1"
        $validationScript | Out-File -FilePath $validationPath -Encoding UTF8
        Write-ColorOutput "✅ Monitoring validation script saved: $validationPath" "Green"

        Write-ColorOutput "`n🎯 Monitoring Setup Complete!" "Green"
        Write-ColorOutput "📊 Next steps:" "Cyan"
        Write-ColorOutput "  1. Run: ./monitoring-setup.ps1 -Action start" "White"
        Write-ColorOutput "  2. Access Grafana: http://localhost:3002 (admin/codai-admin-2025)" "White"
        Write-ColorOutput "  3. Access Prometheus: http://localhost:9090" "White"
        Write-ColorOutput "  4. Run: ./monitoring-setup.ps1 -Action validate" "White"
    }

    "start" {
        Write-ColorOutput "🚀 Starting monitoring services..." "Cyan"
        
        if (-not $SkipDocker) {
            # Start monitoring stack using Docker Compose
            $monitoringPath = "e:\GitHub\codai-project\monitoring"
            
            Write-ColorOutput "🐳 Starting Docker monitoring stack..." "Yellow"
            try {
                Push-Location $monitoringPath
                $result = docker-compose -f docker-compose.monitoring.yml up -d 2>&1
                Pop-Location
                
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "✅ Monitoring stack started successfully" "Green"
                }
                else {
                    Write-ColorOutput "⚠️ Monitoring stack startup had issues: $result" "Yellow"
                }
            }
            catch {
                Pop-Location
                Write-ColorOutput "❌ Failed to start monitoring stack: $($_.Exception.Message)" "Red"
            }
        }
        
        # Wait for services to be ready
        Write-ColorOutput "⏳ Waiting for services to be ready..." "Yellow"
        Start-Sleep -Seconds 30
        
        # Validate service health
        $services = @(
            @{ Name = "AGI Model Server"; URL = "http://localhost:6101/health" },
            @{ Name = "MemorAI MCP"; URL = "http://localhost:4950/health" }
        )
        
        foreach ($service in $services) {
            Write-Host "Checking $($service.Name)..." -NoNewline
            $health = Test-ServiceHealth -ServiceName $service.Name -Url $service.URL
            if ($health.Status -eq "Healthy") {
                Write-ColorOutput " ✅ Running" "Green"
            }
            else {
                Write-ColorOutput " ❌ Not available" "Red"
            }
        }
    }

    "status" {
        Write-ColorOutput "📊 Monitoring Services Status" "Cyan"
        
        $services = @(
            @{ Name = "Prometheus"; URL = "http://localhost:9090/api/v1/query?query=up" },
            @{ Name = "Grafana"; URL = "http://localhost:3002/api/health" },
            @{ Name = "AlertManager"; URL = "http://localhost:9093/api/v1/status" },
            @{ Name = "AGI Model Server"; URL = "http://localhost:6101/health" },
            @{ Name = "MemorAI MCP"; URL = "http://localhost:4950/health" }
        )
        
        $healthyCount = 0
        foreach ($service in $services) {
            Write-Host "$($service.Name)..." -NoNewline
            $health = Test-ServiceHealth -ServiceName $service.Name -Url $service.URL
            if ($health.Status -eq "Healthy") {
                Write-ColorOutput " ✅ RUNNING" "Green"
                $healthyCount++
            }
            else {
                Write-ColorOutput " ❌ STOPPED" "Red"
            }
        }
        
        $healthPercentage = ($healthyCount / $services.Count) * 100
        Write-Host ""
        Write-ColorOutput "📈 Monitoring Health: $([math]::Round($healthPercentage, 1))% ($healthyCount/$($services.Count) services)" $(if ($healthPercentage -ge 80) { "Green" } elseif ($healthPercentage -ge 60) { "Yellow" } else { "Red" })
    }

    "validate" {
        Write-ColorOutput "🔍 Validating monitoring configuration..." "Cyan"
        
        # Test AGI model server metrics endpoint
        Write-Host "Testing AGI metrics endpoint..." -NoNewline
        try {
            $metrics = Invoke-RestMethod -Uri "http://localhost:6101/metrics" -Method Get -TimeoutSec 10
            Write-ColorOutput " ✅ Available" "Green"
        }
        catch {
            Write-ColorOutput " ❌ Not available" "Red"
        }
        
        # Test key AGI capabilities
        Write-Host "Testing AGI capabilities..." -NoNewline
        try {
            $capabilities = Invoke-RestMethod -Uri "http://localhost:6101/capabilities/scores" -Method Get -TimeoutSec 10
            Write-ColorOutput " ✅ Responding" "Green"
        }
        catch {
            Write-ColorOutput " ❌ Not responding" "Red"
        }
        
        # Test Romanian language processing
        Write-Host "Testing Romanian processing..." -NoNewline
        try {
            $payload = @{ text = "Testare funcționalitate română" } | ConvertTo-Json
            $romanian = Invoke-RestMethod -Uri "http://localhost:6101/romanian/analyze_text" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 10
            Write-ColorOutput " ✅ Functional" "Green"
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 422) {
                Write-ColorOutput " 🔄 Endpoint exists" "Yellow"
            }
            else {
                Write-ColorOutput " ❌ Error" "Red"
            }
        }
        
        Write-ColorOutput "`n✅ Monitoring validation completed" "Green"
    }

    "stop" {
        Write-ColorOutput "🛑 Stopping monitoring services..." "Cyan"
        
        if (-not $SkipDocker) {
            $monitoringPath = "e:\GitHub\codai-project\monitoring"
            
            try {
                Push-Location $monitoringPath
                docker-compose -f docker-compose.monitoring.yml down
                Pop-Location
                Write-ColorOutput "✅ Monitoring stack stopped" "Green"
            }
            catch {
                Pop-Location
                Write-ColorOutput "❌ Failed to stop monitoring stack: $($_.Exception.Message)" "Red"
            }
        }
    }
}

Write-Host ""
Write-ColorOutput "✅ Monitoring action '$Action' completed" "Green"

if ($Action -eq "setup") {
    Write-ColorOutput "🌐 Monitoring URLs (after starting):" "Cyan"
    Write-ColorOutput "  • Grafana Dashboard: http://localhost:3002" "White"
    Write-ColorOutput "  • Prometheus Metrics: http://localhost:9090" "White"
    Write-ColorOutput "  • AlertManager: http://localhost:9093" "White"
    Write-ColorOutput "  • AGI Metrics: http://localhost:6101/metrics" "White"
}