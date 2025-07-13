# ROMAI Ultimate MCP Server - Infrastructure Deployment Validation
# Comprehensive validation of infrastructure setup and deployment readiness

Write-Host "🚀 ROMAI Ultimate MCP Server - Infrastructure Validation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration
$DOCKER_COMPOSE_PATH = "e:\GitHub\romai\packages\romai-mcp"
$TERRAFORM_PATH = "e:\GitHub\romai\packages\romai-mcp\infrastructure\terraform"
$NGINX_CONFIG_PATH = "e:\GitHub\romai\packages\romai-mcp\infrastructure\nginx"
$TEST_RESULTS = [System.Collections.ArrayList]::new()

function Test-TerraformConfiguration {
    Write-Host "`n🏗️  Testing Terraform Configuration..." -ForegroundColor Yellow
    
    # Test 1: Terraform Syntax
    Write-Host "  ✓ Testing Terraform syntax..." -ForegroundColor Green
    
    try {
        Set-Location $TERRAFORM_PATH
        $terraformInit = terraform init -backend=false 2>&1
        $terraformValidate = terraform validate 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $null = $TEST_RESULTS.Add(@{
                Test = "Terraform_Syntax"
                Status = "PASS"
                Details = "Terraform configuration is valid"
            })
            Write-Host "    ✅ Terraform syntax: VALID" -ForegroundColor Green
        } else {
            $null = $TEST_RESULTS.Add(@{
                Test = "Terraform_Syntax"
                Status = "FAIL"
                Details = "Terraform validation failed: $terraformValidate"
            })
            Write-Host "    ❌ Terraform syntax: INVALID" -ForegroundColor Red
        }
    } catch {
        $null = $TEST_RESULTS.Add(@{
            Test = "Terraform_Syntax"
            Status = "FAIL"
            Details = "Error: $($_.Exception.Message)"
        })
        Write-Host "    ❌ Terraform test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 2: Module Structure
    Write-Host "  ✓ Testing Terraform module structure..." -ForegroundColor Green
    $modules = @("networking", "security", "monitoring")
    $foundModules = 0
    
    foreach ($module in $modules) {
        $modulePath = Join-Path $TERRAFORM_PATH "modules\$module\main.tf"
        if (Test-Path $modulePath) {
            $foundModules++
        }
    }
    
    if ($foundModules -eq $modules.Count) {
        $null = $TEST_RESULTS.Add(@{
            Test = "Terraform_Modules"
            Status = "PASS"
            Details = "All $foundModules modules present"
        })
        Write-Host "    ✅ Terraform modules: $foundModules/$($modules.Count) present" -ForegroundColor Green
    } else {
        $null = $TEST_RESULTS.Add(@{
            Test = "Terraform_Modules"
            Status = "WARN"
            Details = "Only $foundModules/$($modules.Count) modules found"
        })
        Write-Host "    ⚠️  Terraform modules: $foundModules/$($modules.Count) present" -ForegroundColor Yellow
    }
}

function Test-DockerConfiguration {
    Write-Host "`n🐳 Testing Docker Configuration..." -ForegroundColor Yellow
    
    # Test 1: Docker Compose Files
    Write-Host "  ✓ Testing Docker Compose files..." -ForegroundColor Green
    $composeFiles = @("docker-compose.production.yml", "docker-compose.dev.yml", "Dockerfile")
    $foundFiles = 0
    
    foreach ($file in $composeFiles) {
        $filePath = Join-Path $DOCKER_COMPOSE_PATH $file
        if (Test-Path $filePath) {
            $foundFiles++
        }
    }
    
    if ($foundFiles -eq $composeFiles.Count) {
        $null = $TEST_RESULTS.Add(@{
            Test = "Docker_Files"
            Status = "PASS"
            Details = "All Docker files present"
        })
        Write-Host "    ✅ Docker files: $foundFiles/$($composeFiles.Count) present" -ForegroundColor Green
    } else {
        $null = $TEST_RESULTS.Add(@{
            Test = "Docker_Files"
            Status = "WARN"
            Details = "Only $foundFiles/$($composeFiles.Count) files found"
        })
        Write-Host "    ⚠️  Docker files: $foundFiles/$($composeFiles.Count) present" -ForegroundColor Yellow
    }
    
    # Test 2: Production Compose Services
    Write-Host "  ✓ Testing production services..." -ForegroundColor Green
    $prodComposePath = Join-Path $DOCKER_COMPOSE_PATH "docker-compose.production.yml"
    
    if (Test-Path $prodComposePath) {
        $composeContent = Get-Content $prodComposePath -Raw
        $expectedServices = @("romai-mcp", "nginx", "postgres", "redis", "prometheus", "grafana")
        $foundServices = 0
        
        foreach ($service in $expectedServices) {
            if ($composeContent -match "$service:") {
                $foundServices++
            }
        }
        
        if ($foundServices -ge 4) {
            $null = $TEST_RESULTS.Add(@{
                Test = "Production_Services"
                Status = "PASS"
                Details = "$foundServices/$($expectedServices.Count) services configured"
            })
            Write-Host "    ✅ Production services: $foundServices/$($expectedServices.Count) configured" -ForegroundColor Green
        } else {
            $null = $TEST_RESULTS.Add(@{
                Test = "Production_Services"
                Status = "WARN"
                Details = "Only $foundServices/$($expectedServices.Count) services found"
            })
            Write-Host "    ⚠️  Production services: $foundServices/$($expectedServices.Count) configured" -ForegroundColor Yellow
        }
    }
}

