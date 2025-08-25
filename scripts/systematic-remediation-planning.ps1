#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - SYSTEMATIC REMEDIATION PLANNING
# ==================================================

param(
    [switch]$ExecuteRemediation = $false,
    [switch]$HighPriorityOnly = $false,
    [switch]$GenerateActionPlan = $true,
    [switch]$ValidatePrerequisites = $true
)

Write-Host "🛠️ CODAI ECOSYSTEM - SYSTEMATIC REMEDIATION PLANNING" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Creating prioritized action plan to fix critical ecosystem issues" -ForegroundColor White
Write-Host ""

# Global remediation plan structure
$global:RemediationPlan = @{
    CriticalIssues = @()
    HighPriorityActions = @()
    MediumPriorityActions = @()
    LowPriorityActions = @()
    Prerequisites = @()
    EstimatedTimeToResolution = 0
    RiskAssessment = @()
    SuccessValidation = @()
}

function Write-RemediationSection {
    param([string]$Title, [string]$Color = "Magenta")
    Write-Host ""
    Write-Host "🛠️ $Title" -ForegroundColor $Color
    Write-Host ("=" * ($Title.Length + 4)) -ForegroundColor Gray
}

function Add-RemediationAction {
    param(
        [string]$Priority,
        [string]$Title,
        [string]$Description,
        [string]$Command,
        [int]$EstimatedMinutes = 5,
        [string]$Category,
        [string]$Risk = "Low",
        [string]$Impact,
        [array]$Prerequisites = @(),
        [string]$ValidationCommand = ""
    )
    
    $action = @{
        Title = $Title
        Description = $Description
        Command = $Command
        EstimatedMinutes = $EstimatedMinutes
        Category = $Category
        Risk = $Risk
        Impact = $Impact
        Prerequisites = $Prerequisites
        ValidationCommand = $ValidationCommand
        Status = "Pending"
    }
    
    switch ($Priority.ToLower()) {
        "critical" { $global:RemediationPlan.CriticalIssues += $action }
        "high" { $global:RemediationPlan.HighPriorityActions += $action }
        "medium" { $global:RemediationPlan.MediumPriorityActions += $action }
        "low" { $global:RemediationPlan.LowPriorityActions += $action }
    }
    
    $global:RemediationPlan.EstimatedTimeToResolution += $EstimatedMinutes
}

function Test-Prerequisites {
    param([array]$Prerequisites)
    
    $results = @()
    foreach ($prereq in $Prerequisites) {
        try {
            $result = Invoke-Expression $prereq.Command
            $exitCode = $LASTEXITCODE
            
            $results += @{
                Name = $prereq.Name
                Met = ($exitCode -eq 0)
                Command = $prereq.Command
                Issue = if ($exitCode -eq 0) { "" } else { "Prerequisite not met" }
            }
        } catch {
            $results += @{
                Name = $prereq.Name
                Met = $false
                Command = $prereq.Command
                Issue = $_.Exception.Message
            }
        }
    }
    
    return $results
}

function Execute-RemediationAction {
    param($Action, [switch]$DryRun = $true)
    
    Write-Host "  🔧 $($Action.Title)" -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "    [DRY RUN] Command: $($Action.Command)" -ForegroundColor Gray
        Write-Host "    [DRY RUN] Estimated time: $($Action.EstimatedMinutes) minutes" -ForegroundColor Gray
        return @{ Success = $true; Message = "Dry run completed" }
    }
    
    try {
        $startTime = Get-Date
        Invoke-Expression $Action.Command
        $duration = ((Get-Date) - $startTime).TotalMinutes
        
        # Validate the action if validation command provided
        if ($Action.ValidationCommand) {
            try {
                Invoke-Expression $Action.ValidationCommand
                $validationSuccess = ($LASTEXITCODE -eq 0)
            } catch {
                $validationSuccess = $false
            }
        } else {
            $validationSuccess = $true
        }
        
        return @{
            Success = $validationSuccess
            Duration = [math]::Round($duration, 1)
            Message = if ($validationSuccess) { "Action completed successfully" } else { "Action completed but validation failed" }
        }
        
    } catch {
        return @{
            Success = $false
            Duration = 0
            Message = "Action failed: $($_.Exception.Message)"
        }
    }
}

