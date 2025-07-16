# 🎼 CODAI Intelligent Agent Orchestration System
# AGENT 8 - Intelligent Service Mesh Deployment
# Based on proven individual deployment success patterns

param(
    [int]$MaxConcurrent = 6,  # Prevent resource exhaustion
    [string[]]$PriorityApps = @("codai", "memorai", "bancai", "stocai", "aide", "prezentai"),
    [string]$Strategy = "staged"  # staged, parallel, or individual
)

Write-Host "🎼 CODAI Intelligent Agent Orchestration System" -ForegroundColor Cyan
Write-Host "📊 Max Concurrent: $MaxConcurrent | Strategy: $Strategy" -ForegroundColor Yellow

# Proven working applications from AGENT 8 service mesh foundation
$WorkingApps = @(
    @{Name="codai"; Port=4030; Status="operational"; Priority=1},
    @{Name="memorai"; Port=4031; Status="operational"; Priority=1},
    @{Name="bancai"; Port=4033; Status="stable"; Priority=1},
    @{Name="stocai"; Port=4065; Status="stable"; Priority=1},
    @{Name="aide"; Port=4076; Status="validated"; Priority=2},
    @{Name="prezentai"; Port=4081; Status="validated"; Priority=2}
)

# Additional applications for expansion (identified from projects.index.json)
$ExpansionApps = @(
    @{Name="analizai"; Port=4050; Priority=3},
    @{Name="hub"; Port=4057; Priority=2},  # Critical for API Gateway
    @{Name="logai"; Port=4032; Priority=3},
    @{Name="id"; Port=4034; Priority=3},
    @{Name="legalizai"; Port=4035; Priority=4},
    @{Name="fabricai"; Port=4036; Priority=4},
    @{Name="studiai"; Port=4037; Priority=4},
    @{Name="admin"; Port=4041; Priority=3},
    @{Name="dash"; Port=4044; Priority=3},
    @{Name="explorer"; Port=4046; Priority=4}
)

function Test-AppHealth {
    param([string]$Port)
    try {
        $Result = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return $Result -ne $null
    } catch {
        return $false
    }
}

