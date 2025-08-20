# 🔐 CBD Data Encryption Service Test Suite
# Phase 4.2.3.2 - Data Encryption Testing
# 
# Test Coverage:
# - Field-level encryption/decryption
# - Document-level encryption/decryption
# - Key management and rotation
# - Encryption policies
# - Security and performance testing

param(
    [string]$BaseUrl = "http://localhost:4450",
    [string]$ApiKey = "enc_key_admin_2025",
    [switch]$Verbose = $true,
    [switch]$SkipCleanup = $false
)

Write-Host "🔐 CBD Data Encryption Service Test Suite" -ForegroundColor Cyan
Write-Host "Testing field/document encryption, key management, and security features" -ForegroundColor Gray
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "API Key: $ApiKey" -ForegroundColor Yellow
Write-Host ""

# Test counters
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsTotal = 0

# Test results storage
$script:TestResults = @()
$script:EncryptedData = @{}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = "",
        [object]$Response = $null
    )
    
    $script:TestsTotal++
    
    if ($Success) {
        $script:TestsPassed++
        Write-Host "✅ $TestName" -ForegroundColor Green
        if ($Verbose -and $Details) {
            Write-Host "   $Details" -ForegroundColor Gray
        }
    } else {
        $script:TestsFailed++
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($Details) {
            Write-Host "   Error: $Details" -ForegroundColor Red
        }
    }
    
    $script:TestResults += @{
        Name = $TestName
        Success = $Success
        Details = $Details
        Response = $Response
        Timestamp = Get-Date
    }
}

function Invoke-EncryptionRestMethod {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $requestHeaders = $Headers.Clone()
        $requestHeaders["X-API-Key"] = $ApiKey
        
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $requestHeaders
            TimeoutSec = 15
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = 0
        $errorMessage = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $errorResponse = $_.Exception.Response.GetResponseStream()
                $reader = [System.IO.StreamReader]::new($errorResponse)
                $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
                $errorMessage = $errorBody.error
            } catch {
                # Use default error message
            }
        }
        
        return @{ 
            Success = $false
            Error = $errorMessage
            StatusCode = $statusCode
            Data = $null
        }
    }
}

# Test 1: Health Check
Write-Host "🔍 Testing Health Check..." -ForegroundColor Blue
$healthResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/health"
if ($healthResult.Success) {
    $health = $healthResult.Data
    Write-TestResult "Health Check" $true "Service: $($health.service), Status: $($health.status), Algorithms: $($health.algorithms -join ', ')"
} else {
    Write-TestResult "Health Check" $false $healthResult.Error
    Write-Host "⚠️  Encryption Service may not be running. Please start it first." -ForegroundColor Yellow
    exit 1
}

# Test 2: Field Encryption Tests
Write-Host "`n🔒 Testing Field Encryption..." -ForegroundColor Blue

# Test 2.1: Encrypt simple field
$fieldData = @{
    data = "This is sensitive information"
    keyType = "general"
}
$encryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/encrypt/field" -Method "POST" -Body $fieldData
if ($encryptResult.Success -and $encryptResult.Data.success) {
    $script:EncryptedData["simple"] = $encryptResult.Data.result
    Write-TestResult "Simple Field Encryption" $true "Algorithm: $($encryptResult.Data.result.algorithm), Key Type: $($encryptResult.Data.result.keyType)"
} else {
    $error = if ($encryptResult.Data.error) { $encryptResult.Data.error } else { $encryptResult.Error }
    Write-TestResult "Simple Field Encryption" $false $error
}

# Test 2.2: Encrypt PII field
$piiData = @{
    data = "123-45-6789"
    keyType = "pii"
}
$piiEncryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/encrypt/field" -Method "POST" -Body $piiData
if ($piiEncryptResult.Success -and $piiEncryptResult.Data.success) {
    $script:EncryptedData["pii"] = $piiEncryptResult.Data.result
    Write-TestResult "PII Field Encryption" $true "SSN encrypted with PII key"
} else {
    $error = if ($piiEncryptResult.Data.error) { $piiEncryptResult.Data.error } else { $piiEncryptResult.Error }
    Write-TestResult "PII Field Encryption" $false $error
}