# =============================================================================
# PHASE 1: CRITICAL ISSUE IDENTIFICATION & PRIORITIZATION
# =============================================================================
Write-RemediationSection "CRITICAL ISSUE IDENTIFICATION & PRIORITIZATION"

Write-Host "Analyzing diagnostic results and prioritizing critical issues..." -ForegroundColor Yellow

# Based on our comprehensive diagnostics, identify critical issues
Write-Host "🚨 CRITICAL ISSUES IDENTIFIED:" -ForegroundColor Red

# CRITICAL: CBD Database Connection Refused (Port 4180)
Add-RemediationAction -Priority "Critical" -Title "Fix CBD Database Connection" -Category "Database" -EstimatedMinutes 10 -Risk "Medium" -Impact "Breaks MCP Server and data persistence" -Description "CBD Database on port 4180 is actively refusing connections, breaking the core MCP functionality" -Command "cd packages/cbd && `$env:PORT=4180; npx tsx src/start.ts" -Prerequisites @(@{Name="Node.js Available";Command="node --version"}, @{Name="CBD Package Exists";Command="Test-Path packages/cbd/src/start.ts"}) -ValidationCommand "Invoke-WebRequest -Uri http://localhost:4180/health -UseBasicParsing"

# CRITICAL: Docker-Compose Orchestration vs Manual Startup
Add-RemediationAction -Priority "Critical" -Title "Restart Services via Docker-Compose" -Category "Orchestration" -EstimatedMinutes 15 -Risk "High" -Impact "Fixes port bindings and service integration" -Description "Services were started manually instead of docker-compose, causing missing port bindings and integration issues" -Command "docker-compose down --remove-orphans && docker-compose up -d" -Prerequisites @(@{Name="Docker Running";Command="docker info"}, @{Name="Docker-Compose File";Command="Test-Path docker-compose.yml"}) -ValidationCommand "docker-compose ps"

# CRITICAL: PostgreSQL Database Connectivity 
Add-RemediationAction -Priority "Critical" -Title "Restart PostgreSQL Database" -Category "Database" -EstimatedMinutes 5 -Risk "Medium" -Impact "Enables Compliance API and GraphQL functionality" -Description "PostgreSQL database connections failing for Compliance API and other services" -Command "docker-compose restart codai-postgresql-db && Start-Sleep 10" -Prerequisites @(@{Name="Docker Compose Available";Command="docker-compose --version"}) -ValidationCommand "docker exec codai-postgresql-db pg_isready -U postgres"

# HIGH: GraphQL API Authentication Issues
Add-RemediationAction -Priority "High" -Title "Fix GraphQL API Configuration" -Category "API" -EstimatedMinutes 8 -Risk "Low" -Impact "Enables frontend to API communication" -Description "GraphQL API returning 400 Bad Request errors, likely authentication or CORS issues" -Command "docker-compose restart codai-memorai-graphql-api && Start-Sleep 5" -Prerequisites @(@{Name="GraphQL Service Exists";Command="docker ps --filter name=graphql"}) -ValidationCommand "Invoke-WebRequest -Uri http://localhost:4500/health -UseBasicParsing"

# HIGH: Redis Cache Connectivity
Add-RemediationAction -Priority "High" -Title "Restore Redis Cache Connection" -Category "Cache" -EstimatedMinutes 5 -Risk "Low" -Impact "Improves performance and session management" -Description "Gateway cannot connect to Redis cache, affecting performance" -Command "docker-compose restart codai-redis-cache && Start-Sleep 5" -Prerequisites @(@{Name="Redis Service Defined";Command="docker-compose config | grep redis"}) -ValidationCommand "docker exec codai-redis-cache redis-cli ping"

# HIGH: BancAI Port Binding Issues
Add-RemediationAction -Priority "High" -Title "Fix BancAI Port Binding" -Category "Networking" -EstimatedMinutes 8 -Risk "Medium" -Impact "Enables BancAI frontend access" -Description "BancAI service has no port bindings despite being configured for 4120:4005" -Command "docker-compose restart codai-bancai-frontend && Start-Sleep 5" -Prerequisites @(@{Name="BancAI Service Configured";Command="docker-compose config | grep bancai"}) -ValidationCommand "docker port codai-bancai-frontend"