function Test-NginxConfiguration {
    Write-Host "`n🔧 Testing NGINX Configuration..." -ForegroundColor Yellow
    
    # Test 1: NGINX Config File
    Write-Host "  ✓ Testing NGINX config file..." -ForegroundColor Green
    $nginxConfigFile = Join-Path $NGINX_CONFIG_PATH "nginx.conf"
    
    if (Test-Path $nginxConfigFile) {
        $nginxContent = Get-Content $nginxConfigFile -Raw
        
        # Check for essential configurations
        $essentialConfigs = @("upstream", "server", "location", "proxy_pass")
        $foundConfigs = 0
        
        foreach ($config in $essentialConfigs) {
            if ($nginxContent -match $config) {
                $foundConfigs++
            }
        }
        
        if ($foundConfigs -eq $essentialConfigs.Count) {
            $null = $TEST_RESULTS.Add(@{
                Test = "NGINX_Configuration"
                Status = "PASS"
                Details = "All essential configurations present"
            })
            Write-Host "    ✅ NGINX configuration: Complete" -ForegroundColor Green
        } else {
            $null = $TEST_RESULTS.Add(@{
                Test = "NGINX_Configuration"
                Status = "WARN"
                Details = "Only $foundConfigs/$($essentialConfigs.Count) configurations found"
            })
            Write-Host "    ⚠️  NGINX configuration: $foundConfigs/$($essentialConfigs.Count) present" -ForegroundColor Yellow
        }
    } else {
        $null = $TEST_RESULTS.Add(@{
            Test = "NGINX_Configuration"
            Status = "FAIL"
            Details = "NGINX config file not found"
        })
        Write-Host "    ❌ NGINX configuration: NOT FOUND" -ForegroundColor Red
    }
}

function Test-ConfigurationFiles {
    Write-Host "`n⚙️  Testing Configuration Files..." -ForegroundColor Yellow
    
    # Test 1: Configuration Files
    Write-Host "  ✓ Testing configuration files..." -ForegroundColor Green
    $configFiles = @("config\production.json", "config\development.json")
    $foundConfigs = 0
    
    foreach ($configFile in $configFiles) {
        $configPath = Join-Path $DOCKER_COMPOSE_PATH $configFile
        if (Test-Path $configPath) {
            $foundConfigs++
        }
    }
    
    if ($foundConfigs -eq $configFiles.Count) {
        $null = $TEST_RESULTS.Add(@{
            Test = "Configuration_Files"
            Status = "PASS"
            Details = "All configuration files present"
        })
        Write-Host "    ✅ Configuration files: $foundConfigs/$($configFiles.Count) present" -ForegroundColor Green
    } else {
        $null = $TEST_RESULTS.Add(@{
            Test = "Configuration_Files"
            Status = "WARN"
            Details = "Only $foundConfigs/$($configFiles.Count) configuration files found"
        })
        Write-Host "    ⚠️  Configuration files: $foundConfigs/$($configFiles.Count) present" -ForegroundColor Yellow
    }
    
    # Test 2: Source Code Structure
    Write-Host "  ✓ Testing source code structure..." -ForegroundColor Green
    $sourceFiles = @("src\config\production-config-manager.ts", "src\config\production-security-policy.ts", "src\config\production-secrets-manager.ts")
    $foundSources = 0
    
    foreach ($sourceFile in $sourceFiles) {
        $sourcePath = Join-Path $DOCKER_COMPOSE_PATH $sourceFile
        if (Test-Path $sourcePath) {
            $foundSources++
        }
    }
    
    if ($foundSources -eq $sourceFiles.Count) {
        $null = $TEST_RESULTS.Add(@{
            Test = "Source_Files"
            Status = "PASS"
            Details = "All source files present"
        })
        Write-Host "    ✅ Source files: $foundSources/$($sourceFiles.Count) present" -ForegroundColor Green
    } else {
        $null = $TEST_RESULTS.Add(@{
            Test = "Source_Files"
            Status = "WARN"
            Details = "Only $foundSources/$($sourceFiles.Count) source files found"
        })
        Write-Host "    ⚠️  Source files: $foundSources/$($sourceFiles.Count) present" -ForegroundColor Yellow
    }
}

