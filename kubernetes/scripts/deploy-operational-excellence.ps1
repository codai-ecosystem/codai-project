# Complete Operational Excellence Deployment Script for Essential CodAI Services
# Version: 1.0
# Infrastructure Monitoring | Backup & DR | Security Scanning | Operational Dashboards

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory = $false)]
    [string]$Namespace = "codai-production",
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBackup = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipSecurity = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipMonitoring = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipDashboards = $false,
    
    [Parameter(Mandatory = $false)]
    [int]$TimeoutSeconds = 1800
)

# Script configuration
$ErrorActionPreference = "Stop"
$script:LogFile = "operational-excellence-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$script:StartTime = Get-Date
$script:DeploymentStatus = @{
    "Infrastructure Monitoring" = @{Status = "Pending"; StartTime = $null; Duration = $null; Error = $null}
    "Backup & Disaster Recovery" = @{Status = "Pending"; StartTime = $null; Duration = $null; Error = $null}
    "Security Scanning" = @{Status = "Pending"; StartTime = $null; Duration = $null; Error = $null}
    "Operational Dashboards" = @{Status = "Pending"; StartTime = $null; Duration = $null; Error = $null}
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "INFO" { Write-Host $logEntry -ForegroundColor Cyan }
        default { Write-Host $logEntry }
    }
    
    Add-Content -Path $script:LogFile -Value $logEntry
}

function Test-Prerequisites {
    Write-Log "🔍 Checking deployment prerequisites..."
    
    $prerequisites = @()
    
    # Check kubectl
    try {
        $kubectlVersion = kubectl version --client=true --output=json 2>$null | ConvertFrom-Json
        Write-Log "✅ kubectl version: $($kubectlVersion.clientVersion.gitVersion)"
    }
    catch {
        $prerequisites += "kubectl is not installed or not accessible"
    }
    
    # Check Kubernetes cluster access
    try {
        $clusterInfo = kubectl cluster-info --output=json 2>$null | ConvertFrom-Json
        Write-Log "✅ Kubernetes cluster accessible"
    }
    catch {
        $prerequisites += "Cannot access Kubernetes cluster"
    }
    
    # Check namespace exists
    try {
        kubectl get namespace $Namespace 2>$null | Out-Null
        Write-Log "✅ Namespace '$Namespace' exists"
    }
    catch {
        Write-Log "⚠️ Creating namespace '$Namespace'..."
        kubectl create namespace $Namespace
    }
    
    # Check Azure CLI (for backup storage)
    if (-not $SkipBackup) {
        try {
            $azVersion = az version --output json 2>$null | ConvertFrom-Json
            Write-Log "✅ Azure CLI version: $($azVersion.'azure-cli')"
        }
        catch {
            $prerequisites += "Azure CLI is not installed (required for backup functionality)"
        }
    }
    
    # Check Helm (for complex deployments)
    try {
        $helmVersion = helm version --template='{{.Version}}' 2>$null
        Write-Log "✅ Helm version: $helmVersion"
    }
    catch {
        Write-Log "⚠️ Helm not found - some deployments may require manual configuration"
    }
    
    if ($prerequisites.Count -gt 0) {
        Write-Log "❌ Prerequisites not met:" "ERROR"
        $prerequisites | ForEach-Object { Write-Log "   - $_" "ERROR" }
        throw "Prerequisites validation failed"
    }
    
    Write-Log "✅ All prerequisites validated successfully"
}

