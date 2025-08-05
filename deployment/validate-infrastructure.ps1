# Phase 4.3 AWS Infrastructure Validation Script

Write-Host "☁️ Phase 4.3: AWS Infrastructure Validation" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Gray

$ErrorActionPreference = "Stop"

# Configuration
$TerraformDir = "E:\GitHub\codai-project\deployment\aws"
$ProjectName = "codai-ecosystem"
$Environment = "production"

function Test-TerraformAvailable {
    try {
        terraform --version | Out-Null
        return $true
    } catch {
        Write-Host "❌ Terraform is not available. Installing..." -ForegroundColor Red
        
        try {
            # Install Terraform using Chocolatey if available
            choco install terraform -y
            return $true
        } catch {
            Write-Host "❌ Failed to install Terraform. Please install manually from https://terraform.io" -ForegroundColor Red
            return $false
        }
    }
}

function Test-AWSCLIAvailable {
    try {
        aws --version | Out-Null
        return $true
    } catch {
        Write-Host "❌ AWS CLI is not available. Installing..." -ForegroundColor Red
        
        try {
            # Install AWS CLI using Chocolatey if available
            choco install awscli -y
            return $true
        } catch {
            Write-Host "❌ Failed to install AWS CLI. Please install manually." -ForegroundColor Red
            return $false
        }
    }
}