# Test 2.3: Encrypt financial field
$financialData = @{
    data = @{
        accountNumber = "1234567890123456"
        balance = 15000.50
    }
    keyType = "financial"
}
$financialEncryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/encrypt/field" -Method "POST" -Body $financialData
if ($financialEncryptResult.Success -and $financialEncryptResult.Data.success) {
    $script:EncryptedData["financial"] = $financialEncryptResult.Data.result
    Write-TestResult "Financial Field Encryption" $true "Financial data encrypted with financial key"
} else {
    $error = if ($financialEncryptResult.Data.error) { $financialEncryptResult.Data.error } else { $financialEncryptResult.Error }
    Write-TestResult "Financial Field Encryption" $false $error
}

# Test 3: Field Decryption Tests
Write-Host "`n🔓 Testing Field Decryption..." -ForegroundColor Blue

# Test 3.1: Decrypt simple field
if ($script:EncryptedData["simple"]) {
    $decryptData = @{
        encryptedData = $script:EncryptedData["simple"]
    }
    $decryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/decrypt/field" -Method "POST" -Body $decryptData
    if ($decryptResult.Success -and $decryptResult.Data.success) {
        $decryptedValue = $decryptResult.Data.result
        if ($decryptedValue -eq "This is sensitive information") {
            Write-TestResult "Simple Field Decryption" $true "Successfully decrypted: '$decryptedValue'"
        } else {
            Write-TestResult "Simple Field Decryption" $false "Decrypted value doesn't match original"
        }
    } else {
        $error = if ($decryptResult.Data.error) { $decryptResult.Data.error } else { $decryptResult.Error }
        Write-TestResult "Simple Field Decryption" $false $error
    }
}

# Test 3.2: Decrypt PII field
if ($script:EncryptedData["pii"]) {
    $piiDecryptData = @{
        encryptedData = $script:EncryptedData["pii"]
    }
    $piiDecryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/decrypt/field" -Method "POST" -Body $piiDecryptData
    if ($piiDecryptResult.Success -and $piiDecryptResult.Data.success) {
        $decryptedSSN = $piiDecryptResult.Data.result
        if ($decryptedSSN -eq "123-45-6789") {
            Write-TestResult "PII Field Decryption" $true "Successfully decrypted SSN"
        } else {
            Write-TestResult "PII Field Decryption" $false "Decrypted SSN doesn't match original"
        }
    } else {
        $error = if ($piiDecryptResult.Data.error) { $piiDecryptResult.Data.error } else { $piiDecryptResult.Error }
        Write-TestResult "PII Field Decryption" $false $error
    }
}

# Test 4: Document Encryption Tests
Write-Host "`n📄 Testing Document Encryption..." -ForegroundColor Blue

# Test 4.1: Encrypt document with default policy
$testDocument = @{
    id = 12345
    name = "John Doe"
    email = "john.doe@example.com"
    ssn = "987-65-4321"  
    phone = "+1-555-123-4567"
    address = "123 Main St, Anytown, USA"
    account_number = "ACC-789123456"
    balance = 25000.75
    created_at = "2025-08-02T12:00:00Z"
    status = "active"
}

$docEncryptData = @{
    document = $testDocument
    policy = "default"
}
$docEncryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/encrypt/document" -Method "POST" -Body $docEncryptData
if ($docEncryptResult.Success -and $docEncryptResult.Data.success) {
    $script:EncryptedData["document"] = $docEncryptResult.Data.result
    $encryptedFields = $docEncryptResult.Data.encryptedFields
    Write-TestResult "Document Encryption" $true "Encrypted $($encryptedFields.Count) fields: $($encryptedFields -join ', ')"
} else {
    $error = if ($docEncryptResult.Data.error) { $docEncryptResult.Data.error } else { $docEncryptResult.Error }
    Write-TestResult "Document Encryption" $false $error
}