function Test-SecuritySetup {
    Write-Host "`n🔒 Testing Security Setup..." -ForegroundColor Yellow
    
    # Test 1: Dockerfile Security
    Write-Host "  ✓ Testing Dockerfile security..." -ForegroundColor Green
    $dockerfilePath = Join-Path $DOCKER_COMPOSE_PATH "Dockerfile"
    
    if (Test-Path $dockerfilePath) {
        $dockerfileContent = Get-Content $dockerfilePath -Raw
        
        $securityFeatures = 0
        if ($dockerfileContent -match "USER") { $securityFeatures++ }
        if ($dockerfileContent -match "RUN.*--no-install-recommends") { $securityFeatures++ }
        if ($dockerfileContent -match "FROM.*alpine") { $securityFeatures++ }
        
        if ($securityFeatures -ge 2) {
            $null = $TEST_RESULTS.Add(@{
                Test = "Dockerfile_Security"
                Status = "PASS"
                Details = "$securityFeatures security features implemented"
            })
            Write-Host "    ✅ Dockerfile security: $securityFeatures features implemented" -ForegroundColor Green
        } else {
            $null = $TEST_RESULTS.Add(@{
                Test = "Dockerfile_Security"
                Status = "WARN"
                Details = "Only $securityFeatures security features found"
            })
            Write-Host "    ⚠️  Dockerfile security: $securityFeatures features implemented" -ForegroundColor Yellow
        }
    }
    
    # Test 2: Environment Variables
    Write-Host "  ✓ Testing environment variable security..." -ForegroundColor Green
    $envExamplePath = Join-Path $DOCKER_COMPOSE_PATH ".env.example"
    
    if (Test-Path $envExamplePath) {
        $null = $TEST_RESULTS.Add(@{
            Test = "Environment_Template"
            Status = "PASS"
            Details = "Environment template present"
        })
        Write-Host "    ✅ Environment template: PRESENT" -ForegroundColor Green
    } else {
        $null = $TEST_RESULTS.Add(@{
            Test = "Environment_Template"
            Status = "WARN"
            Details = "No environment template found"
        })
        Write-Host "    ⚠️  Environment template: NOT FOUND" -ForegroundColor Yellow
    }
}

function Generate-TestReport {
    Write-Host "`n📊 Infrastructure Validation Summary" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    
    $passCount = ($TEST_RESULTS | Where-Object { $_.Status -eq "PASS" }).Count
    $warnCount = ($TEST_RESULTS | Where-Object { $_.Status -eq "WARN" }).Count
    $failCount = ($TEST_RESULTS | Where-Object { $_.Status -eq "FAIL" }).Count
    $totalTests = $TEST_RESULTS.Count
    
    Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
    Write-Host "✅ Passed: $passCount" -ForegroundColor Green
    Write-Host "⚠️  Warnings: $warnCount" -ForegroundColor Yellow
    Write-Host "❌ Failed: $failCount" -ForegroundColor Red
    
    $successRate = if ($totalTests -gt 0) { [math]::Round(($passCount / $totalTests) * 100, 1) } else { 0 }
    Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
    
    Write-Host "`n📋 Detailed Results:" -ForegroundColor White
    foreach ($result in $TEST_RESULTS) {
        $statusColor = switch ($result.Status) {
            "PASS" { "Green" }
            "WARN" { "Yellow" }
            "FAIL" { "Red" }
        }
        
        $statusIcon = switch ($result.Status) {
            "PASS" { "✅" }
            "WARN" { "⚠️ " }
            "FAIL" { "❌" }
        }
        
        Write-Host "  $statusIcon $($result.Test): $($result.Details)" -ForegroundColor $statusColor
    }
    
    # Infrastructure Readiness Assessment
    Write-Host "`n🎯 Infrastructure Readiness Assessment:" -ForegroundColor Cyan
    if ($successRate -ge 90) {
        Write-Host "  🌟 EXCELLENT - Production Ready" -ForegroundColor Green
    } elseif ($successRate -ge 80) {
        Write-Host "  ✅ GOOD - Minor improvements needed" -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "  ⚠️  FAIR - Several improvements needed" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ POOR - Major improvements required" -ForegroundColor Red
    }
    
    # Save report to file
    $reportPath = Join-Path $DOCKER_COMPOSE_PATH "infrastructure-validation-report.json"
    $reportData = @{
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        summary = @{
            totalTests = $totalTests
            passed = $passCount
            warnings = $warnCount
            failed = $failCount
            successRate = $successRate
        }
        results = $TEST_RESULTS
    }
    
    $reportData | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "`n💾 Validation report saved to: $reportPath" -ForegroundColor Blue
    
    return $successRate
}

# Main execution
try {
    $startTime = Get-Date
    
    Write-Host "Starting infrastructure validation..." -ForegroundColor Blue
    
    # Run all tests
    Test-TerraformConfiguration
    Test-DockerConfiguration
    Test-NginxConfiguration
    Test-ConfigurationFiles
    Test-SecuritySetup
    
    # Generate report
    $successRate = Generate-TestReport
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n⏱️  Validation completed in $([math]::Round($duration.TotalSeconds, 1)) seconds" -ForegroundColor Blue
    
    # Return appropriate exit code
    if ($successRate -ge 80) {
        Write-Host "`n🎉 Infrastructure validation completed successfully!" -ForegroundColor Green
        Write-Host "🚀 Ready for Phase 4 Week 1 completion!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n⚠️  Infrastructure validation completed with issues. Please review the results." -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "`n❌ Error during infrastructure validation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}