function Deploy-InfrastructureMonitoring {
    if ($SkipMonitoring) {
        Write-Log "⏩ Skipping Infrastructure Monitoring deployment (--SkipMonitoring flag set)"
        $script:DeploymentStatus["Infrastructure Monitoring"].Status = "Skipped"
        return
    }
    
    $component = "Infrastructure Monitoring"
    $script:DeploymentStatus[$component].Status = "In Progress"
    $script:DeploymentStatus[$component].StartTime = Get-Date
    
    try {
        Write-Log "🔧 Deploying Infrastructure Monitoring & Observability Stack..."
        
        # Deploy monitoring infrastructure
        if ($DryRun) {
            Write-Log "🔍 DRY RUN: Would deploy infrastructure-monitoring-observability.yaml"
        } else {
            kubectl apply -f "kubernetes/manifests/infrastructure-monitoring-observability.yaml" --namespace=$Namespace
        }
        
        # Wait for Prometheus deployment
        Write-Log "⏳ Waiting for Prometheus deployment to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/prometheus -n $Namespace
        }
        
        # Wait for Grafana deployment
        Write-Log "⏳ Waiting for Grafana deployment to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/grafana -n $Namespace
        }
        
        # Wait for AlertManager deployment
        Write-Log "⏳ Waiting for AlertManager deployment to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/alertmanager -n $Namespace
        }
        
        # Wait for Elasticsearch StatefulSet
        Write-Log "⏳ Waiting for Elasticsearch cluster to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=ready --timeout=900s pod -l app=elasticsearch -n $Namespace
        }
        
        # Validate monitoring stack
        Write-Log "🔍 Validating monitoring stack deployment..."
        if (-not $DryRun) {
            $prometheusStatus = kubectl get pods -l app=prometheus -n $Namespace -o jsonpath='{.items[*].status.phase}'
            $grafanaStatus = kubectl get pods -l app=grafana -n $Namespace -o jsonpath='{.items[*].status.phase}'
            $alertmanagerStatus = kubectl get pods -l app=alertmanager -n $Namespace -o jsonpath='{.items[*].status.phase}'
            
            if ($prometheusStatus -contains "Running" -and $grafanaStatus -contains "Running" -and $alertmanagerStatus -contains "Running") {
                Write-Log "✅ Infrastructure monitoring stack deployed successfully" "SUCCESS"
            } else {
                throw "Some monitoring components are not running properly"
            }
        }
        
        $script:DeploymentStatus[$component].Status = "Completed"
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        
    }
    catch {
        $script:DeploymentStatus[$component].Status = "Failed"
        $script:DeploymentStatus[$component].Error = $_.Exception.Message
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        Write-Log "❌ Infrastructure Monitoring deployment failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Deploy-BackupDisasterRecovery {
    if ($SkipBackup) {
        Write-Log "⏩ Skipping Backup & DR deployment (--SkipBackup flag set)"
        $script:DeploymentStatus["Backup & Disaster Recovery"].Status = "Skipped"
        return
    }
    
    $component = "Backup & Disaster Recovery"
    $script:DeploymentStatus[$component].Status = "In Progress"
    $script:DeploymentStatus[$component].StartTime = Get-Date
    
    try {
        Write-Log "💾 Deploying Backup & Disaster Recovery Automation..."
        
        # Create Velero namespace if not exists
        if (-not $DryRun) {
            kubectl create namespace velero --dry-run=client -o yaml | kubectl apply -f -
        }
        
        # Deploy backup and DR infrastructure
        if ($DryRun) {
            Write-Log "🔍 DRY RUN: Would deploy backup-disaster-recovery-automation.yaml"
        } else {
            kubectl apply -f "kubernetes/manifests/backup-disaster-recovery-automation.yaml"
        }
        
        # Wait for Velero deployment
        Write-Log "⏳ Waiting for Velero deployment to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/velero -n velero
        }
        
        # Wait for disaster recovery controller
        Write-Log "⏳ Waiting for Disaster Recovery Controller to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/disaster-recovery-controller -n $Namespace
        }
        
        # Validate backup schedules
        Write-Log "🔍 Validating backup schedules..."
        if (-not $DryRun) {
            $dailyBackup = kubectl get schedule codai-daily-backup -n velero -o jsonpath='{.metadata.name}' 2>$null
            $weeklyBackup = kubectl get schedule codai-weekly-backup -n velero -o jsonpath='{.metadata.name}' 2>$null
            
            if ($dailyBackup -eq "codai-daily-backup" -and $weeklyBackup -eq "codai-weekly-backup") {
                Write-Log "✅ Backup schedules configured successfully" "SUCCESS"
            } else {
                throw "Backup schedules not properly configured"
            }
        }
        
        # Test backup storage accessibility
        Write-Log "🔍 Testing backup storage accessibility..."
        if (-not $DryRun -and -not $SkipBackup) {
            try {
                $backupLocation = kubectl get backupstoragelocation azure-backup-storage -n velero -o jsonpath='{.status.phase}' 2>$null
                if ($backupLocation -eq "Available") {
                    Write-Log "✅ Backup storage location accessible" "SUCCESS"
                } else {
                    Write-Log "⚠️ Backup storage location not available - check Azure credentials" "WARNING"
                }
            }
            catch {
                Write-Log "⚠️ Could not verify backup storage location" "WARNING"
            }
        }
        
        $script:DeploymentStatus[$component].Status = "Completed"
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        
    }
    catch {
        $script:DeploymentStatus[$component].Status = "Failed"
        $script:DeploymentStatus[$component].Error = $_.Exception.Message
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        Write-Log "❌ Backup & DR deployment failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Deploy-SecurityScanning {
    if ($SkipSecurity) {
        Write-Log "⏩ Skipping Security Scanning deployment (--SkipSecurity flag set)"
        $script:DeploymentStatus["Security Scanning"].Status = "Skipped"
        return
    }
    
    $component = "Security Scanning"
    $script:DeploymentStatus[$component].Status = "In Progress"
    $script:DeploymentStatus[$component].StartTime = Get-Date
    
    try {
        Write-Log "🛡️ Deploying Security Scanning Automation..."
        
        # Deploy security scanning infrastructure
        if ($DryRun) {
            Write-Log "🔍 DRY RUN: Would deploy security-scanning-automation.yaml"
        } else {
            kubectl apply -f "kubernetes/manifests/security-scanning-automation.yaml" --namespace=$Namespace
        }
        
        # Wait for Falco DaemonSet
        Write-Log "⏳ Waiting for Falco runtime security to be ready..."
        if (-not $DryRun) {
            kubectl rollout status daemonset/falco -n $Namespace --timeout=600s
        }
        
        # Wait for Security Dashboard
        Write-Log "⏳ Waiting for Security Dashboard deployment to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/security-dashboard -n $Namespace
        }
        
        # Wait for Compliance Monitor
        Write-Log "⏳ Waiting for Compliance Monitor to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/compliance-monitor -n $Namespace
        }
        
        # Validate security components
        Write-Log "🔍 Validating security scanning components..."
        if (-not $DryRun) {
            $falcoStatus = kubectl get daemonset falco -n $Namespace -o jsonpath='{.status.numberReady}/{.status.desiredNumberScheduled}'
            $securityDashboard = kubectl get pods -l app=security-dashboard -n $Namespace -o jsonpath='{.items[*].status.phase}'
            $complianceMonitor = kubectl get pods -l app=compliance-monitor -n $Namespace -o jsonpath='{.items[*].status.phase}'
            
            Write-Log "📊 Falco DaemonSet: $falcoStatus pods ready"
            
            if ($securityDashboard -contains "Running" -and $complianceMonitor -contains "Running") {
                Write-Log "✅ Security scanning components deployed successfully" "SUCCESS"
            } else {
                throw "Some security components are not running properly"
            }
        }
        
        # Create initial vulnerability scan job
        Write-Log "🔍 Triggering initial vulnerability scan..."
        if (-not $DryRun) {
            kubectl create job --from=cronjob/trivy-vulnerability-scan trivy-initial-scan -n $Namespace
        }
        
        $script:DeploymentStatus[$component].Status = "Completed"
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        
    }
    catch {
        $script:DeploymentStatus[$component].Status = "Failed"
        $script:DeploymentStatus[$component].Error = $_.Exception.Message
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        Write-Log "❌ Security Scanning deployment failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Deploy-OperationalDashboards {
    if ($SkipDashboards) {
        Write-Log "⏩ Skipping Operational Dashboards deployment (--SkipDashboards flag set)"
        $script:DeploymentStatus["Operational Dashboards"].Status = "Skipped"
        return
    }
    
    $component = "Operational Dashboards"
    $script:DeploymentStatus[$component].Status = "In Progress"
    $script:DeploymentStatus[$component].StartTime = Get-Date
    
    try {
        Write-Log "📊 Deploying Comprehensive Operational Dashboards..."
        
        # Deploy operational dashboards
        if ($DryRun) {
            Write-Log "🔍 DRY RUN: Would deploy comprehensive-operational-dashboards.yaml"
        } else {
            kubectl apply -f "kubernetes/manifests/comprehensive-operational-dashboards.yaml" --namespace=$Namespace
        }
        
        # Wait for Dashboard Manager
        Write-Log "⏳ Waiting for Dashboard Manager to be ready..."
        if (-not $DryRun) {
            kubectl wait --for=condition=available --timeout=600s deployment/dashboard-manager -n $Namespace
        }
        
        # Validate Grafana provisioning
        Write-Log "🔍 Validating Grafana dashboard provisioning..."
        if (-not $DryRun) {
            # Check if Grafana is accessible and dashboards are loaded
            $grafanaPod = kubectl get pods -l app=grafana -n $Namespace -o jsonpath='{.items[0].metadata.name}'
            if ($grafanaPod) {
                Write-Log "📊 Grafana pod: $grafanaPod"
                
                # Wait for Grafana to fully initialize
                Start-Sleep -Seconds 30
                
                # Check dashboard provisioning
                try {
                    $dashboardCheck = kubectl exec $grafanaPod -n $Namespace -- ls -la /var/lib/grafana/dashboards/ 2>$null
                    if ($dashboardCheck) {
                        Write-Log "✅ Dashboard files provisioned successfully" "SUCCESS"
                    }
                }
                catch {
                    Write-Log "⚠️ Could not verify dashboard provisioning" "WARNING"
                }
            }
        }
        
        # Validate dashboard categories
        Write-Log "🔍 Validating dashboard categories..."
        if (-not $DryRun) {
            $configMaps = @(
                "executive-dashboards",
                "operations-dashboards", 
                "development-dashboards",
                "security-dashboards"
            )
            
            $missingConfigMaps = @()
            foreach ($configMap in $configMaps) {
                try {
                    kubectl get configmap $configMap -n $Namespace | Out-Null
                }
                catch {
                    $missingConfigMaps += $configMap
                }
            }
            
            if ($missingConfigMaps.Count -eq 0) {
                Write-Log "✅ All dashboard ConfigMaps deployed successfully" "SUCCESS"
            } else {
                throw "Missing dashboard ConfigMaps: $($missingConfigMaps -join ', ')"
            }
        }
        
        $script:DeploymentStatus[$component].Status = "Completed"
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        
    }
    catch {
        $script:DeploymentStatus[$component].Status = "Failed"
        $script:DeploymentStatus[$component].Error = $_.Exception.Message
        $script:DeploymentStatus[$component].Duration = (Get-Date) - $script:DeploymentStatus[$component].StartTime
        Write-Log "❌ Operational Dashboards deployment failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Test-DeploymentHealth {
    Write-Log "🏥 Running comprehensive health checks..."
    
    $healthChecks = @{
        "Prometheus" = @{
            Type = "HTTP"
            URL = "http://prometheus.${Namespace}.svc.cluster.local:9090/api/v1/query?query=up"
            Expected = "success"
        }
        "Grafana" = @{
            Type = "HTTP" 
            URL = "http://grafana.${Namespace}.svc.cluster.local:3000/api/health"
            Expected = "ok"
        }
        "AlertManager" = @{
            Type = "HTTP"
            URL = "http://alertmanager.${Namespace}.svc.cluster.local:9093/-/healthy"
            Expected = "Healthy"
        }
        "SecurityDashboard" = @{
            Type = "HTTP"
            URL = "http://security-dashboard.${Namespace}.svc.cluster.local:8080/health"
            Expected = "healthy"
        }
    }
    
    $healthResults = @{}
    
    if (-not $DryRun) {
        foreach ($service in $healthChecks.Keys) {
            try {
                Write-Log "🔍 Testing $service health..."
                
                # Use kubectl port-forward for health checks
                $port = Get-Random -Minimum 8000 -Maximum 9000
                $process = Start-Process -FilePath "kubectl" -ArgumentList @("port-forward", "svc/$($service.ToLower())", "${port}:$($healthChecks[$service].URL.Split(':')[2].Split('/')[0])", "-n", $Namespace) -PassThru -WindowStyle Hidden
                
                Start-Sleep -Seconds 3
                
                try {
                    $response = Invoke-RestMethod -Uri "http://localhost:${port}$($healthChecks[$service].URL.Split(':')[2])" -Method GET -TimeoutSec 10
                    $healthResults[$service] = "Healthy"
                    Write-Log "✅ $service: Healthy" "SUCCESS"
                }
                catch {
                    $healthResults[$service] = "Unhealthy: $($_.Exception.Message)"
                    Write-Log "❌ $service: Unhealthy - $($_.Exception.Message)" "ERROR"
                }
                finally {
                    if ($process -and -not $process.HasExited) {
                        $process.Kill()
                    }
                }
            }
            catch {
                $healthResults[$service] = "Error: $($_.Exception.Message)"
                Write-Log "❌ $service: Error - $($_.Exception.Message)" "ERROR"
            }
        }
    }
    
    # Check pod status
    Write-Log "🔍 Checking pod status..."
    if (-not $DryRun) {
        $unhealthyPods = kubectl get pods -n $Namespace --field-selector=status.phase!=Running -o jsonpath='{.items[*].metadata.name}' 2>$null
        if ($unhealthyPods) {
            Write-Log "⚠️ Unhealthy pods found: $unhealthyPods" "WARNING"
        } else {
            Write-Log "✅ All pods are running successfully" "SUCCESS"
        }
    }
    
    return $healthResults
}

function Generate-DeploymentReport {
    Write-Log "📋 Generating deployment report..."
    
    $totalDuration = (Get-Date) - $script:StartTime
    $successCount = ($script:DeploymentStatus.Values | Where-Object { $_.Status -eq "Completed" }).Count
    $failedCount = ($script:DeploymentStatus.Values | Where-Object { $_.Status -eq "Failed" }).Count
    $skippedCount = ($script:DeploymentStatus.Values | Where-Object { $_.Status -eq "Skipped" }).Count
    
    $reportPath = "operational-excellence-deployment-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    $reportContent = @"
# Operational Excellence Deployment Report
**CodAI Essential Services - Production Readiness**

## Deployment Summary
- **Environment**: $Environment
- **Namespace**: $Namespace
- **Start Time**: $($script:StartTime.ToString("yyyy-MM-dd HH:mm:ss"))
- **End Time**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Total Duration**: $($totalDuration.ToString("hh\:mm\:ss"))
- **Dry Run**: $DryRun

## Results Overview
- ✅ **Successful**: $successCount components
- ❌ **Failed**: $failedCount components  
- ⏩ **Skipped**: $skippedCount components

## Component Details

"@

    foreach ($component in $script:DeploymentStatus.Keys) {
        $status = $script:DeploymentStatus[$component]
        $statusIcon = switch ($status.Status) {
            "Completed" { "✅" }
            "Failed" { "❌" }
            "Skipped" { "⏩" }
            default { "⏳" }
        }
        
        $reportContent += @"
### $statusIcon $component
- **Status**: $($status.Status)
- **Duration**: $($status.Duration -ne $null ? $status.Duration.ToString("hh\:mm\:ss") : "N/A")
- **Error**: $($status.Error -ne $null ? $status.Error : "None")

"@
    }
    
    $reportContent += @"
## Access URLs (after successful deployment)
- **Grafana Dashboards**: https://grafana.codai.ro
- **Prometheus Metrics**: https://prometheus.codai.ro  
- **AlertManager**: https://alertmanager.codai.ro
- **Security Dashboard**: https://security.codai.ro

## Next Steps
1. Configure alert notification channels (Slack, PagerDuty, Email)
2. Set up custom business metrics dashboards
3. Configure backup retention policies
4. Schedule disaster recovery testing
5. Review and adjust security scanning policies
6. Train team on operational dashboards usage

## Support
For issues or questions, contact the DevOps team at devops@codai.ro

---
*Report generated by CodAI Operational Excellence Deployment Script v1.0*
"@

    $reportContent | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Log "📋 Deployment report saved to: $reportPath" "SUCCESS"
    
    return $reportPath
}

function Show-PostDeploymentInstructions {
    Write-Log ""
    Write-Log "🎉 OPERATIONAL EXCELLENCE DEPLOYMENT COMPLETED!" "SUCCESS"
    Write-Log "=================================================" "SUCCESS"
    Write-Log ""
    Write-Log "📊 Next Steps:" "INFO"
    Write-Log "   1. Access Grafana dashboards: kubectl port-forward svc/grafana 3000:3000 -n $Namespace"
    Write-Log "   2. Configure alert channels in AlertManager"
    Write-Log "   3. Review security scan results in Security Dashboard"
    Write-Log "   4. Test backup and restore procedures"
    Write-Log "   5. Train team on operational dashboards"
    Write-Log ""
    Write-Log "🔧 Configuration Files:" "INFO"
    Write-Log "   - Monitoring: kubernetes/manifests/infrastructure-monitoring-observability.yaml"
    Write-Log "   - Backup & DR: kubernetes/manifests/backup-disaster-recovery-automation.yaml"
    Write-Log "   - Security: kubernetes/manifests/security-scanning-automation.yaml"
    Write-Log "   - Dashboards: kubernetes/manifests/comprehensive-operational-dashboards.yaml"
    Write-Log ""
    Write-Log "📧 Support: devops@codai.ro" "INFO"
    Write-Log ""
}

# Main deployment workflow
try {
    Write-Log "🚀 Starting Operational Excellence Deployment for Essential CodAI Services" "SUCCESS"
    Write-Log "Environment: $Environment | Namespace: $Namespace | Dry Run: $DryRun"
    Write-Log ""
    
    # Phase 1: Prerequisites validation
    Test-Prerequisites
    
    # Phase 2: Deploy infrastructure monitoring
    Deploy-InfrastructureMonitoring
    
    # Phase 3: Deploy backup and disaster recovery
    Deploy-BackupDisasterRecovery
    
    # Phase 4: Deploy security scanning
    Deploy-SecurityScanning
    
    # Phase 5: Deploy operational dashboards
    Deploy-OperationalDashboards
    
    # Phase 6: Health validation
    $healthResults = Test-DeploymentHealth
    
    # Phase 7: Generate deployment report
    $reportPath = Generate-DeploymentReport
    
    # Phase 8: Show post-deployment instructions
    Show-PostDeploymentInstructions
    
    Write-Log "✅ OPERATIONAL EXCELLENCE DEPLOYMENT COMPLETED SUCCESSFULLY!" "SUCCESS"
    
    exit 0
}
catch {
    Write-Log "❌ DEPLOYMENT FAILED: $($_.Exception.Message)" "ERROR"
    Write-Log "📋 Generating failure report..."
    
    $reportPath = Generate-DeploymentReport
    
    Write-Log "📋 Failure report saved to: $reportPath" "ERROR"
    Write-Log "📧 For support, contact devops@codai.ro with the report file" "ERROR"
    
    exit 1
}
finally {
    $totalTime = (Get-Date) - $script:StartTime
    Write-Log "⏱️ Total execution time: $($totalTime.ToString("hh\:mm\:ss"))"
    Write-Log "📝 Log file saved to: $script:LogFile"
}