# Test 4.2: Verify document structure after encryption
if ($script:EncryptedData["document"]) {
    $encryptedDoc = $script:EncryptedData["document"]
    
    # Check that non-sensitive fields remain unencrypted
    $unencryptedFieldsIntact = ($encryptedDoc.id -eq 12345) -and 
                               ($encryptedDoc.status -eq "active") -and
                               ($encryptedDoc.created_at -eq "2025-08-02T12:00:00Z")
    
    # Check that sensitive fields are encrypted
    $sensitiveFieldsEncrypted = ($encryptedDoc.email.encrypted -eq $true) -and
                                ($encryptedDoc.ssn.encrypted -eq $true) -and
                                ($encryptedDoc.account_number.encrypted -eq $true)
    
    if ($unencryptedFieldsIntact -and $sensitiveFieldsEncrypted) {
        Write-TestResult "Document Structure Validation" $true "Unencrypted fields intact, sensitive fields encrypted"
    } else {
        Write-TestResult "Document Structure Validation" $false "Document structure invalid after encryption"
    }
    
    # Check encryption metadata
    if ($encryptedDoc._encryption -and $encryptedDoc._encryption.encryptedFields) {
        Write-TestResult "Encryption Metadata" $true "Metadata present with $($encryptedDoc._encryption.encryptedFields.Count) encrypted fields"
    } else {
        Write-TestResult "Encryption Metadata" $false "Encryption metadata missing"
    }
}

# Test 5: Document Decryption Tests
Write-Host "`n🔓 Testing Document Decryption..." -ForegroundColor Blue

if ($script:EncryptedData["document"]) {
    $docDecryptData = @{
        encryptedDocument = $script:EncryptedData["document"]
    }
    $docDecryptResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/decrypt/document" -Method "POST" -Body $docDecryptData
    if ($docDecryptResult.Success -and $docDecryptResult.Data.success) {
        $decryptedDoc = $docDecryptResult.Data.result
        
        # Verify all fields were decrypted correctly
        $fieldsMatch = ($decryptedDoc.name -eq "John Doe") -and
                       ($decryptedDoc.email -eq "john.doe@example.com") -and
                       ($decryptedDoc.ssn -eq "987-65-4321") -and
                       ($decryptedDoc.account_number -eq "ACC-789123456") -and
                       ($decryptedDoc.balance -eq 25000.75)
        
        if ($fieldsMatch) {
            Write-TestResult "Document Decryption" $true "All fields decrypted correctly"
        } else {
            Write-TestResult "Document Decryption" $false "Some fields not decrypted correctly"
        }
        
        # Verify encryption metadata was removed
        if (!$decryptedDoc._encryption) {
            Write-TestResult "Metadata Cleanup" $true "Encryption metadata properly removed"
        } else {
            Write-TestResult "Metadata Cleanup" $false "Encryption metadata not removed"
        }
    } else {
        $error = if ($docDecryptResult.Data.error) { $docDecryptResult.Data.error } else { $docDecryptResult.Error }
        Write-TestResult "Document Decryption" $false $error
    }
}

# Test 6: Key Management Tests
Write-Host "`n🔑 Testing Key Management..." -ForegroundColor Blue

# Test 6.1: Get encryption statistics
$statsResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/stats"
if ($statsResult.Success -and $statsResult.Data.success) {
    $stats = $statsResult.Data.stats
    Write-TestResult "Encryption Statistics" $true "Total Keys: $($stats.totalKeys), Active: $($stats.activeKeys), Operations: $($stats.operationStats.totalOperations)"
    
    # Verify key types exist
    $expectedKeyTypes = @('general', 'pii', 'financial', 'health', 'system')
    $actualKeyTypes = $stats.keyUsage.PSObject.Properties.Name
    $keyTypesValid = $expectedKeyTypes | ForEach-Object { $actualKeyTypes -contains $_ }
    
    if (($keyTypesValid | Where-Object { $_ -eq $false }).Count -eq 0) {
        Write-TestResult "Key Types Validation" $true "All expected key types present"
    } else {
        Write-TestResult "Key Types Validation" $false "Some key types missing"
    }
} else {
    $error = if ($statsResult.Data.error) { $statsResult.Data.error } else { $statsResult.Error }
    Write-TestResult "Encryption Statistics" $false $error
}

