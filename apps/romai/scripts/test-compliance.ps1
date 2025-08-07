# 🏛️ RomAI EU AI Act Compliance Test Script
# Tests the enterprise API compliance endpoints

param(
    [string]$ApiKey = "romai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA",
    [string]$BaseUrl = "http://localhost:8001"
)

Write-Host "🏛️ Testing RomAI EU AI Act Compliance Endpoints..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor White

# Test Compliance Status
try {
    Write-Host "`n📊 Testing Compliance Status..." -ForegroundColor Yellow
    $headers = @{
        'X-API-Key' = $ApiKey
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/v1/compliance/status" -Method Get -Headers $headers -TimeoutSec 10
    
    Write-Host "✅ Compliance Status: SUCCESS" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    
    if ($response.data) {
        Write-Host "Compliance Details:" -ForegroundColor Cyan
        $response.data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Compliance Status: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test Risk Assessment
try {
    Write-Host "`n🔍 Testing Risk Assessment..." -ForegroundColor Yellow
    
    $riskData = @{
        system_component = "RomAI Text Analysis"
        context = @{
            use_case = "Romanian language processing"
            user_base = "enterprise customers"
            data_types = @("text", "cultural content")
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/v1/compliance/risk-assessment" -Method Post -Headers $headers -Body $riskData -TimeoutSec 10
    
    Write-Host "✅ Risk Assessment: SUCCESS" -ForegroundColor Green
    Write-Host "Assessment ID: $($response.data.assessment_id)" -ForegroundColor White
    Write-Host "Risk Category: $($response.data.risk_category)" -ForegroundColor White
    Write-Host "Risk Score: $($response.data.risk_score)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Risk Assessment: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test Bias Detection
try {
    Write-Host "`n🔍 Testing Bias Detection..." -ForegroundColor Yellow
    
    $biasData = @{
        input_data = "Analiza acest text românesc: Salutul tradițional românesc este foarte important în cultura noastră."
        output_data = "Textul analizat prezintă o perspectivă pozitivă asupra tradițiilor românești și reflectă valorile culturale naționale."
        user_context = @{
            region = "Romania"
            language = "romanian"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/v1/compliance/bias-detection" -Method Post -Headers $headers -Body $biasData -TimeoutSec 10
    
    Write-Host "✅ Bias Detection: SUCCESS" -ForegroundColor Green
    Write-Host "Detection ID: $($response.data.detection_id)" -ForegroundColor White
    Write-Host "Bias Detected: $($response.data.bias_detected)" -ForegroundColor White
    Write-Host "Bias Score: $($response.data.bias_score)" -ForegroundColor White
    Write-Host "Detection Confidence: $($response.data.detection_confidence)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Bias Detection: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test Transparency Report
try {
    Write-Host "`n📄 Testing Transparency Report..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/v1/compliance/transparency-report" -Method Get -Headers $headers -TimeoutSec 10
    
    Write-Host "✅ Transparency Report: SUCCESS" -ForegroundColor Green
    Write-Host "Report Version: $($response.data.report_version)" -ForegroundColor White
    Write-Host "System Purpose: $($response.data.system_purpose)" -ForegroundColor White
    Write-Host "Last Updated: $($response.data.last_updated)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Transparency Report: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test Compliance Certificate
try {
    Write-Host "`n📜 Testing Compliance Certificate..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/v1/compliance/compliance-certificate" -Method Get -Headers $headers -TimeoutSec 10
    
    Write-Host "✅ Compliance Certificate: SUCCESS" -ForegroundColor Green
    Write-Host "Certificate ID: $($response.data.certificate_id)" -ForegroundColor White
    Write-Host "Issued To: $($response.data.issued_to)" -ForegroundColor White
    Write-Host "Risk Category: $($response.data.risk_category)" -ForegroundColor White
    Write-Host "Compliance Level: $($response.data.compliance_level)" -ForegroundColor White
    Write-Host "Status: $($response.data.certificate_status)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Compliance Certificate: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n✅ RomAI EU AI Act Compliance Test Completed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor White