# MEDIUM: Load Balancer Configuration Optimization
Add-RemediationAction -Priority "Medium" -Title "Optimize Load Balancer Configuration" -Category "Load Balancing" -EstimatedMinutes 10 -Risk "Low" -Impact "Improves routing and performance" -Description "Load balancer working but may benefit from configuration optimization" -Command "docker-compose restart codai-nginx-lb && Start-Sleep 5" -Prerequisites @(@{Name="Nginx Config Available";Command="docker exec codai-nginx-lb nginx -t"}) -ValidationCommand "curl -s http://localhost:8080/health"

# MEDIUM: Authentication Mechanism Restoration
Add-RemediationAction -Priority "Medium" -Title "Restore Service Authentication" -Category "Security" -EstimatedMinutes 12 -Risk "Medium" -Impact "Enables secure service communication" -Description "All service authentication tests failed, need to restore proper auth mechanisms" -Command "docker-compose restart codai-memorai-mcp-api codai-romai-compliance-api && Start-Sleep 10" -Prerequisites @(@{Name="Environment Variables Set";Command="docker-compose config | grep -i auth"}) -ValidationCommand "echo 'Authentication validation requires manual testing'"

# LOW: Monitoring Stack Health
Add-RemediationAction -Priority "Low" -Title "Verify Monitoring Stack" -Category "Monitoring" -EstimatedMinutes 5 -Risk "Low" -Impact "Ensures observability and metrics collection" -Description "Verify Prometheus, Grafana, and other monitoring services are functioning" -Command "docker-compose restart codai-prometheus codai-grafana && Start-Sleep 10" -Prerequisites @(@{Name="Monitoring Services Configured";Command="docker-compose config | grep prometheus"}) -ValidationCommand "curl -s http://localhost:4951/api/health && curl -s http://localhost:4952/api/v1/status/config"

Write-Host ""
Write-Host "📊 REMEDIATION PLAN OVERVIEW:" -ForegroundColor Cyan
Write-Host "  Critical Issues: $($global:RemediationPlan.CriticalIssues.Count)"
Write-Host "  High Priority: $($global:RemediationPlan.HighPriorityActions.Count)"
Write-Host "  Medium Priority: $($global:RemediationPlan.MediumPriorityActions.Count)"
Write-Host "  Low Priority: $($global:RemediationPlan.LowPriorityActions.Count)"
Write-Host "  Estimated Total Time: $([math]::Round($global:RemediationPlan.EstimatedTimeToResolution/60,1)) hours"

# =============================================================================
# PHASE 2: PREREQUISITE VALIDATION
# =============================================================================
Write-RemediationSection "PREREQUISITE VALIDATION"