# Test 6.2: Key rotation
$rotateResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/keys/rotate" -Method "POST"
if ($rotateResult.Success -and $rotateResult.Data.success) {
    Write-TestResult "Key Rotation" $true $rotateResult.Data.message
} else {
    $error = if ($rotateResult.Data.error) { $rotateResult.Data.error } else { $rotateResult.Error }
    Write-TestResult "Key Rotation" $false $error
}

# Test 7: Security Tests
Write-Host "`n🛡️ Testing Security Features..." -ForegroundColor Blue

# Test 7.1: Authentication - invalid API key
$invalidKeyResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/stats" -Headers @{"X-API-Key" = "invalid_key"}
if (!$invalidKeyResult.Success -and $invalidKeyResult.StatusCode -eq 401) {
    Write-TestResult "Invalid API Key Rejection" $true "Correctly rejected invalid API key"
} else {
    Write-TestResult "Invalid API Key Rejection" $false "Should have rejected invalid API key"
}

# Test 7.2: Authentication - missing API key
$noKeyHeaders = @{}
$noKeyResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/stats" -Headers $noKeyHeaders
if (!$noKeyResult.Success -and $noKeyResult.StatusCode -eq 401) {
    Write-TestResult "Missing API Key Rejection" $true "Correctly rejected missing API key"
} else {
    Write-TestResult "Missing API Key Rejection" $false "Should have rejected missing API key"
}

# Test 7.3: Invalid data handling
$invalidFieldData = @{
    # Missing required 'data' field
    keyType = "general"
}
$invalidResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/encrypt/field" -Method "POST" -Body $invalidFieldData
if (!$invalidResult.Success) {
    Write-TestResult "Invalid Data Handling" $true "Correctly handled invalid input"
} else {
    Write-TestResult "Invalid Data Handling" $false "Should have rejected invalid input"
}

# Test 8: Performance Tests
Write-Host "`n⚡ Testing Performance..." -ForegroundColor Blue

# Test 8.1: Encryption speed test
$startTime = Get-Date
$performanceTests = 0
$successfulTests = 0

for ($i = 1; $i -le 10; $i++) {
    $perfData = @{
        data = "Performance test data string #$i - $(Get-Random)"
        keyType = "general"
    }
    $perfResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/encrypt/field" -Method "POST" -Body $perfData
    $performanceTests++
    
    if ($perfResult.Success) {
        $successfulTests++
    }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalMilliseconds
$averageTime = [math]::Round($duration / $performanceTests, 2)

if ($successfulTests -eq $performanceTests -and $averageTime -lt 1000) {
    Write-TestResult "Encryption Performance" $true "$successfulTests/$performanceTests tests in ${duration}ms (avg: ${averageTime}ms/test)"
} else {
    Write-TestResult "Encryption Performance" $false "Performance issues: $successfulTests/$performanceTests successful, avg: ${averageTime}ms"
}

# Test 9: Key Export Test
Write-Host "`n💾 Testing Key Export..." -ForegroundColor Blue

$exportData = @{
    password = "SecureExportPassword123!"
}
$exportResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/keys/export" -Method "POST" -Body $exportData
if ($exportResult.Success -and $exportResult.Data.success) {
    $export = $exportResult.Data.exportData
    Write-TestResult "Key Export" $true "Exported $($export.keyCount) keys at $($export.exportedAt)"
} else {
    $error = if ($exportResult.Data.error) { $exportResult.Data.error } else { $exportResult.Error }
    Write-TestResult "Key Export" $false $error
}

# Test 9.2: Key export with weak password (should fail)
$weakExportData = @{
    password = "weak"
}
$weakExportResult = Invoke-EncryptionRestMethod -Uri "$BaseUrl/keys/export" -Method "POST" -Body $weakExportData
if (!$weakExportResult.Success) {
    Write-TestResult "Weak Password Rejection" $true "Correctly rejected weak export password"
} else {
    Write-TestResult "Weak Password Rejection" $false "Should have rejected weak password"
}

# Test Summary
Write-Host "`n📋 Test Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
Write-Host "✅ Passed: $script:TestsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $script:TestsFailed" -ForegroundColor Red
Write-Host "📊 Total:  $script:TestsTotal" -ForegroundColor Yellow

$successRate = if ($script:TestsTotal -gt 0) { 
    [math]::Round(($script:TestsPassed / $script:TestsTotal) * 100, 1) 
} else { 0 }

Write-Host "🎯 Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

if ($script:TestsFailed -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    $script:TestResults | Where-Object { !$_.Success } | ForEach-Object {
        Write-Host "   • $($_.Name): $($_.Details)" -ForegroundColor Red
    }
}

# Encryption Assessment
Write-Host "`n🔐 Encryption Assessment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray

$encryptionScore = 0
$maxScore = 12

# Field encryption tests
if (($script:TestResults | Where-Object { $_.Name -eq "Simple Field Encryption" }).Success) { $encryptionScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "PII Field Encryption" }).Success) { $encryptionScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "Financial Field Encryption" }).Success) { $encryptionScore++ }