function Start-AppWithValidation {
    param(
        [string]$AppName,
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )
    
    $AppPath = "E:\GitHub\codai-project\apps\$AppName"
    
    # Validate app directory and dependencies
    if (-not (Test-Path $AppPath)) {
        Write-Host "❌ $AppName - Directory not found: $AppPath" -ForegroundColor Red
        return $false
    }
    
    # Check for Next.js availability (AGENT 8 proven pattern)
    $NextPath = "$AppPath\node_modules\next\dist\bin\next"
    $WorkspaceNextPath = "E:\GitHub\codai-project\node_modules\.pnpm\next@*\node_modules\next\dist\bin\next"
    
    if (-not (Test-Path $NextPath) -and -not (Get-ChildItem $WorkspaceNextPath -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  $AppName - Next.js module not available" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "🚀 Starting $AppName on port $Port..." -ForegroundColor Green
    
    # Start application using proven AGENT 8 pattern
    $ProcessArgs = @{
        FilePath = "pnpm"
        ArgumentList = @("dev", "--port", $Port)
        WorkingDirectory = $AppPath
        PassThru = $true
        NoNewWindow = $true
    }
    
    try {
        $Process = Start-Process @ProcessArgs
        
        # Wait for health check with timeout
        $StartTime = Get-Date
        do {
            Start-Sleep -Seconds 2
            $IsHealthy = Test-AppHealth -Port $Port
            $ElapsedSeconds = ((Get-Date) - $StartTime).TotalSeconds
            
            if ($IsHealthy) {
                Write-Host "✅ $AppName - Healthy on port $Port (Ready in $([math]::Round($ElapsedSeconds, 1))s)" -ForegroundColor Green
                return $true
            }
        } while ($ElapsedSeconds -lt $TimeoutSeconds)
        
        Write-Host "⏰ $AppName - Timeout after $TimeoutSeconds seconds" -ForegroundColor Yellow
        return $false
        
    } catch {
        Write-Host "❌ $AppName - Failed to start: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-StagedDeployment {
    param([Array]$Apps)
    
    Write-Host "📊 Starting Staged Deployment Strategy..." -ForegroundColor Cyan
    
    $SuccessCount = 0
    $TotalApps = $Apps.Count
    
    # Group by priority and deploy in stages
    $Priorities = $Apps | Group-Object Priority | Sort-Object Name
    
    foreach ($PriorityGroup in $Priorities) {
        $Priority = $PriorityGroup.Name
        $PriorityApps = $PriorityGroup.Group
        
        Write-Host "Priority $Priority : Deploying $($PriorityApps.Count) applications..." -ForegroundColor Yellow
        
        # Deploy apps in this priority group
        $Jobs = @()
        foreach ($App in $PriorityApps) {
            if ($Jobs.Count -ge $MaxConcurrent) {
                # Wait for a job to complete
                $CompletedJob = $Jobs | Wait-Job -Any
                $Jobs = $Jobs | Where-Object { $_.Id -ne $CompletedJob.Id }
                Remove-Job $CompletedJob
            }
            
            $Job = Start-Job -ScriptBlock {
                param($AppName, $Port, $ScriptPath)
                & $ScriptPath -AppName $AppName -Port $Port
            } -ArgumentList $App.Name, $App.Port, $MyInvocation.MyCommand.Path
            
            $Jobs += $Job
        }
        
        # Wait for all jobs in this priority group
        $Jobs | Wait-Job | Out-Null
        $Jobs | Remove-Job
        
        # Check success rate for this priority
        $HealthyApps = $PriorityApps | Where-Object { Test-AppHealth -Port $_.Port }
        $PrioritySuccessRate = ($HealthyApps.Count / $PriorityApps.Count) * 100
        
        Write-Host "Priority $Priority Results: $($HealthyApps.Count)/$($PriorityApps.Count) apps healthy ($([math]::Round($PrioritySuccessRate, 1))percent)" -ForegroundColor Cyan
        
        $SuccessCount += $HealthyApps.Count
        
        # If success rate is too low, pause and analyze
        if ($PrioritySuccessRate -lt 50) {
            Write-Host "⚠️  Low success rate detected. Pausing for analysis..." -ForegroundColor Yellow
            break
        }
    }
    
    $OverallSuccessRate = ($SuccessCount / $TotalApps) * 100
    Write-Host "Overall Deployment Results: $SuccessCount/$TotalApps apps deployed ($([math]::Round($OverallSuccessRate, 1))percent)" -ForegroundColor Green
    
    return $OverallSuccessRate
}

function Get-ServiceMeshStatus {
    Write-Host "📊 Service Mesh Health Check..." -ForegroundColor Cyan
    
    $AllApps = $WorkingApps + $ExpansionApps
    $HealthyServices = @()
    $UnhealthyServices = @()
    
    foreach ($App in $AllApps) {
        $IsHealthy = Test-AppHealth -Port $App.Port
        if ($IsHealthy) {
            $HealthyServices += $App
            Write-Host "✅ $($App.Name) (Port $($App.Port)) - HEALTHY" -ForegroundColor Green
        } else {
            $UnhealthyServices += $App
            Write-Host "❌ $($App.Name) (Port $($App.Port)) - DOWN" -ForegroundColor Red
        }
    }
    
    $HealthPercentage = ($HealthyServices.Count / $AllApps.Count) * 100
    
    Write-Host "Service Mesh Health: $($HealthyServices.Count)/$($AllApps.Count) services ($([math]::Round($HealthPercentage, 1))percent)" -ForegroundColor Yellow
    
    return @{
        HealthyServices = $HealthyServices
        UnhealthyServices = $UnhealthyServices
        HealthPercentage = $HealthPercentage
    }
}

# Main execution logic
switch ($Strategy) {
    "staged" {
        Write-Host "🎯 Executing Staged Deployment Strategy..." -ForegroundColor Cyan
        $AllApps = $WorkingApps + $ExpansionApps | Sort-Object Priority, Name
        $Result = Start-StagedDeployment -Apps $AllApps
        Write-Host "🎼 Staged deployment completed with $([math]::Round($Result, 1))% success rate" -ForegroundColor Green
    }
    
    "status" {
        $Status = Get-ServiceMeshStatus
        Write-Host "🎼 Service Mesh Status Check Complete" -ForegroundColor Green
    }
    
    "foundation" {
        Write-Host "🏗️  Deploying Service Mesh Foundation (Priority 1 Apps)..." -ForegroundColor Cyan
        $FoundationApps = $WorkingApps | Where-Object { $_.Priority -eq 1 }
        $Result = Start-StagedDeployment -Apps $FoundationApps
        Write-Host "🏗️  Foundation deployment: $([math]::Round($Result, 1))% success rate" -ForegroundColor Green
    }
    
    default {
        Write-Host "❓ Unknown strategy: $Strategy" -ForegroundColor Red
        Write-Host "Available strategies: staged, status, foundation" -ForegroundColor Yellow
    }
}

Write-Host "🎼 CODAI Intelligent Orchestration Complete" -ForegroundColor Cyan
