# 🧪 CODAI Phase 5 Deployment Validation Script
# Comprehensive testing of domain configuration, security, and service authentication

param(
    [Parameter(Mandatory=$false)]
    [string]$WorkspaceFolder = "e:\GitHub\codai-project",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedReport
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Global test results
$TestResults = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Details = @()
}

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to add test result
function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message,
        [string]$Details = ""
    )
    
    if ($Passed) {
        Write-ColorOutput "✅ $TestName" "Green"
        $TestResults.Passed++
    } else {
        Write-ColorOutput "❌ $TestName - $Message" "Red"
        $TestResults.Failed++
    }
    
    $TestResults.Details += @{
        Name = $TestName
        Passed = $Passed
        Message = $Message
        Details = $Details
        Timestamp = Get-Date
    }
    
    if ($Verbose -and $Details) {
        Write-ColorOutput "   $Details" "Gray"
    }
}

# Function to add warning
function Add-Warning {
    param(
        [string]$TestName,
        [string]$Message
    )
    
    Write-ColorOutput "⚠️ $TestName - $Message" "Yellow"
    $TestResults.Warnings++
    
    $TestResults.Details += @{
        Name = $TestName
        Passed = $null
        Message = $Message
        Details = ""
        Timestamp = Get-Date
    }
}

# Function to test DNS resolution
function Test-DnsResolution {
    param([string]$Domain)
    
    try {
        $result = Resolve-DnsName -Name $Domain -ErrorAction Stop
        return $true, $result.IPAddress -join ", "
    } catch {
        return $false, $_.Exception.Message
    }
}

# Function to test HTTPS endpoint
function Test-HttpsEndpoint {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 30
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        return $true, $response.StatusCode, $response.Headers
    } catch {
        return $false, $_.Exception.Message, $null
    }
}

# Function to test API endpoint with authentication
function Test-ApiEndpoint {
    param(
        [string]$Url,
        [string]$ApiKey = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        if ($ApiKey) {
            $Headers["X-API-Key"] = $ApiKey
        }
        
        $response = Invoke-RestMethod -Uri $Url -Headers $Headers -TimeoutSec 30 -ErrorAction Stop
        return $true, $response, $null
    } catch {
        return $false, $null, $_.Exception.Message
    }
}

# Function to test AWS infrastructure
function Test-AwsInfrastructure {
    Write-ColorOutput "`n🏗️ Testing AWS Infrastructure..." "Cyan"
    
    # Test Route 53 hosted zone
    try {
        $hostedZone = aws route53 list-hosted-zones --query "HostedZones[?Name=='codai.ro.']" --output json | ConvertFrom-Json
        if ($hostedZone.Count -gt 0) {
            Add-TestResult "Route 53 Hosted Zone" $true "codai.ro hosted zone exists"
        } else {
            Add-TestResult "Route 53 Hosted Zone" $false "codai.ro hosted zone not found"
        }
    } catch {
        Add-TestResult "Route 53 Hosted Zone" $false "Failed to check hosted zone: $($_.Exception.Message)"
    }
    
    # Test ACM certificate
    try {
        $certificates = aws acm list-certificates --query "CertificateSummaryList[?DomainName=='*.codai.ro']" --output json | ConvertFrom-Json
        if ($certificates.Count -gt 0) {
            Add-TestResult "ACM SSL Certificate" $true "Wildcard certificate exists for *.codai.ro"
        } else {
            Add-TestResult "ACM SSL Certificate" $false "Wildcard certificate not found"
        }
    } catch {
        Add-TestResult "ACM SSL Certificate" $false "Failed to check certificate: $($_.Exception.Message)"
    }
    
    # Test CloudFront distribution
    try {
        $distributions = aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'codai.ro')]]" --output json | ConvertFrom-Json
        if ($distributions.Count -gt 0) {
            Add-TestResult "CloudFront Distribution" $true "Distribution exists for codai.ro domains"
        } else {
            Add-TestResult "CloudFront Distribution" $false "CloudFront distribution not found"
        }
    } catch {
        Add-TestResult "CloudFront Distribution" $false "Failed to check distribution: $($_.Exception.Message)"
    }
    
    # Test API Gateway
    try {
        $apis = aws apigatewayv2 get-apis --query "Items[?Name=='codai-api-gateway']" --output json | ConvertFrom-Json
        if ($apis.Count -gt 0) {
            Add-TestResult "API Gateway" $true "CODAI API Gateway exists"
        } else {
            Add-TestResult "API Gateway" $false "CODAI API Gateway not found"
        }
    } catch {
        Add-TestResult "API Gateway" $false "Failed to check API Gateway: $($_.Exception.Message)"
    }
    
    # Test ECS services
    try {
        $services = aws ecs list-services --cluster codai-cluster --output json | ConvertFrom-Json
        $serviceCount = $services.serviceArns.Count
        if ($serviceCount -ge 5) {
            Add-TestResult "ECS Services" $true "$serviceCount ECS services running"
        } else {
            Add-TestResult "ECS Services" $false "Expected 5+ services, found $serviceCount"
        }
    } catch {
        Add-TestResult "ECS Services" $false "Failed to check ECS services: $($_.Exception.Message)"
    }
}