# Field decryption tests
if (($script:TestResults | Where-Object { $_.Name -eq "Simple Field Decryption" }).Success) { $encryptionScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "PII Field Decryption" }).Success) { $encryptionScore++ }

# Document encryption tests
if (($script:TestResults | Where-Object { $_.Name -eq "Document Encryption" }).Success) { $encryptionScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "Document Decryption" }).Success) { $encryptionScore++ }

# Key management tests
if (($script:TestResults | Where-Object { $_.Name -eq "Key Rotation" }).Success) { $encryptionScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "Key Export" }).Success) { $encryptionScore++ }

# Security tests
if (($script:TestResults | Where-Object { $_.Name -eq "Invalid API Key Rejection" }).Success) { $encryptionScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "Invalid Data Handling" }).Success) { $encryptionScore++ }

# Performance test
if (($script:TestResults | Where-Object { $_.Name -eq "Encryption Performance" }).Success) { $encryptionScore++ }

$encryptionPercentage = [math]::Round(($encryptionScore / $maxScore) * 100, 1)

Write-Host "🔒 Encryption Score: $encryptionScore/$maxScore ($encryptionPercentage%)" -ForegroundColor $(
    if ($encryptionPercentage -ge 90) { "Green" } 
    elseif ($encryptionPercentage -ge 75) { "Yellow" } 
    else { "Red" }
)

if ($encryptionPercentage -ge 90) {
    Write-Host "🏆 Excellent! Encryption implementation is production-ready." -ForegroundColor Green
} elseif ($encryptionPercentage -ge 75) {
    Write-Host "⚠️  Good encryption foundation, but some improvements needed." -ForegroundColor Yellow
} else {
    Write-Host "🚨 Encryption implementation needs significant improvements." -ForegroundColor Red
}

# Feature Coverage
Write-Host "`n🎯 Feature Coverage" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray

$features = @{
    "Field Encryption" = ($script:TestResults | Where-Object { $_.Name -like "*Field Encryption" -and $_.Success }).Count -gt 0
    "Document Encryption" = ($script:TestResults | Where-Object { $_.Name -eq "Document Encryption" }).Success
    "Key Management" = ($script:TestResults | Where-Object { $_.Name -like "*Key*" -and $_.Success }).Count -gt 0
    "Security Controls" = ($script:TestResults | Where-Object { $_.Name -like "*Rejection" -and $_.Success }).Count -gt 0
    "Performance" = ($script:TestResults | Where-Object { $_.Name -eq "Encryption Performance" }).Success
    "Data Integrity" = ($script:TestResults | Where-Object { $_.Name -like "*Decryption" -and $_.Success }).Count -gt 0
}

foreach ($feature in $features.GetEnumerator()) {
    $status = if ($feature.Value) { "✅" } else { "❌" }
    Write-Host "$status $($feature.Key)" -ForegroundColor $(if ($feature.Value) { "Green" } else { "Red" })
}

Write-Host "`n🎉 CBD Data Encryption Service testing completed!" -ForegroundColor Green
Write-Host "Ready for Phase 4.2.3.3 - Security Hardening implementation." -ForegroundColor Cyan

# Exit with appropriate code
exit $(if ($script:TestsFailed -eq 0) { 0 } else { 1 })