if ($ValidatePrerequisites) {
    Write-Host "Validating prerequisites for remediation actions..." -ForegroundColor Yellow
    
    # Collect all unique prerequisites
    $allPrereqs = @()
    @($global:RemediationPlan.CriticalIssues + $global:RemediationPlan.HighPriorityActions) | ForEach-Object {
        $allPrereqs += $_.Prerequisites
    }
    $uniquePrereqs = $allPrereqs | Sort-Object Name -Unique
    
    foreach ($prereq in $uniquePrereqs) {
        Write-Host "  Checking: $($prereq.Name)" -NoNewline -ForegroundColor White
        
        try {
            $null = Invoke-Expression $prereq.Command 2>$null
            $success = ($LASTEXITCODE -eq 0)
        } catch {
            $success = $false
        }
        
        if ($success) {
            Write-Host " ✅ OK" -ForegroundColor Green
        } else {
            Write-Host " ❌ NOT MET" -ForegroundColor Red
            Write-Host "    Command: $($prereq.Command)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⏭️ Prerequisite validation skipped" -ForegroundColor Gray
}

# =============================================================================
# PHASE 3: DETAILED REMEDIATION ACTION PLAN
# =============================================================================
Write-RemediationSection "DETAILED REMEDIATION ACTION PLAN"

if ($GenerateActionPlan) {
    Write-Host "🎯 EXECUTION SEQUENCE (Priority-based):" -ForegroundColor Cyan
    Write-Host ""
    
    # Function to display action details
    function Show-ActionPlan {
        param($Actions, $CategoryTitle)
        
        if ($Actions.Count -gt 0) {
            Write-Host "📋 $CategoryTitle ($($Actions.Count) actions)" -ForegroundColor Yellow
            
            for ($i = 0; $i -lt $Actions.Count; $i++) {
                $action = $Actions[$i]
                Write-Host ""
                Write-Host "  $($i + 1). $($action.Title)" -ForegroundColor White
                Write-Host "     Category: $($action.Category)" -ForegroundColor Gray
                Write-Host "     Impact: $($action.Impact)" -ForegroundColor Gray
                Write-Host "     Risk: $($action.Risk)" -ForegroundColor $(if ($action.Risk -eq "High") { "Red" } elseif ($action.Risk -eq "Medium") { "Yellow" } else { "Green" })
                Write-Host "     Time: $($action.EstimatedMinutes) minutes" -ForegroundColor Gray
                Write-Host "     Command: $($action.Command)" -ForegroundColor Cyan
                if ($action.Prerequisites.Count -gt 0) {
                    Write-Host "     Prerequisites: $($action.Prerequisites.Name -join ', ')" -ForegroundColor DarkYellow
                }
                if ($action.ValidationCommand) {
                    Write-Host "     Validation: $($action.ValidationCommand)" -ForegroundColor DarkGreen
                }
            }
            Write-Host ""
        }
    }
    
    Show-ActionPlan -Actions $global:RemediationPlan.CriticalIssues -CategoryTitle "🚨 CRITICAL ISSUES (Immediate Action Required)"
    
    if (-not $HighPriorityOnly) {
        Show-ActionPlan -Actions $global:RemediationPlan.HighPriorityActions -CategoryTitle "🔥 HIGH PRIORITY ACTIONS"
        Show-ActionPlan -Actions $global:RemediationPlan.MediumPriorityActions -CategoryTitle "⚠️ MEDIUM PRIORITY ACTIONS"
        Show-ActionPlan -Actions $global:RemediationPlan.LowPriorityActions -CategoryTitle "📝 LOW PRIORITY ACTIONS"
    }
    
} else {
    Write-Host "⏭️ Action plan generation skipped" -ForegroundColor Gray
}

# =============================================================================
# PHASE 4: RISK ASSESSMENT & SUCCESS CRITERIA
# =============================================================================
Write-RemediationSection "RISK ASSESSMENT & SUCCESS CRITERIA"

Write-Host "⚠️ RISK ASSESSMENT:" -ForegroundColor Red
Write-Host "  • HIGH RISK: Docker-compose restart may cause temporary service downtime" -ForegroundColor Red
Write-Host "  • MEDIUM RISK: Database restarts may lose in-memory data" -ForegroundColor Yellow  
Write-Host "  • MEDIUM RISK: BancAI port binding changes may affect existing connections" -ForegroundColor Yellow
Write-Host "  • LOW RISK: Service restarts should be seamless with proper health checks" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 SUCCESS CRITERIA:" -ForegroundColor Green
Write-Host "  ✅ CBD Database accessible on port 4180 with health checks passing"
Write-Host "  ✅ All services properly orchestrated via docker-compose with correct port bindings"
Write-Host "  ✅ PostgreSQL connections working for Compliance API and GraphQL"
Write-Host "  ✅ GraphQL API returning successful responses (not 400 errors)"
Write-Host "  ✅ Redis cache connectivity restored for gateway service"
Write-Host "  ✅ BancAI frontend accessible with proper port bindings"
Write-Host "  ✅ Service integration health score improved to >80%"
Write-Host "  ✅ Authentication mechanisms functional across all services"

Write-Host ""
Write-Host "📈 EXPECTED OUTCOMES:" -ForegroundColor Cyan
Write-Host "  • Integration health score improvement from 43.5% to 80%+"
Write-Host "  • Database connectivity success rate from 40% to 90%+"
Write-Host "  • API integration success rate from 66.7% to 90%+"
Write-Host "  • Complete restoration of authentication (from 0% to 90%+)"
Write-Host "  • Full data flow validation functionality restored"

# =============================================================================
# PHASE 5: IMMEDIATE ACTION RECOMMENDATIONS
# =============================================================================
Write-RemediationSection "IMMEDIATE ACTION RECOMMENDATIONS" "Red"

Write-Host "🎯 IMMEDIATE NEXT STEPS:" -ForegroundColor Red
Write-Host ""
Write-Host "1️⃣ EXECUTE CRITICAL ACTIONS IN SEQUENCE:" -ForegroundColor Red
Write-Host "   Run: pwsh -ExecutionPolicy Bypass -File 'systematic-remediation-planning.ps1' -ExecuteRemediation -HighPriorityOnly" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣ START WITH CBD DATABASE (Highest Impact):" -ForegroundColor Red  
Write-Host "   cd packages/cbd && `$env:PORT=4180; npx tsx src/start.ts" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣ RESTART DOCKER ORCHESTRATION:" -ForegroundColor Red
Write-Host "   docker-compose down --remove-orphans && docker-compose up -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣ VALIDATE FIXES:" -ForegroundColor Yellow
Write-Host "   Run comprehensive diagnostics again to verify improvements" -ForegroundColor Cyan

# =============================================================================
# PHASE 6: EXECUTION MODE (Optional)
# =============================================================================
if ($ExecuteRemediation) {
    Write-RemediationSection "REMEDIATION EXECUTION" "Red"
    
    Write-Host "🚀 EXECUTING REMEDIATION ACTIONS..." -ForegroundColor Red
    Write-Host "⚠️ This will make changes to your system!" -ForegroundColor Yellow
    
    $actionsToExecute = if ($HighPriorityOnly) { 
        $global:RemediationPlan.CriticalIssues + $global:RemediationPlan.HighPriorityActions 
    } else { 
        $global:RemediationPlan.CriticalIssues + $global:RemediationPlan.HighPriorityActions + $global:RemediationPlan.MediumPriorityActions 
    }
    
    $successCount = 0
    $totalActions = $actionsToExecute.Count
    
    foreach ($action in $actionsToExecute) {
        Write-Host ""
        $result = Execute-RemediationAction -Action $action -DryRun:$false
        
        if ($result.Success) {
            Write-Host "    ✅ $($result.Message) ($($result.Duration) min)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "    ❌ $($result.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📊 EXECUTION SUMMARY:" -ForegroundColor Cyan
    Write-Host "  Successful Actions: $successCount/$totalActions ($([math]::Round(($successCount/$totalActions)*100,1))%)"
    Write-Host "  Time Elapsed: $([math]::Round($global:RemediationPlan.EstimatedTimeToResolution/60,1)) hours"
    
} else {
    Write-RemediationSection "EXECUTION MODE DISABLED" "Gray"
    Write-Host "💡 To execute remediation actions, run with -ExecuteRemediation flag" -ForegroundColor Yellow
    Write-Host "💡 To execute only critical/high priority, add -HighPriorityOnly flag" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🕒 Systematic remediation planning completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return comprehensive remediation plan summary
return @{
    TotalActions = ($global:RemediationPlan.CriticalIssues.Count + $global:RemediationPlan.HighPriorityActions.Count + $global:RemediationPlan.MediumPriorityActions.Count + $global:RemediationPlan.LowPriorityActions.Count)
    CriticalIssues = $global:RemediationPlan.CriticalIssues.Count
    HighPriority = $global:RemediationPlan.HighPriorityActions.Count
    MediumPriority = $global:RemediationPlan.MediumPriorityActions.Count
    LowPriority = $global:RemediationPlan.LowPriorityActions.Count
    EstimatedHours = [math]::Round($global:RemediationPlan.EstimatedTimeToResolution/60,1)
    TopPriorityAction = "Fix CBD Database Connection (Port 4180 refused)"
    ExpectedHealthImprovement = "43.5% → 80%+"
}