# Function to test domain configuration
function Test-DomainConfiguration {
    Write-ColorOutput "`n🌐 Testing Domain Configuration..." "Cyan"
    
    $domains = @(
        "codai.ro",
        "www.codai.ro",
        "api.codai.ro",
        "admin.codai.ro",
        "apps.codai.ro",
        "gateway.codai.ro",
        "docs.codai.ro",
        "monitoring.codai.ro"
    )
    
    foreach ($domain in $domains) {
        $resolved, $details = Test-DnsResolution -Domain $domain
        Add-TestResult "DNS Resolution: $domain" $resolved $details
    }
}

# Function to test HTTPS endpoints
function Test-HttpsEndpoints {
    Write-ColorOutput "`n🔒 Testing HTTPS Endpoints..." "Cyan"
    
    $endpoints = @{
        "Main Site" = "https://codai.ro"
        "API Gateway" = "https://api.codai.ro/health"
        "Admin Panel" = "https://admin.codai.ro"
        "Apps Portal" = "https://apps.codai.ro"
        "Gateway Service" = "https://gateway.codai.ro"
        "Documentation" = "https://docs.codai.ro"
    }
    
    foreach ($endpoint in $endpoints.GetEnumerator()) {
        $success, $statusCode, $headers = Test-HttpsEndpoint -Url $endpoint.Value
        if ($success) {
            Add-TestResult "HTTPS: $($endpoint.Key)" $true "Status: $statusCode"
        } else {
            Add-TestResult "HTTPS: $($endpoint.Key)" $false $statusCode
        }
    }
}

# Function to test API security
function Test-ApiSecurity {
    Write-ColorOutput "`n🔐 Testing API Security..." "Cyan"
    
    # Test API Gateway without authentication (should fail)
    $success, $response, $error = Test-ApiEndpoint -Url "https://api.codai.ro/gateway"
    if (-not $success) {
        Add-TestResult "API Authentication Required" $true "Access denied without authentication"
    } else {
        Add-TestResult "API Authentication Required" $false "Unexpected access without authentication"
    }
    
    # Test health endpoint (should be public)
    $success, $response, $error = Test-ApiEndpoint -Url "https://api.codai.ro/health"
    if ($success) {
        Add-TestResult "Public Health Endpoint" $true "Health endpoint accessible"
    } else {
        Add-TestResult "Public Health Endpoint" $false "Health endpoint not accessible: $error"
    }
    
    # Test CORS headers
    try {
        $response = Invoke-WebRequest -Uri "https://api.codai.ro/health" -Method OPTIONS -UseBasicParsing
        $corsHeaders = $response.Headers | Where-Object { $_.Key -like "*Access-Control*" }
        if ($corsHeaders.Count -gt 0) {
            Add-TestResult "CORS Configuration" $true "CORS headers present"
        } else {
            Add-TestResult "CORS Configuration" $false "CORS headers missing"
        }
    } catch {
        Add-TestResult "CORS Configuration" $false "Failed to test CORS: $($_.Exception.Message)"
    }
}

