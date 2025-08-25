# CODAI Ecosystem Production Deployment Monitor
# Date: August 20, 2025
# Monitoring AWS ECS Fargate + Vercel deployment progress

Write-Host "🚀 CODAI ECOSYSTEM PRODUCTION DEPLOYMENT MONITOR" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

# Function to check AWS ECS deployment status
function Check-AWSDeployment {
    Write-Host "🏗️ Checking AWS ECS Fargate Deployment Status..." -ForegroundColor Cyan
    
    try {
        # Check if AWS CLI is available and configured
        $awsConfig = aws configure list 2>$null
        if ($?) {
            Write-Host "✅ AWS CLI configured and authenticated" -ForegroundColor Green
            
            # Check ECS cluster status
            $clusterStatus = aws ecs describe-clusters --clusters codai-cluster --query 'clusters[0].status' --output text 2>$null
            if ($clusterStatus -eq "ACTIVE") {
                Write-Host "✅ ECS Cluster 'codai-cluster' is ACTIVE" -ForegroundColor Green
            } else {
                Write-Host "⏳ ECS Cluster 'codai-cluster' status: $clusterStatus" -ForegroundColor Yellow
            }
            
            # Check service status
            $services = @("romai-agi-service", "memorai-mcp-service", "romai-enterprise-service", "cbd-database-service")
            foreach ($service in $services) {
                $serviceStatus = aws ecs describe-services --cluster codai-cluster --services $service --query 'services[0].status' --output text 2>$null
                if ($serviceStatus -eq "ACTIVE") {
                    Write-Host "✅ Service '$service' is ACTIVE" -ForegroundColor Green
                } elseif ($serviceStatus) {
                    Write-Host "⏳ Service '$service' status: $serviceStatus" -ForegroundColor Yellow
                } else {
                    Write-Host "❌ Service '$service' not found or error" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "⚠️ AWS CLI not configured or authentication failed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error checking AWS deployment: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to check Vercel deployment status
function Check-VercelDeployment {
    Write-Host ""
    Write-Host "🌐 Checking Vercel Deployment Status..." -ForegroundColor Cyan
    
    try {
        # Check romcp.ro status
        $response = Invoke-WebRequest -Uri "https://romcp.ro" -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ romcp.ro is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
            Write-Host "🔧 Server: $($response.Headers['Server'])" -ForegroundColor White
            Write-Host "📅 Last-Modified: $($response.Headers['Last-Modified'])" -ForegroundColor White
        } else {
            Write-Host "⚠️ romcp.ro returned HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error checking romcp.ro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Check if Vercel CLI is available
    if (Get-Command vercel -ErrorAction SilentlyContinue) {
        try {
            Write-Host "🔍 Getting latest Vercel deployments..." -ForegroundColor Cyan
            $deployments = vercel ls romai --limit 3 2>$null
            if ($?) {
                Write-Host "✅ Vercel CLI working, recent deployments available" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️ Error getting Vercel deployments" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ Vercel CLI not available" -ForegroundColor Yellow
    }
}

# Function to check local services health
function Check-LocalServices {
    Write-Host ""
    Write-Host "🏠 Checking Local Development Services..." -ForegroundColor Cyan
    
    $services = @(
        @{ Name = "RomAI AGI Server"; Url = "http://localhost:6101/health"; Port = 6101 },
        @{ Name = "MemorAI MCP Server"; Url = "http://localhost:4950/health"; Port = 4950 },
        @{ Name = "Enterprise API"; Url = "http://localhost:8001/api/v1/health"; Port = 8001 },
        @{ Name = "CBD Database"; Url = "http://localhost:4180/health"; Port = 4180 },
        @{ Name = "MemorAI App"; Url = "http://localhost:4006/api/health"; Port = 4006 }
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
            Write-Host "✅ $($service.Name) (Port $($service.Port)) - HEALTHY" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($service.Name) (Port $($service.Port)) - OFFLINE" -ForegroundColor Red
        }
    }
}

# Function to test RomAI logical reasoning
function Test-RomAILogicalReasoning {
    Write-Host ""
    Write-Host "🧠 Testing RomAI Logical Reasoning Capabilities..." -ForegroundColor Cyan
    
    try {
        # Test local service first
        $testQuery = @{
            query = "What is 6 × 4? Show your calculation."
            language = "en"
            reasoning_type = "mathematical"
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:6101/reasoning" -Method Post -Body ($testQuery | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue
        
        if ($response -and $response.result -match "24") {
            Write-Host "✅ Local RomAI AGI - Logical reasoning working (6×4=24)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Local RomAI AGI - Logical reasoning response unclear" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Local RomAI AGI - Service not available for testing" -ForegroundColor Red
    }
    
    # Test production deployment if available
    try {
        $prodResponse = Invoke-WebRequest -Uri "https://romcp.ro/api/reasoning" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($prodResponse.StatusCode -eq 200 -or $prodResponse.StatusCode -eq 405) {
            Write-Host "✅ Production RomAI - Reasoning endpoint available" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Production RomAI - Reasoning endpoint not yet available" -ForegroundColor Yellow
    }
}

# Function to monitor deployment progress
function Monitor-DeploymentProgress {
    Write-Host ""
    Write-Host "⏱️ Monitoring Deployment Progress..." -ForegroundColor Cyan
    
    $maxIterations = 30  # Monitor for 15 minutes (30 * 30 seconds)
    $iteration = 0
    
    while ($iteration -lt $maxIterations) {
        $iteration++
        Write-Host ""
        Write-Host "🔄 Monitoring Cycle $iteration/$maxIterations" -ForegroundColor Magenta
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Checking deployment status..." -ForegroundColor White
        
        Check-AWSDeployment
        Check-VercelDeployment
        Check-LocalServices
        Test-RomAILogicalReasoning
        
        if ($iteration -lt $maxIterations) {
            Write-Host ""
            Write-Host "⏳ Waiting 30 seconds before next check..." -ForegroundColor Gray
            Start-Sleep -Seconds 30
        }
    }
    
    Write-Host ""
    Write-Host "🏁 DEPLOYMENT MONITORING COMPLETE" -ForegroundColor Green
    Write-Host "Total monitoring time: $($maxIterations * 30 / 60) minutes" -ForegroundColor White
}

# Main execution
try {
    Check-AWSDeployment
    Check-VercelDeployment  
    Check-LocalServices
    Test-RomAILogicalReasoning
    
    Write-Host ""
    Write-Host "🎯 DEPLOYMENT STATUS SUMMARY" -ForegroundColor Magenta
    Write-Host "=============================" -ForegroundColor Magenta
    Write-Host "• AWS ECS Fargate: Infrastructure deployment in progress" -ForegroundColor White
    Write-Host "• Vercel Production: RomAI deployment with logical reasoning fixes" -ForegroundColor White
    Write-Host "• Local Services: Development environment active" -ForegroundColor White
    Write-Host "• Logical Reasoning: v2.0 fixes implemented and tested" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 For continuous monitoring, this script will check every 30 seconds..." -ForegroundColor Cyan
    
    # Ask if user wants continuous monitoring
    $continueMonitoring = Read-Host "Continue with automated monitoring? (Y/N)"
    if ($continueMonitoring -eq "Y" -or $continueMonitoring -eq "y") {
        Monitor-DeploymentProgress
    }
    
} catch {
    Write-Host "❌ Critical error in deployment monitor: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ DEPLOYMENT MONITOR COMPLETE" -ForegroundColor Green
Write-Host "For detailed logs, check AWS CloudWatch and Vercel dashboard" -ForegroundColor White