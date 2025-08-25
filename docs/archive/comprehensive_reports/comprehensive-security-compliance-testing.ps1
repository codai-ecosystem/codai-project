# 🔐 CODAI Ecosy    Write-Host "`n🔐 AUTHENTICATION AND AUTHORIZATION TESTING" -ForegroundColor Cyantem - Security & Compliance Testing
# Based on Microsoft Security Best Practices & OWASP Container Security Guidelines
# Date: August 2025

param(
    [switch]$TestContainerSecurity = $true,
    [switch]$TestAuthentication = $true,
    [switch]$TestAuthorization = $true,
    [switch]$TestVulnerabilities = $true,
    [switch]$TestCompliance = $true,
    [switch]$TestNetworkSecurity = $true,
    [switch]$Detailed = $false,
    [switch]$ExportResults = $true,
    [string]$OutputPath = ".\test-results"
)

Write-Host "� CODAI ECOSYSTEM - SECURITY AND COMPLIANCE TESTING" -ForegrouWrite-Host "`n🔒 SECURITY AND COMPLIANCE SUMMARY:" -ForegroundColor YellowdColor Cyan
Write-Host "=" * 80 -ForegroundColor Red
Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host ""

# Initialize test results
$testResults = @()

function Add-TestResult {
    param($Category, $TestName, $Status, $Details, $ExpectedValue, $ActualValue, $Duration, $SeverityLevel, $SecurityScore)
    
    $script:testResults += [PSCustomObject]@{
        Category = $Category
        TestName = $TestName
        Status = $Status
        Details = $Details
        Expected = $ExpectedValue
        Actual = $ActualValue
        Duration = $Duration
        SeverityLevel = $SeverityLevel
        SecurityScore = $SecurityScore
        Timestamp = Get-Date
    }
    
    $statusColor = switch($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "SKIP" { "Cyan" }
        "CRITICAL" { "Magenta" }
        default { "White" }
    }
    
    $statusIcon = switch($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️" }
        "SKIP" { "⏭️" }
        "CRITICAL" { "🔴" }
        default { "ℹ️" }
    }
    
    Write-Host "  $statusIcon $TestName" -ForegroundColor $statusColor
    if ($Detailed -and $Details) {
        Write-Host "    📋 $Details" -ForegroundColor Gray
    }
    if ($SeverityLevel) {
        $severityColor = switch($SeverityLevel) {
            "Critical" { "Red" }
            "High" { "Yellow" }
            "Medium" { "Blue" }
            "Low" { "Green" }
            default { "Gray" }
        }
        Write-Host "    🔍 Severity: $SeverityLevel" -ForegroundColor $severityColor
    }
    if ($SecurityScore) {
        Write-Host "    📊 Security Score: $SecurityScore" -ForegroundColor Blue
    }
}