# Function to test service authentication
function Test-ServiceAuthentication {
    Write-ColorOutput "`n🛡️ Testing Service Authentication..." "Cyan"
    
    # Test SSM parameters
    try {
        $jwtSecret = aws ssm get-parameter --name "/codai/services/jwt-secret" --output json 2>$null | ConvertFrom-Json
        if ($jwtSecret) {
            Add-TestResult "JWT Secret Parameter" $true "JWT secret stored in SSM"
        } else {
            Add-TestResult "JWT Secret Parameter" $false "JWT secret not found in SSM"
        }
    } catch {
        Add-TestResult "JWT Secret Parameter" $false "Failed to check JWT secret"
    }
    
    try {
        $serviceDiscovery = aws ssm get-parameter --name "/codai/services/discovery" --output json 2>$null | ConvertFrom-Json
        if ($serviceDiscovery) {
            Add-TestResult "Service Discovery Config" $true "Service discovery config in SSM"
        } else {
            Add-TestResult "Service Discovery Config" $false "Service discovery config not found"
        }
    } catch {
        Add-TestResult "Service Discovery Config" $false "Failed to check service discovery config"
    }
    
    # Test Lambda authorizers
    try {
        $lambdaFunctions = aws lambda list-functions --query "Functions[?contains(FunctionName, 'codai')]" --output json | ConvertFrom-Json
        $authorizerCount = ($lambdaFunctions | Where-Object { $_.FunctionName -like "*authorizer*" }).Count
        if ($authorizerCount -gt 0) {
            Add-TestResult "Lambda Authorizers" $true "$authorizerCount authorizer functions deployed"
        } else {
            Add-TestResult "Lambda Authorizers" $false "No authorizer functions found"
        }
    } catch {
        Add-TestResult "Lambda Authorizers" $false "Failed to check Lambda functions"
    }
}

# Function to test load balancer configuration
function Test-LoadBalancer {
    Write-ColorOutput "`n⚖️ Testing Load Balancer Configuration..." "Cyan"
    
    try {
        $loadBalancers = aws elbv2 describe-load-balancers --query "LoadBalancers[?LoadBalancerName=='codai-main-alb']" --output json | ConvertFrom-Json
        if ($loadBalancers.Count -gt 0) {
            $albDns = $loadBalancers[0].DNSName
            Add-TestResult "Application Load Balancer" $true "ALB exists: $albDns"
            
            # Test HTTPS listener
            $listeners = aws elbv2 describe-listeners --load-balancer-arn $loadBalancers[0].LoadBalancerArn --output json | ConvertFrom-Json
            $httpsListener = $listeners.Listeners | Where-Object { $_.Port -eq 443 }
            if ($httpsListener) {
                Add-TestResult "HTTPS Listener" $true "HTTPS listener configured on port 443"
            } else {
                Add-TestResult "HTTPS Listener" $false "HTTPS listener not found"
            }
            
            # Test HTTP redirect
            $httpListener = $listeners.Listeners | Where-Object { $_.Port -eq 80 }
            if ($httpListener -and $httpListener.DefaultActions[0].Type -eq "redirect") {
                Add-TestResult "HTTP to HTTPS Redirect" $true "HTTP redirects to HTTPS"
            } else {
                Add-TestResult "HTTP to HTTPS Redirect" $false "HTTP redirect not configured"
            }
            
        } else {
            Add-TestResult "Application Load Balancer" $false "ALB not found"
        }
    } catch {
        Add-TestResult "Application Load Balancer" $false "Failed to check ALB: $($_.Exception.Message)"
    }
}

# Function to test monitoring and logging
function Test-MonitoringAndLogging {
    Write-ColorOutput "`n📊 Testing Monitoring and Logging..." "Cyan"
    
    # Test CloudWatch log groups
    try {
        $logGroups = aws logs describe-log-groups --query "logGroups[?contains(logGroupName, 'codai')]" --output json | ConvertFrom-Json
        if ($logGroups.Count -gt 0) {
            Add-TestResult "CloudWatch Log Groups" $true "$($logGroups.Count) log groups found"
        } else {
            Add-TestResult "CloudWatch Log Groups" $false "No CODAI log groups found"
        }
    } catch {
        Add-TestResult "CloudWatch Log Groups" $false "Failed to check log groups"
    }
    
    # Test DynamoDB tables
    try {
        $tables = aws dynamodb list-tables --query "TableNames[?contains(@, 'codai')]" --output json | ConvertFrom-Json
        if ($tables.Count -gt 0) {
            Add-TestResult "DynamoDB Tables" $true "$($tables.Count) tables found"
        } else {
            Add-TestResult "DynamoDB Tables" $false "No CODAI DynamoDB tables found"
        }
    } catch {
        Add-TestResult "DynamoDB Tables" $false "Failed to check DynamoDB tables"
    }
}