function Test-AWSCredentials {
    try {
        $Identity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
        if ($Identity) {
            Write-Host "✅ AWS Credentials configured for: $($Identity.Arn)" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ AWS credentials not configured. Please run 'aws configure'" -ForegroundColor Red
        return $false
    }
}

function Validate-TerraformConfiguration {
    Write-Host "🔍 Validating Terraform configuration..." -ForegroundColor Yellow
    
    Push-Location $TerraformDir
    
    try {
        # Initialize Terraform
        Write-Host "Initializing Terraform..." -ForegroundColor Gray
        terraform init -no-color
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Terraform initialization failed" -ForegroundColor Red
            return $false
        }
        
        # Validate configuration
        Write-Host "Validating configuration..." -ForegroundColor Gray
        terraform validate -no-color
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Terraform configuration is valid" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Terraform configuration validation failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error during Terraform validation: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Generate-TerraformPlan {
    Write-Host "📋 Generating Terraform plan..." -ForegroundColor Yellow
    
    Push-Location $TerraformDir
    
    try {
        # Generate plan
        $PlanFile = "codai-ecosystem.tfplan"
        terraform plan -out=$PlanFile -no-color -var="project_name=$ProjectName" -var="environment=$Environment"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Terraform plan generated successfully" -ForegroundColor Green
            
            # Show plan summary
            Write-Host "`n📊 Plan Summary:" -ForegroundColor Cyan
            terraform show -no-color $PlanFile | Select-String "Plan:" -A 5
            
            return $true
        } else {
            Write-Host "❌ Terraform plan generation failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error during plan generation: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Validate-ECSTaskDefinitions {
    Write-Host "🐳 Validating ECS task definitions..." -ForegroundColor Yellow
    
    $ECSTasksDir = Join-Path $TerraformDir "ecs-tasks"
    $TaskFiles = Get-ChildItem -Path $ECSTasksDir -Filter "*.tf"
    
    $ValidationResults = @()
    
    foreach ($TaskFile in $TaskFiles) {
        $ServiceName = $TaskFile.BaseName
        Write-Host "Validating $ServiceName task definition..." -ForegroundColor Gray
        
        $Content = Get-Content $TaskFile.FullName -Raw
        
        # Basic validation checks
        $HasTaskDefinition = $Content -match 'resource "aws_ecs_task_definition"'
        $HasService = $Content -match 'resource "aws_ecs_service"'
        $HasHealthCheck = $Content -match 'healthCheck'
        $HasLogging = $Content -match 'logConfiguration'
        
        $ValidationResults += @{
            Service = $ServiceName
            TaskDefinition = $HasTaskDefinition
            ECSService = $HasService
            HealthCheck = $HasHealthCheck
            Logging = $HasLogging
            Valid = $HasTaskDefinition -and $HasService -and $HasHealthCheck -and $HasLogging
        }
    }
    
    # Display results
    Write-Host "`n📋 ECS Task Validation Results:" -ForegroundColor Cyan
    foreach ($Result in $ValidationResults) {
        $Status = if ($Result.Valid) { "✅ VALID" } else { "❌ INVALID" }
        Write-Host "$($Result.Service.PadRight(15)) | $Status" -ForegroundColor White
        
        if (-not $Result.Valid) {
            Write-Host "  Missing components:" -ForegroundColor Yellow
            if (-not $Result.TaskDefinition) { Write-Host "    - Task Definition" -ForegroundColor Red }
            if (-not $Result.ECSService) { Write-Host "    - ECS Service" -ForegroundColor Red }
            if (-not $Result.HealthCheck) { Write-Host "    - Health Check" -ForegroundColor Red }
            if (-not $Result.Logging) { Write-Host "    - Logging Configuration" -ForegroundColor Red }
        }
    }
    
    $ValidTasks = ($ValidationResults | Where-Object { $_.Valid }).Count
    $TotalTasks = $ValidationResults.Count
    
    Write-Host "`n📊 Task Definition Status: $ValidTasks/$TotalTasks valid" -ForegroundColor Cyan
    
    return $ValidTasks -eq $TotalTasks
}

function Test-DockerReadiness {
    Write-Host "🐳 Testing Docker readiness..." -ForegroundColor Yellow
    
    # Wait for Docker Desktop to start
    $MaxAttempts = 12
    $Attempt = 1
    
    while ($Attempt -le $MaxAttempts) {
        try {
            docker info | Out-Null
            Write-Host "✅ Docker is ready" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "⏳ Docker starting... (attempt $Attempt/$MaxAttempts)" -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            $Attempt++
        }
    }
    
    Write-Host "⚠️ Docker not ready after 2 minutes. Proceeding without container builds." -ForegroundColor Yellow
    return $false
}

function Main {
    Write-Host "Starting AWS infrastructure validation..." -ForegroundColor White
    
    $ValidationResults = @{
        Terraform = $false
        AWSCLI = $false
        AWSCredentials = $false
        TerraformConfig = $false
        TerraformPlan = $false
        ECSTasks = $false
        Docker = $false
    }
    
    # Check prerequisites
    Write-Host "`n🔧 Checking Prerequisites:" -ForegroundColor Magenta
    $ValidationResults.Terraform = Test-TerraformAvailable
    $ValidationResults.AWSCLI = Test-AWSCLIAvailable
    $ValidationResults.AWSCredentials = Test-AWSCredentials
    
    if (-not ($ValidationResults.Terraform -and $ValidationResults.AWSCLI)) {
        Write-Host "`n❌ Prerequisites not met. Please install required tools." -ForegroundColor Red
        exit 1
    }
    
    # Validate Terraform configuration
    Write-Host "`n🏗️ Infrastructure Validation:" -ForegroundColor Magenta
    $ValidationResults.TerraformConfig = Validate-TerraformConfiguration
    
    if ($ValidationResults.TerraformConfig) {
        $ValidationResults.TerraformPlan = Generate-TerraformPlan
    }
    
    # Validate ECS task definitions
    Write-Host "`n🐳 Container Configuration:" -ForegroundColor Magenta
    $ValidationResults.ECSTasks = Validate-ECSTaskDefinitions
    
    # Test Docker readiness
    $ValidationResults.Docker = Test-DockerReadiness
    
    # Display final results
    Write-Host "`n🎯 Validation Summary" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Gray
    
    foreach ($Key in $ValidationResults.Keys) {
        $Status = if ($ValidationResults[$Key]) { "✅ PASS" } else { "❌ FAIL" }
        Write-Host "$($Key.PadRight(20)) | $Status" -ForegroundColor White
    }
    
    # Calculate overall readiness
    $PassedChecks = ($ValidationResults.Values | Where-Object { $_ -eq $true }).Count
    $TotalChecks = $ValidationResults.Count
    $ReadinessPercentage = [math]::Round(($PassedChecks / $TotalChecks) * 100, 1)
    
    Write-Host "`n📊 Infrastructure Readiness: $ReadinessPercentage% ($PassedChecks/$TotalChecks)" -ForegroundColor Cyan
    
    if ($ReadinessPercentage -ge 70) {
        Write-Host "`n🚀 Infrastructure is ready for Phase 4.3 deployment!" -ForegroundColor Green
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Review Terraform plan" -ForegroundColor White
        Write-Host "2. Deploy infrastructure: terraform apply" -ForegroundColor White
        Write-Host "3. Build and push Docker images" -ForegroundColor White
        Write-Host "4. Deploy ECS services" -ForegroundColor White
        
        exit 0
    } else {
        Write-Host "`n⚠️ Infrastructure requires additional setup before deployment." -ForegroundColor Yellow
        Write-Host "Please address the failed validation checks above." -ForegroundColor Red
        
        exit 1
    }
}

# Run the main function
Main