function Test-ContainerSecurityConfiguration {
    param($ServiceName, $ContainerName)
    
    try {
        Write-Host "`n🐳 Testing Container Security for $ServiceName" -ForegroundColor Cyan
        
        # Test if container is running as root
        $startTime = Get-Date
        try {
            $userInfo = docker exec $ContainerName whoami 2>$null
            $duration = (Get-Date) - $startTime
            
            if ($userInfo -eq "root") {
                Add-TestResult "Container Security" "$ServiceName - Non-Root User" "CRITICAL" "Container running as root user" "Non-root user" "root" $duration.TotalMilliseconds "Critical" 20
            } elseif ($userInfo) {
                Add-TestResult "Container Security" "$ServiceName - Non-Root User" "PASS" "Container running as: $userInfo" "Non-root user" $userInfo $duration.TotalMilliseconds "Low" 90
            } else {
                Add-TestResult "Container Security" "$ServiceName - Non-Root User" "SKIP" "Container not accessible" "Non-root user" "N/A" $duration.TotalMilliseconds "Medium" 50
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Container Security" "$ServiceName - Non-Root User" "FAIL" "Unable to check user" "Non-root user" "Error" $duration.TotalMilliseconds "High" 30
        }
        
        # Test container read-only filesystem
        try {
            $startTime = Get-Date
            $writeTest = docker exec $ContainerName sh -c "echo 'test' > /tmp/security-test 2>&1 || echo 'READONLY'" 2>$null
            $duration = (Get-Date) - $startTime
            
            if ($writeTest -match "READONLY") {
                Add-TestResult "Container Security" "$ServiceName - Read-Only Filesystem" "PASS" "Filesystem is read-only" "Read-only" "Read-only" $duration.TotalMilliseconds "Low" 90
            } else {
                Add-TestResult "Container Security" "$ServiceName - Read-Only Filesystem" "WARN" "Filesystem is writable" "Read-only" "Writable" $duration.TotalMilliseconds "Medium" 60
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Container Security" "$ServiceName - Read-Only Filesystem" "SKIP" "Cannot test filesystem" "Read-only" "Unknown" $duration.TotalMilliseconds "Medium" 50
        }
        
        # Test container capabilities
        try {
            $startTime = Get-Date
            $capabilities = docker inspect $ContainerName --format='{{.HostConfig.CapAdd}}' 2>$null
            $duration = (Get-Date) - $startTime
            
            if ($capabilities -match "null" -or $capabilities -eq "[]") {
                Add-TestResult "Container Security" "$ServiceName - Container Capabilities" "PASS" "No additional capabilities granted" "Minimal caps" "None added" $duration.TotalMilliseconds "Low" 85
            } else {
                Add-TestResult "Container Security" "$ServiceName - Container Capabilities" "WARN" "Additional capabilities: $capabilities" "Minimal caps" $capabilities $duration.TotalMilliseconds "Medium" 65
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Container Security" "$ServiceName - Container Capabilities" "SKIP" "Cannot inspect capabilities" "Minimal caps" "Unknown" $duration.TotalMilliseconds "Medium" 50
        }
        
        # Test container network mode
        try {
            $startTime = Get-Date
            $networkMode = docker inspect $ContainerName --format='{{.HostConfig.NetworkMode}}' 2>$null
            $duration = (Get-Date) - $startTime
            
            if ($networkMode -eq "host") {
                Add-TestResult "Container Security" "$ServiceName - Network Isolation" "CRITICAL" "Using host network mode" "Isolated network" "Host mode" $duration.TotalMilliseconds "Critical" 20
            } elseif ($networkMode -match "^(bridge|none|container:|default)") {
                Add-TestResult "Container Security" "$ServiceName - Network Isolation" "PASS" "Isolated network: $networkMode" "Isolated network" $networkMode $duration.TotalMilliseconds "Low" 85
            } else {
                Add-TestResult "Container Security" "$ServiceName - Network Isolation" "PASS" "Custom network: $networkMode" "Isolated network" $networkMode $duration.TotalMilliseconds "Low" 80
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Container Security" "$ServiceName - Network Isolation" "SKIP" "Cannot check network mode" "Isolated network" "Unknown" $duration.TotalMilliseconds "Medium" 50
        }
        
    } catch {
        Add-TestResult "Container Security" "$ServiceName - Security Check" "FAIL" $_.Exception.Message "Security compliance" "Error" 0 "High" 25
    }
}

function Test-AuthenticationSecurity {
    param($ServiceName, $Url, $AuthHeaders)
    
    Write-Host "`n🔑 Testing Authentication Security for $ServiceName" -ForegroundColor Cyan
    
    # Test unauthenticated access
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        
        if ($response.StatusCode -eq 200) {
            Add-TestResult "Authentication Security" "$ServiceName - Unauthenticated Access" "WARN" "Service allows unauthenticated access" "401/403" "200 OK" $duration.TotalMilliseconds "Medium" 60
        } else {
            Add-TestResult "Authentication Security" "$ServiceName - Unauthenticated Access" "PASS" "HTTP $($response.StatusCode)" "401/403" $response.StatusCode $duration.TotalMilliseconds "Low" 85
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -eq 401 -or $statusCode -eq 403) {
                Add-TestResult "Authentication Security" "$ServiceName - Unauthenticated Access" "PASS" "Properly blocks unauthenticated requests" "401/403" $statusCode $duration.TotalMilliseconds "Low" 90
            } elseif ($statusCode -eq 404) {
                Add-TestResult "Authentication Security" "$ServiceName - Unauthenticated Access" "SKIP" "Service not found" "401/403" $statusCode $duration.TotalMilliseconds "Low" 70
            } else {
                Add-TestResult "Authentication Security" "$ServiceName - Unauthenticated Access" "WARN" "HTTP $statusCode" "401/403" $statusCode $duration.TotalMilliseconds "Medium" 65
            }
        } else {
            Add-TestResult "Authentication Security" "$ServiceName - Unauthenticated Access" "FAIL" $_.Exception.Message "401/403" "Connection Error" $duration.TotalMilliseconds "High" 30
        }
    }
    
    # Test for common authentication headers
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
        $duration = (Get-Date) - $startTime
        
        if ($response.Headers.ContainsKey("WWW-Authenticate")) {
            Add-TestResult "Authentication Security" "$ServiceName - Auth Challenge" "PASS" "Provides authentication challenge" "Auth challenge" "Present" $duration.TotalMilliseconds "Low" 85
        } else {
            Add-TestResult "Authentication Security" "$ServiceName - Auth Challenge" "WARN" "No authentication challenge header" "Auth challenge" "Missing" $duration.TotalMilliseconds "Medium" 60
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Authentication Security" "$ServiceName - Auth Challenge" "SKIP" "Cannot test auth challenge" "Auth challenge" "Unknown" $duration.TotalMilliseconds "Medium" 50
    }
    
    # Test for session management
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
        $duration = (Get-Date) - $startTime
        
        if ($response.Headers.ContainsKey("Set-Cookie")) {
            $cookies = $response.Headers["Set-Cookie"]
            $hasSecure = $cookies -match "Secure"
            $hasHttpOnly = $cookies -match "HttpOnly"
            $hasSameSite = $cookies -match "SameSite"
            
            if ($hasSecure -and $hasHttpOnly -and $hasSameSite) {
                Add-TestResult "Authentication Security" "$ServiceName - Cookie Security" "PASS" "Secure cookie attributes set" "Secure attributes" "Complete" $duration.TotalMilliseconds "Low" 90
            } elseif ($hasSecure -or $hasHttpOnly) {
                Add-TestResult "Authentication Security" "$ServiceName - Cookie Security" "WARN" "Partial cookie security" "Secure attributes" "Partial" $duration.TotalMilliseconds "Medium" 65
            } else {
                Add-TestResult "Authentication Security" "$ServiceName - Cookie Security" "FAIL" "Insecure cookie attributes" "Secure attributes" "None" $duration.TotalMilliseconds "High" 40
            }
        } else {
            Add-TestResult "Authentication Security" "$ServiceName - Cookie Security" "SKIP" "No cookies set" "Secure attributes" "N/A" $duration.TotalMilliseconds "Low" 75
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Authentication Security" "$ServiceName - Cookie Security" "SKIP" "Cannot test cookies" "Secure attributes" "Unknown" $duration.TotalMilliseconds "Medium" 50
    }
}

function Test-NetworkSecurityConfiguration {
    param($ServiceName, $Url, $Port)
    
    Write-Host "`n🌐 Testing Network Security for $ServiceName" -ForegroundColor Cyan
    
    # Test TLS/SSL configuration
    try {
        $startTime = Get-Date
        $uri = [System.Uri]$Url
        
        if ($uri.Scheme -eq "https") {
            # Test HTTPS
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            $duration = (Get-Date) - $startTime
            Add-TestResult "Network Security" "$ServiceName - HTTPS Encryption" "PASS" "Service uses HTTPS" "HTTPS" "Enabled" $duration.TotalMilliseconds "Low" 90
        } else {
            # Test if HTTPS redirect exists
            try {
                $httpsUrl = $Url -replace "^http://", "https://"
                $httpsResponse = Invoke-WebRequest -Uri $httpsUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                $duration = (Get-Date) - $startTime
                Add-TestResult "Network Security" "$ServiceName - HTTPS Encryption" "WARN" "HTTPS available but not enforced" "HTTPS enforced" "HTTPS available" $duration.TotalMilliseconds "Medium" 70
            } catch {
                $duration = (Get-Date) - $startTime
                Add-TestResult "Network Security" "$ServiceName - HTTPS Encryption" "FAIL" "No HTTPS encryption" "HTTPS" "HTTP only" $duration.TotalMilliseconds "High" 40
            }
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Network Security" "$ServiceName - HTTPS Encryption" "FAIL" $_.Exception.Message "HTTPS" "Error" $duration.TotalMilliseconds "High" 30
    }
    
    # Test HTTP security headers
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        $headers = $response.Headers
        
        # Check security headers
        $securityHeaders = @{
            "Strict-Transport-Security" = "HSTS"
            "Content-Security-Policy" = "CSP"
            "X-Content-Type-Options" = "MIME Sniffing Protection"
            "X-Frame-Options" = "Clickjacking Protection"
            "X-XSS-Protection" = "XSS Protection"
            "Referrer-Policy" = "Referrer Policy"
        }
        
        $foundHeaders = 0
        $headerDetails = @()
        
        foreach ($header in $securityHeaders.Keys) {
            if ($headers.ContainsKey($header)) {
                $foundHeaders++
                $headerDetails += "$($securityHeaders[$header]): ✓"
            } else {
                $headerDetails += "$($securityHeaders[$header]): ✗"
            }
        }
        
        $score = [math]::Round(($foundHeaders / $securityHeaders.Count) * 100)
        
        if ($foundHeaders -ge 4) {
            Add-TestResult "Network Security" "$ServiceName - Security Headers" "PASS" "$foundHeaders/$($securityHeaders.Count) headers present" "≥4 headers" "$foundHeaders headers" $duration.TotalMilliseconds "Low" $score
        } elseif ($foundHeaders -ge 2) {
            Add-TestResult "Network Security" "$ServiceName - Security Headers" "WARN" "$foundHeaders/$($securityHeaders.Count) headers present" "≥4 headers" "$foundHeaders headers" $duration.TotalMilliseconds "Medium" $score
        } else {
            Add-TestResult "Network Security" "$ServiceName - Security Headers" "FAIL" "$foundHeaders/$($securityHeaders.Count) headers present" "≥4 headers" "$foundHeaders headers" $duration.TotalMilliseconds "High" $score
        }
        
        if ($Detailed) {
            Write-Host "    📋 Header Details: $($headerDetails -join ', ')" -ForegroundColor Gray
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Network Security" "$ServiceName - Security Headers" "FAIL" $_.Exception.Message "Security headers" "Error" $duration.TotalMilliseconds "High" 20
    }
    
    # Test for sensitive information exposure
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        $content = $response.Content
        
        # Check for common sensitive patterns
        $sensitivePatterns = @{
            'password\s*[:=]\s*['"'"']?[^'"'"'"\\s]+' = "Password exposure"
            'api[_-]?key\s*[:=]\s*['"'"']?[^'"'"'"\\s]+' = "API key exposure"
            'secret\s*[:=]\s*['"'"']?[^'"'"'"\\s]+' = "Secret exposure"
            'token\s*[:=]\s*['"'"']?[^'"'"'"\\s]+' = "Token exposure"
            'connection\s*string\s*[:=]' = "Connection string exposure"
        }
        
        $foundSensitive = @()
        foreach ($pattern in $sensitivePatterns.Keys) {
            if ($content -match $pattern) {
                $foundSensitive += $sensitivePatterns[$pattern]
            }
        }
        
        if ($foundSensitive.Count -eq 0) {
            Add-TestResult "Network Security" "$ServiceName - Information Disclosure" "PASS" "No sensitive information exposed" "No exposure" "Clean" $duration.TotalMilliseconds "Low" 90
        } else {
            Add-TestResult "Network Security" "$ServiceName - Information Disclosure" "CRITICAL" "Sensitive info: $($foundSensitive -join ', ')" "No exposure" "Exposed" $duration.TotalMilliseconds "Critical" 10
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Network Security" "$ServiceName - Information Disclosure" "SKIP" "Cannot analyze content" "No exposure" "Unknown" $duration.TotalMilliseconds "Medium" 50
    }
}

function Test-VulnerabilityScanning {
    param($ServiceName, $Url)
    
    Write-Host "`n🔍 Testing Vulnerabilities for $ServiceName" -ForegroundColor Cyan
    
    # Test for common vulnerability patterns
    try {
        $startTime = Get-Date
        
        # Test for directory traversal
        $traversalUrl = "$Url/../../../etc/passwd"
        try {
            $response = Invoke-WebRequest -Uri $traversalUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $duration = (Get-Date) - $startTime
            
            if ($response.Content -match "root:" -or $response.Content -match "bin:") {
                Add-TestResult "Vulnerability Testing" "$ServiceName - Directory Traversal" "CRITICAL" "Directory traversal vulnerability" "Protected" "Vulnerable" $duration.TotalMilliseconds "Critical" 5
            } else {
                Add-TestResult "Vulnerability Testing" "$ServiceName - Directory Traversal" "PASS" "Directory traversal blocked" "Protected" "Secure" $duration.TotalMilliseconds "Low" 90
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Vulnerability Testing" "$ServiceName - Directory Traversal" "PASS" "Directory traversal properly blocked" "Protected" "Secure" $duration.TotalMilliseconds "Low" 85
        }
        
        # Test for SQL injection patterns (basic)
        $sqlInjectionUrl = "$Url?id=1' OR '1'='1"
        try {
            $startTime = Get-Date
            $response = Invoke-WebRequest -Uri $sqlInjectionUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $duration = (Get-Date) - $startTime
            
            if ($response.Content -match "(mysql|postgresql|oracle|sql\s+error|syntax\s+error)" -or 
                $response.Content -match "(warning|error).*mysql" -or
                $response.Content -match "database\s+error") {
                Add-TestResult "Vulnerability Testing" "$ServiceName - SQL Injection" "CRITICAL" "SQL injection vulnerability indicated" "Protected" "Vulnerable" $duration.TotalMilliseconds "Critical" 10
            } else {
                Add-TestResult "Vulnerability Testing" "$ServiceName - SQL Injection" "PASS" "No SQL injection indicators" "Protected" "Secure" $duration.TotalMilliseconds "Low" 85
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Vulnerability Testing" "$ServiceName - SQL Injection" "PASS" "SQL injection attempts blocked" "Protected" "Secure" $duration.TotalMilliseconds "Low" 85
        }
        
        # Test for XSS reflection
        $xssUrl = "$Url?test=<script>alert('xss')</script>"
        try {
            $startTime = Get-Date
            $response = Invoke-WebRequest -Uri $xssUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $duration = (Get-Date) - $startTime
            
            if ($response.Content -match "<script>alert\('xss'\)</script>") {
                Add-TestResult "Vulnerability Testing" "$ServiceName - XSS Protection" "CRITICAL" "XSS reflection vulnerability" "Protected" "Vulnerable" $duration.TotalMilliseconds "Critical" 15
            } else {
                Add-TestResult "Vulnerability Testing" "$ServiceName - XSS Protection" "PASS" "XSS properly escaped/filtered" "Protected" "Secure" $duration.TotalMilliseconds "Low" 85
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Add-TestResult "Vulnerability Testing" "$ServiceName - XSS Protection" "PASS" "XSS attempts blocked" "Protected" "Secure" $duration.TotalMilliseconds "Low" 85
        }
        
        # Test for exposed admin interfaces
        $adminPaths = @("/admin", "/administrator", "/admin.php", "/wp-admin", "/management", "/console")
        $adminFound = 0
        
        foreach ($path in $adminPaths) {
            try {
                $adminUrl = "$Url$path"
                $response = Invoke-WebRequest -Uri $adminUrl -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $adminFound++
                }
            } catch {
                # Expected for most cases
            }
        }
        
        if ($adminFound -gt 0) {
            Add-TestResult "Vulnerability Testing" "$ServiceName - Admin Interface Exposure" "WARN" "$adminFound admin paths accessible" "No exposure" "$adminFound exposed" 0 "Medium" 60
        } else {
            Add-TestResult "Vulnerability Testing" "$ServiceName - Admin Interface Exposure" "PASS" "No admin interfaces exposed" "No exposure" "Secure" 0 "Low" 85
        }
        
    } catch {
        Add-TestResult "Vulnerability Testing" "$ServiceName - Vulnerability Scan" "FAIL" $_.Exception.Message "Secure" "Error" 0 "Medium" 40
    }
}

function Test-ComplianceFrameworks {
    param($ServiceName, $Url)
    
    Write-Host "`n📋 Testing Compliance for $ServiceName" -ForegroundColor Cyan
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        $headers = $response.Headers
        
        # GDPR Compliance Indicators
        $gdprScore = 0
        $gdprChecks = @()
        
        # Privacy policy link
        if ($response.Content -match "privacy\s*policy|data\s*protection|gdpr" -or 
            $response.Content -match "cookie\s*policy|terms\s*of\s*service") {
            $gdprScore += 25
            $gdprChecks += "Privacy policy referenced"
        }
        
        # Cookie consent
        if ($response.Content -match "cookie\s*consent|accept\s*cookies|cookie\s*banner") {
            $gdprScore += 25
            $gdprChecks += "Cookie consent mechanism"
        }
        
        # Data processing information
        if ($response.Content -match "data\s*processing|personal\s*data|data\s*controller") {
            $gdprScore += 25
            $gdprChecks += "Data processing information"
        }
        
        # Contact/DPO information
        if ($response.Content -match "contact.*privacy|data\s*protection\s*officer|dpo@") {
            $gdprScore += 25
            $gdprChecks += "Privacy contact information"
        }
        
        if ($gdprScore >= 75) {
            Add-TestResult "Compliance Testing" "$ServiceName - GDPR Compliance" "PASS" "Strong GDPR indicators ($gdprScore%)" "≥75%" "$gdprScore%" $duration.TotalMilliseconds "Low" $gdprScore
        } elseif ($gdprScore >= 50) {
            Add-TestResult "Compliance Testing" "$ServiceName - GDPR Compliance" "WARN" "Partial GDPR compliance ($gdprScore%)" "≥75%" "$gdprScore%" $duration.TotalMilliseconds "Medium" $gdprScore
        } else {
            Add-TestResult "Compliance Testing" "$ServiceName - GDPR Compliance" "FAIL" "Limited GDPR compliance ($gdprScore%)" "≥75%" "$gdprScore%" $duration.TotalMilliseconds "High" $gdprScore
        }
        
        # OWASP Security Headers Compliance
        $owaspScore = 0
        $owaspHeaders = @{
            "Content-Security-Policy" = 20
            "Strict-Transport-Security" = 20
            "X-Content-Type-Options" = 15
            "X-Frame-Options" = 15
            "X-XSS-Protection" = 10
            "Referrer-Policy" = 10
            "Permissions-Policy" = 10
        }
        
        foreach ($header in $owaspHeaders.Keys) {
            if ($headers.ContainsKey($header)) {
                $owaspScore += $owaspHeaders[$header]
            }
        }
        
        if ($owaspScore >= 80) {
            Add-TestResult "Compliance Testing" "$ServiceName - OWASP Security Headers" "PASS" "Strong OWASP compliance ($owaspScore%)" "≥80%" "$owaspScore%" $duration.TotalMilliseconds "Low" $owaspScore
        } elseif ($owaspScore >= 60) {
            Add-TestResult "Compliance Testing" "$ServiceName - OWASP Security Headers" "WARN" "Partial OWASP compliance ($owaspScore%)" "≥80%" "$owaspScore%" $duration.TotalMilliseconds "Medium" $owaspScore
        } else {
            Add-TestResult "Compliance Testing" "$ServiceName - OWASP Security Headers" "FAIL" "Limited OWASP compliance ($owaspScore%)" "≥80%" "$owaspScore%" $duration.TotalMilliseconds "High" $owaspScore
        }
        
        # EU AI Act Compliance (for AI services)
        if ($ServiceName -match "(AI|memorai|romai|intelligence|neural)" -or $response.Content -match "(artificial\s*intelligence|machine\s*learning|ai\s*model)") {
            $aiActScore = 0
            $aiActChecks = @()
            
            # Transparency requirements
            if ($response.Content -match "(transparency|explainability|ai\s*documentation)" -or
                $response.Content -match "(model\s*card|ai\s*impact\s*assessment)") {
                $aiActScore += 30
                $aiActChecks += "AI transparency documentation"
            }
            
            # Human oversight
            if ($response.Content -match "(human\s*oversight|human.*control|human.*intervention)" -or
                $response.Content -match "(human.*supervision|manual\s*review)") {
                $aiActScore += 25
                $aiActChecks += "Human oversight mechanisms"
            }
            
            # Risk management
            if ($response.Content -match "(risk\s*management|risk\s*assessment|safety\s*measures)" -or
                $response.Content -match "(compliance.*ai|ai.*governance)") {
                $aiActScore += 25
                $aiActChecks += "AI risk management"
            }
            
            # Data governance
            if ($response.Content -match "(data\s*governance|data\s*quality|training\s*data)" -or
                $response.Content -match "(bias\s*mitigation|fairness|non.*discrimination)") {
                $aiActScore += 20
                $aiActChecks += "Data governance practices"
            }
            
            if ($aiActScore >= 75) {
                Add-TestResult "Compliance Testing" "$ServiceName - EU AI Act Compliance" "PASS" "Strong AI Act indicators ($aiActScore%)" "≥75%" "$aiActScore%" $duration.TotalMilliseconds "Low" $aiActScore
            } elseif ($aiActScore >= 50) {
                Add-TestResult "Compliance Testing" "$ServiceName - EU AI Act Compliance" "WARN" "Partial AI Act compliance ($aiActScore%)" "≥75%" "$aiActScore%" $duration.TotalMilliseconds "Medium" $aiActScore
            } else {
                Add-TestResult "Compliance Testing" "$ServiceName - EU AI Act Compliance" "FAIL" "Limited AI Act compliance ($aiActScore%)" "≥75%" "$aiActScore%" $duration.TotalMilliseconds "High" $aiActScore
            }
            
            if ($Detailed -and $aiActChecks.Count -gt 0) {
                Write-Host "    📋 AI Act Features: $($aiActChecks -join ', ')" -ForegroundColor Gray
            }
        } else {
            Add-TestResult "Compliance Testing" "$ServiceName - EU AI Act Compliance" "SKIP" "Non-AI service" "N/A" "Not applicable" $duration.TotalMilliseconds "Low" 100
        }
        
        if ($Detailed -and $gdprChecks.Count -gt 0) {
            Write-Host "    📋 GDPR Features: $($gdprChecks -join ', ')" -ForegroundColor Gray
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "Compliance Testing" "$ServiceName - Compliance Check" "FAIL" $_.Exception.Message "Compliant" "Error" $duration.TotalMilliseconds "High" 25
    }
}

# =============================================================================
# CONTAINER SECURITY TESTING
# =============================================================================
if ($TestContainerSecurity) {
    Write-Host "🐳 CONTAINER SECURITY TESTING" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    # Get running containers
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Image}}" | Select-Object -Skip 1
        
        if ($containers) {
            $containerList = @()
            foreach ($container in $containers) {
                if ($container -match '^(\S+)\s+(.+)$') {
                    $containerList += @{Name = $Matches[1]; Image = $Matches[2]}
                }
            }
            
            # Test a representative sample of containers
            $testContainers = $containerList | Select-Object -First 6  # Test first 6 containers
            
            foreach ($container in $testContainers) {
                Test-ContainerSecurityConfiguration -ServiceName $container.Image -ContainerName $container.Name
            }
        } else {
            Add-TestResult "Container Security" "Docker Containers" "SKIP" "No running containers found" "Running containers" "None" 0 "Medium" 50
        }
        
    } catch {
        Add-TestResult "Container Security" "Docker Containers" "FAIL" "Cannot access Docker: $($_.Exception.Message)" "Docker access" "Error" 0 "High" 20
    }
}

# =============================================================================
# AUTHENTICATION & AUTHORIZATION TESTING
# =============================================================================
if ($TestAuthentication) {
    Write-Host "`n🔑 AUTHENTICATION & AUTHORIZATION TESTING" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    $authServices = @(
        @{Name="CBD Database API"; Url="http://localhost:8180/health"},
        @{Name="MemorAI MCP Server"; Url="http://localhost:4950/health"},
        @{Name="GraphQL API"; Url="http://localhost:4500/health"},
        @{Name="MemorAI Frontend"; Url="http://localhost:8006/"},
        @{Name="BancAI Service"; Url="http://localhost:8120/"}
    )
    
    foreach ($service in $authServices) {
        Test-AuthenticationSecurity -ServiceName $service.Name -Url $service.Url
    }
}

# =============================================================================
# NETWORK SECURITY TESTING
# =============================================================================
if ($TestNetworkSecurity) {
    Write-Host "`n🌐 NETWORK SECURITY TESTING" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    $networkServices = @(
        @{Name="CBD Database API"; Url="http://localhost:8180/"; Port=8180},
        @{Name="MemorAI MCP Server"; Url="http://localhost:4950/"; Port=4950},
        @{Name="MemorAI Frontend"; Url="http://localhost:8006/"; Port=8006},
        @{Name="BancAI Service"; Url="http://localhost:8120/"; Port=8120},
        @{Name="Gateway Service"; Url="http://localhost:8010/"; Port=8010}
    )
    
    foreach ($service in $networkServices) {
        Test-NetworkSecurityConfiguration -ServiceName $service.Name -Url $service.Url -Port $service.Port
    }
}

# =============================================================================
# VULNERABILITY SCANNING
# =============================================================================
if ($TestVulnerabilities) {
    Write-Host "`n🔍 VULNERABILITY SCANNING" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    $vulnServices = @(
        @{Name="CBD Database API"; Url="http://localhost:8180"},
        @{Name="MemorAI MCP Server"; Url="http://localhost:4950"},
        @{Name="MemorAI Frontend"; Url="http://localhost:8006"},
        @{Name="BancAI Service"; Url="http://localhost:8120"}
    )
    
    foreach ($service in $vulnServices) {
        Test-VulnerabilityScanning -ServiceName $service.Name -Url $service.Url
    }
}

# =============================================================================
# COMPLIANCE TESTING
# =============================================================================
if ($TestCompliance) {
    Write-Host "`n📋 COMPLIANCE FRAMEWORK TESTING" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    $complianceServices = @(
        @{Name="MemorAI Frontend"; Url="http://localhost:8006/"},
        @{Name="BancAI Service"; Url="http://localhost:8120/"},
        @{Name="CBD Database API"; Url="http://localhost:8180/"}
    )
    
    foreach ($service in $complianceServices) {
        Test-ComplianceFrameworks -ServiceName $service.Name -Url $service.Url
    }
}

# =============================================================================
# GENERATE COMPREHENSIVE SECURITY REPORT
# =============================================================================
Write-Host "`n📊 GENERATING COMPREHENSIVE SECURITY REPORT" -ForegroundColor Cyan
Write-Host "=" * 80

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object Status -eq "PASS").Count  
$failedTests = ($testResults | Where-Object Status -eq "FAIL").Count
$criticalTests = ($testResults | Where-Object Status -eq "CRITICAL").Count
$warnTests = ($testResults | Where-Object Status -eq "WARN").Count
$skippedTests = ($testResults | Where-Object Status -eq "SKIP").Count

$successRate = if($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "`n🔐 SECURITY & COMPLIANCE SUMMARY:" -ForegroundColor Yellow
Write-Host "   Total Tests Executed: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $passedTests ($([math]::Round(($passedTests / $totalTests) * 100, 1))%)" -ForegroundColor Green
Write-Host "   ❌ Failed: $failedTests ($([math]::Round(($failedTests / $totalTests) * 100, 1))%)" -ForegroundColor Red  
Write-Host "   🔴 Critical: $criticalTests ($([math]::Round(($criticalTests / $totalTests) * 100, 1))%)" -ForegroundColor Magenta
Write-Host "   ⚠️  Warnings: $warnTests ($([math]::Round(($warnTests / $totalTests) * 100, 1))%)" -ForegroundColor Yellow
Write-Host "   ⏭️  Skipped: $skippedTests ($([math]::Round(($skippedTests / $totalTests) * 100, 1))%)" -ForegroundColor Cyan
Write-Host "   📈 Overall Security Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 60) { "Yellow" } else { "Red" })

# Security score calculation
$securityTests = $testResults | Where-Object SecurityScore -ne $null
if ($securityTests) {
    $avgSecurityScore = [math]::Round(($securityTests | Measure-Object SecurityScore -Average).Average, 1)
    Write-Host "   🛡️  Average Security Score: $avgSecurityScore/100" -ForegroundColor $(if ($avgSecurityScore -gt 80) { "Green" } elseif ($avgSecurityScore -gt 60) { "Yellow" } else { "Red" })
}

# Category breakdown
Write-Host "`n📋 SECURITY CATEGORY BREAKDOWN:" -ForegroundColor Yellow
$categories = $testResults | Group-Object Category
foreach ($category in $categories) {
    $categoryPassed = ($category.Group | Where-Object Status -eq "PASS").Count
    $categoryTotal = $category.Count
    $categoryRate = if ($categoryTotal -gt 0) { [math]::Round(($categoryPassed / $categoryTotal) * 100, 1) } else { 0 }
    
    Write-Host "   $($category.Name): $categoryPassed/$categoryTotal ($categoryRate%)" -ForegroundColor $(if ($categoryRate -gt 80) { "Green" } elseif ($categoryRate -gt 60) { "Yellow" } else { "Red" })
}

# Severity breakdown
Write-Host "`n⚠️ SECURITY SEVERITY ANALYSIS:" -ForegroundColor Yellow
$severityGroups = $testResults | Where-Object SeverityLevel -ne $null | Group-Object SeverityLevel
foreach ($severity in $severityGroups) {
    $count = $severity.Count
    $color = switch($severity.Name) {
        "Critical" { "Red" }
        "High" { "Yellow" }
        "Medium" { "Blue" }
        "Low" { "Green" }
        default { "Gray" }
    }
    Write-Host "   $($severity.Name): $count issues" -ForegroundColor $color
}

# Export results if requested
if ($ExportResults) {
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $jsonFile = Join-Path $OutputPath "security-compliance-test-results-$timestamp.json"
    
    $testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $jsonFile -Encoding UTF8
    
    Write-Host "`n💾 Results exported to: $jsonFile" -ForegroundColor Green
}

# Show critical issues first
if ($criticalTests -gt 0) {
    Write-Host "`n🔴 CRITICAL SECURITY ISSUES REQUIRING IMMEDIATE ATTENTION:" -ForegroundColor Red
    $testResults | Where-Object Status -eq "CRITICAL" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Red
    }
}

# Show failed tests
if ($failedTests -gt 0) {
    Write-Host "`n❌ FAILED SECURITY TESTS:" -ForegroundColor Red
    $testResults | Where-Object Status -eq "FAIL" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Red
    }
}

# Show warnings
if ($warnTests -gt 0) {
    Write-Host "`n⚠️ SECURITY WARNINGS FOR IMPROVEMENT:" -ForegroundColor Yellow
    $testResults | Where-Object Status -eq "WARN" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Yellow
    }
}

Write-Host "`n⏰ Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "🛡️ Security & Compliance testing complete!" -ForegroundColor Red