# Function to generate detailed report
function New-DetailedReport {
    $reportPath = Join-Path $WorkspaceFolder "PHASE_5_VALIDATION_REPORT.md"
    
    $report = @"
# 🧪 CODAI Phase 5 Deployment Validation Report

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")
**Workspace**: $WorkspaceFolder

## Summary

- ✅ **Tests Passed**: $($TestResults.Passed)
- ❌ **Tests Failed**: $($TestResults.Failed)
- ⚠️ **Warnings**: $($TestResults.Warnings)
- 📊 **Total Tests**: $($TestResults.Passed + $TestResults.Failed)
- 🎯 **Success Rate**: $(if (($TestResults.Passed + $TestResults.Failed) -gt 0) { [math]::Round(($TestResults.Passed / ($TestResults.Passed + $TestResults.Failed)) * 100, 2) } else { 0 })%

## Detailed Results

"@

    foreach ($result in $TestResults.Details) {
        $status = if ($result.Passed -eq $true) { "✅ PASS" } elseif ($result.Passed -eq $false) { "❌ FAIL" } else { "⚠️ WARN" }
        $report += @"

### $($result.Name)
- **Status**: $status
- **Message**: $($result.Message)
- **Timestamp**: $($result.Timestamp)
$(if ($result.Details) { "- **Details**: $($result.Details)" })

"@
    }
    
    $report += @"

## Recommendations

$(if ($TestResults.Failed -gt 0) {
"### Failed Tests
- Review failed tests and fix underlying issues
- Check AWS CloudWatch logs for detailed error messages
- Verify Terraform state and re-apply if necessary
"
})

$(if ($TestResults.Warnings -gt 0) {
"### Warnings
- Address warning conditions for optimal performance
- Monitor mentioned components for potential issues
"
})

### Next Steps
1. **Domain Configuration**: Update DNS settings at your domain registrar
2. **Security Testing**: Perform penetration testing on API endpoints
3. **Performance Testing**: Run load tests on all services
4. **Monitoring Setup**: Configure alerting rules in CloudWatch
5. **Documentation**: Update API documentation with new endpoints

## Infrastructure Endpoints

- **Main Site**: https://codai.ro
- **API Gateway**: https://api.codai.ro
- **Admin Panel**: https://admin.codai.ro
- **Apps Portal**: https://apps.codai.ro
- **Gateway Service**: https://gateway.codai.ro
- **Documentation**: https://docs.codai.ro
- **Monitoring**: https://monitoring.codai.ro

---

*Report generated by CODAI Phase 5 Validation Script*
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-ColorOutput "`n📄 Detailed report saved to: $reportPath" "Green"
}

# Main execution
try {
    Write-ColorOutput "🧪 Starting CODAI Phase 5 Deployment Validation" "Cyan"
    Write-ColorOutput "===============================================" "Gray"
    
    # Test AWS CLI availability
    try {
        aws --version | Out-Null
        Write-ColorOutput "✅ AWS CLI available" "Green"
    } catch {
        Write-ColorOutput "❌ AWS CLI not available. Please install AWS CLI to run validation." "Red"
        exit 1
    }
    
    # Run all tests
    Test-AwsInfrastructure
    Test-DomainConfiguration
    Test-HttpsEndpoints
    Test-ApiSecurity
    Test-ServiceAuthentication
    Test-LoadBalancer
    Test-MonitoringAndLogging
    
    # Summary
    Write-ColorOutput "`n🎯 Validation Summary" "Cyan"
    Write-ColorOutput "===================" "Gray"
    Write-ColorOutput "✅ Tests Passed: $($TestResults.Passed)" "Green"
    Write-ColorOutput "❌ Tests Failed: $($TestResults.Failed)" "Red"
    Write-ColorOutput "⚠️ Warnings: $($TestResults.Warnings)" "Yellow"
    
    $totalTests = $TestResults.Passed + $TestResults.Failed
    if ($totalTests -gt 0) {
        $successRate = [math]::Round(($TestResults.Passed / $totalTests) * 100, 2)
        Write-ColorOutput "🎯 Success Rate: $successRate%" "Cyan"
    }
    
    # Generate detailed report if requested
    if ($DetailedReport) {
        New-DetailedReport
    }
    
    # Final status
    if ($TestResults.Failed -eq 0) {
        Write-ColorOutput "`n🎉 Phase 5 validation completed successfully!" "Green"
        Write-ColorOutput "All critical systems are operational." "Green"
    } else {
        Write-ColorOutput "`n⚠️ Phase 5 validation completed with issues." "Yellow"
        Write-ColorOutput "Please review failed tests and address issues." "Yellow"
    }
    
} catch {
    Write-ColorOutput "`n❌ Validation error: $($_.Exception.Message)" "Red"
    if ($Verbose) {
        Write-ColorOutput "Stack trace: $($_.ScriptStackTrace)" "Red"
    }
    exit 1
}
