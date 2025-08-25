#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Model Server Validation Script
# Comprehensive testing of all 14 AGI training systems and Romanian capabilities
# Microsoft Azure ML Production Standards Compliance
# ==============================================================================

param(
    [Parameter(HelpMessage="Test mode: all, systems, endpoints, romanian")]
    [ValidateSet("all", "systems", "endpoints", "romanian")]
    [string]$TestMode = "all",
    
    [Parameter(HelpMessage="Server URL")]
    [string]$ServerUrl = "http://localhost:6101",
    
    [Parameter(HelpMessage="Timeout for each test in seconds")]
    [int]$Timeout = 30,
    
    [switch]$Verbose,
    [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# Colors
$Green = "Green"
$Red = "Red" 
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-ColorOutput {
    param($Message, $Color = "White")
    if ($Color -eq "Green") { Write-Host $Message -ForegroundColor Green }
    elseif ($Color -eq "Red") { Write-Host $Message -ForegroundColor Red }
    elseif ($Color -eq "Yellow") { Write-Host $Message -ForegroundColor Yellow }
    elseif ($Color -eq "Cyan") { Write-Host $Message -ForegroundColor Cyan }
    else { Write-Host $Message }
}

function Write-Section {
    param($Title)
    Write-ColorOutput "`n==============================================================================`n$Title`n==============================================================================" $Cyan
}

Write-Section "🧠 RomAI AGI MODEL SERVER VALIDATION"
Write-ColorOutput "Server: $ServerUrl" $Yellow
Write-ColorOutput "Test Mode: $TestMode" $Yellow
Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $Yellow

# Validation results
$ValidationResults = @{
    HealthCheck = @{ Status = "NOT_TESTED"; Details = "" }
    TrainingSystems = @{}
    Endpoints = @{}
    RomanianCapabilities = @{}
    OverallStatus = "UNKNOWN"
}

# ==============================================================================
# 14 AGI TRAINING SYSTEMS DEFINITION
# ==============================================================================

$AGI_TRAINING_SYSTEMS = @(
    @{ Name = "Mathematical Reasoning"; Key = "MATHEMATICAL_REASONING"; TestEndpoint = "/api/v1/reasoning/mathematical"; TestPayload = @{ problem = "What is the integral of x^2 from 0 to 3?"; difficulty = "intermediate" } },
    @{ Name = "Autonomous Problem Solving"; Key = "AUTONOMOUS_PROBLEM_SOLVING"; TestEndpoint = "/api/v1/autonomy/solve"; TestPayload = @{ problem = "Design an efficient sorting algorithm for 1 million records"; domain = "computer_science" } },
    @{ Name = "Meta Learning"; Key = "META_LEARNING"; TestEndpoint = "/api/v1/meta/learn"; TestPayload = @{ task_type = "classification"; previous_tasks = 5; adaptation_strategy = "few_shot" } },
    @{ Name = "Real-Time Learning"; Key = "REAL_TIME_LEARNING"; TestEndpoint = "/api/v1/realtime/adapt"; TestPayload = @{ input_data = "New concept: Quantum computing principles"; learning_mode = "incremental" } },
    @{ Name = "Code Generation"; Key = "CODE_GENERATION"; TestEndpoint = "/api/v1/code/generate"; TestPayload = @{ task = "Create a Python function to calculate Fibonacci numbers"; language = "python"; complexity = "medium" } },
    @{ Name = "RLHF Training"; Key = "RLHF_TRAINING"; TestEndpoint = "/api/v1/rlhf/train"; TestPayload = @{ feedback_type = "preference"; human_feedback = "positive"; context = "helpful response generation" } },
    @{ Name = "Constitutional AI"; Key = "CONSTITUTIONAL_AI"; TestEndpoint = "/api/v1/constitutional/evaluate"; TestPayload = @{ prompt = "Explain artificial intelligence ethics"; principles = @("helpful", "harmless", "honest") } },
    @{ Name = "Multimodal Training"; Key = "MULTIMODAL_TRAINING"; TestEndpoint = "/api/v1/multimodal/process"; TestPayload = @{ text = "Describe this image"; modalities = @("text", "vision"); task_type = "description" } },
    @{ Name = "Synthetic Data Generation"; Key = "SYNTHETIC_DATA_GENERATION"; TestEndpoint = "/api/v1/synthetic/generate"; TestPayload = @{ data_type = "text"; domain = "conversational"; samples = 10; quality = "high" } },
    @{ Name = "Advanced Training Methodologies"; Key = "ADVANCED_TRAINING_METHODOLOGIES"; TestEndpoint = "/api/v1/advanced/train"; TestPayload = @{ methodology = "curriculum_learning"; domain = "language_modeling"; progressive = $true } },
    @{ Name = "Romanian Language Specialization"; Key = "ROMANIAN_LANGUAGE_SPECIALIZATION"; TestEndpoint = "/api/v1/romanian/process"; TestPayload = @{ text = "Bună ziua! Cum vă simțiți astăzi? Sper că aveți o zi minunată."; task = "comprehensive_analysis" } }
)

# Additional specialized systems
$SPECIALIZED_SYSTEMS = @(
    @{ Name = "Quantum Computing Integration"; Key = "QUANTUM_ENABLED"; TestEndpoint = "/api/v1/quantum/status"; TestPayload = @{ check_type = "availability" } },
    @{ Name = "Consciousness Engine"; Key = "CONSCIOUSNESS_ENGINE"; TestEndpoint = "/api/v1/consciousness/status"; TestPayload = @{ probe_type = "awareness_check" } },
    @{ Name = "Monitoring & Analytics"; Key = "MONITORING_ANALYTICS"; TestEndpoint = "/api/v1/monitoring/metrics"; TestPayload = @{ metrics_type = "comprehensive" } }
)

# Romanian language test cases
$ROMANIAN_TEST_CASES = @(
    @{ Text = "Salut! Cum te cheamă?"; Expected = "greeting"; Description = "Basic greeting recognition" },
    @{ Text = "Mulțumesc foarte mult pentru ajutorul dumneavoastră."; Expected = "formal_gratitude"; Description = "Formal gratitude with diacritics" },
    @{ Text = "Vreau să înțeleg mai bine literatura română."; Expected = "literary_interest"; Description = "Cultural content interest" },
    @{ Text = "Mâncarea tradițională românească este delicioasă."; Expected = "cultural_pride"; Description = "Traditional food appreciation" },
    @{ Text = "Universitatea din București este renumită în întreaga lume."; Expected = "institutional_knowledge"; Description = "Geographic and institutional knowledge" }
)

# ==============================================================================
# HEALTH CHECK VALIDATION
# ==============================================================================

function Test-ModelServerHealth {
    Write-Section "🏥 MODEL SERVER HEALTH CHECK"
    
    if ($SkipHealthCheck) {
        Write-ColorOutput "⏭️ Health check skipped" $Yellow
        $ValidationResults.HealthCheck = @{ Status = "SKIPPED"; Details = "User requested skip" }
        return
    }
    
    try {
        Write-ColorOutput "🔍 Testing health endpoint..." $Yellow
        $healthResponse = Invoke-RestMethod -Uri "$ServerUrl/health" -Method Get -TimeoutSec $Timeout
        
        if ($healthResponse.status -eq "healthy" -or $healthResponse.status -eq "ok") {
            Write-ColorOutput "✅ Health check passed" $Green
            Write-ColorOutput "   Status: $($healthResponse.status)" "White"
            
            if ($healthResponse.version) {
                Write-ColorOutput "   Version: $($healthResponse.version)" "White"
            }
            
            if ($healthResponse.uptime) {
                Write-ColorOutput "   Uptime: $($healthResponse.uptime)" "White"
            }
            
            $ValidationResults.HealthCheck = @{
                Status = "HEALTHY"
                Details = $healthResponse
                ResponseTime = (Measure-Command { Invoke-RestMethod -Uri "$ServerUrl/health" -Method Get -TimeoutSec $Timeout }).TotalMilliseconds
            }
        }
        else {
            Write-ColorOutput "⚠️ Health check returned non-healthy status: $($healthResponse.status)" $Yellow
            $ValidationResults.HealthCheck = @{
                Status = "UNHEALTHY"
                Details = $healthResponse
                ResponseTime = 0
            }
        }
    }
    catch {
        Write-ColorOutput "❌ Health check failed: $($_.Exception.Message)" $Red
        $ValidationResults.HealthCheck = @{
            Status = "FAILED"
            Details = $_.Exception.Message
            ResponseTime = 0
        }
    }
}

# ==============================================================================
# AGI TRAINING SYSTEMS VALIDATION
# ==============================================================================

function Test-AGITrainingSystems {
    Write-Section "🧠 AGI TRAINING SYSTEMS VALIDATION"
    Write-ColorOutput "Testing all 14 core AGI training systems..." $Yellow
    
    $passedSystems = 0
    $totalSystems = $AGI_TRAINING_SYSTEMS.Count
    
    foreach ($system in $AGI_TRAINING_SYSTEMS) {
        Write-ColorOutput "`n🔍 Testing: $($system.Name)" $Cyan
        
        $systemResult = @{
            Name = $system.Name
            Key = $system.Key
            Status = "UNKNOWN"
            ResponseTime = 0
            Response = $null
            Error = $null
        }
        
        try {
            $startTime = Get-Date
            
            # Convert hashtable to JSON for API call
            $jsonPayload = $system.TestPayload | ConvertTo-Json -Depth 5
            
            Write-Verbose "  Endpoint: $($system.TestEndpoint)"
            Write-Verbose "  Payload: $jsonPayload"
            
            $response = Invoke-RestMethod -Uri "$ServerUrl$($system.TestEndpoint)" -Method Post -Body $jsonPayload -ContentType "application/json" -TimeoutSec $Timeout
            
            $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
            
            # Basic validation - check if we got a response
            if ($response) {
                Write-ColorOutput "  ✅ System operational" $Green
                Write-ColorOutput "     Response time: $([math]::Round($responseTime, 2))ms" "White"
                
                # Additional validation based on response content
                if ($response.status -eq "success" -or $response.result -or $response.analysis) {
                    Write-ColorOutput "     Processing successful" "White"
                    $systemResult.Status = "OPERATIONAL"
                    $passedSystems++
                }
                else {
                    Write-ColorOutput "     ⚠️ Response received but may indicate limited functionality" $Yellow
                    $systemResult.Status = "LIMITED"
                    $passedSystems += 0.5  # Partial credit
                }
                
                $systemResult.ResponseTime = $responseTime
                $systemResult.Response = $response
            }
            else {
                Write-ColorOutput "  ❌ No response received" $Red
                $systemResult.Status = "NO_RESPONSE"
                $systemResult.Error = "No response data"
            }
        }
        catch {
            $errorMsg = $_.Exception.Message
            Write-ColorOutput "  ❌ System test failed: $errorMsg" $Red
            
            # Check if it's a 404 (endpoint not implemented) vs other errors
            if ($errorMsg -like "*404*" -or $errorMsg -like "*Not Found*") {
                Write-ColorOutput "     (Endpoint not implemented - expected in development)" "White"
                $systemResult.Status = "NOT_IMPLEMENTED"
            }
            else {
                $systemResult.Status = "ERROR"
            }
            
            $systemResult.Error = $errorMsg
        }
        
        $ValidationResults.TrainingSystems[$system.Key] = $systemResult
    }
    
    Write-ColorOutput "`n📊 Training Systems Summary:" $Cyan
    Write-ColorOutput "   Total Systems: $totalSystems" "White"
    Write-ColorOutput "   Operational: $([math]::Floor($passedSystems))" $(if ($passedSystems -eq $totalSystems) { $Green } else { $Yellow })
    Write-ColorOutput "   Success Rate: $([math]::Round(($passedSystems / $totalSystems) * 100, 1))%" $(if (($passedSystems / $totalSystems) -gt 0.7) { $Green } else { $Red })
}

# ==============================================================================
# SPECIALIZED SYSTEMS VALIDATION
# ==============================================================================

function Test-SpecializedSystems {
    Write-Section "⚡ SPECIALIZED SYSTEMS VALIDATION"
    Write-ColorOutput "Testing quantum computing, consciousness engine, and monitoring systems..." $Yellow
    
    foreach ($system in $SPECIALIZED_SYSTEMS) {
        Write-ColorOutput "`n🔍 Testing: $($system.Name)" $Cyan
        
        try {
            $jsonPayload = $system.TestPayload | ConvertTo-Json -Depth 3
            $response = Invoke-RestMethod -Uri "$ServerUrl$($system.TestEndpoint)" -Method Post -Body $jsonPayload -ContentType "application/json" -TimeoutSec $Timeout
            
            if ($response) {
                Write-ColorOutput "  ✅ System available" $Green
                $ValidationResults.TrainingSystems[$system.Key] = @{
                    Name = $system.Name
                    Status = "OPERATIONAL"
                    Response = $response
                }
            }
        }
        catch {
            Write-ColorOutput "  ⚠️ System not available or limited: $($_.Exception.Message)" $Yellow
            $ValidationResults.TrainingSystems[$system.Key] = @{
                Name = $system.Name
                Status = "LIMITED"
                Error = $_.Exception.Message
            }
        }
    }
}

# ==============================================================================
# ROMANIAN LANGUAGE CAPABILITIES VALIDATION
# ==============================================================================

function Test-RomanianCapabilities {
    Write-Section "🇷🇴 ROMANIAN LANGUAGE CAPABILITIES VALIDATION"
    Write-ColorOutput "Testing comprehensive Romanian language processing..." $Yellow
    
    $romanianPassed = 0
    $totalTests = $ROMANIAN_TEST_CASES.Count
    
    foreach ($testCase in $ROMANIAN_TEST_CASES) {
        Write-ColorOutput "`n🔍 Testing: $($testCase.Description)" $Cyan
        Write-ColorOutput "   Text: '$($testCase.Text)'" "White"
        
        try {
            $payload = @{
                text = $testCase.Text
                task = "comprehensive_analysis"
                include_cultural_context = $true
                include_diacritics_analysis = $true
            } | ConvertTo-Json -Depth 3
            
            $response = Invoke-RestMethod -Uri "$ServerUrl/api/v1/romanian/process" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
            
            if ($response) {
                Write-ColorOutput "  ✅ Processing successful" $Green
                
                # Check for Romanian-specific analysis
                $hasLanguageDetection = $response.language_detection -or $response.detected_language
                $hasDiacriticsAnalysis = $response.diacritics -or $response.diacritics_analysis
                $hasCulturalAnalysis = $response.cultural_context -or $response.cultural_analysis
                
                if ($hasLanguageDetection) {
                    Write-ColorOutput "     ✅ Language detection functional" "White"
                }
                if ($hasDiacriticsAnalysis) {
                    Write-ColorOutput "     ✅ Diacritics analysis available" "White"
                }
                if ($hasCulturalAnalysis) {
                    Write-ColorOutput "     ✅ Cultural context analysis present" "White"
                }
                
                $ValidationResults.RomanianCapabilities[$testCase.Expected] = @{
                    Description = $testCase.Description
                    Status = "OPERATIONAL"
                    Response = $response
                    Features = @{
                        LanguageDetection = $hasLanguageDetection
                        DiacriticsAnalysis = $hasDiacriticsAnalysis
                        CulturalAnalysis = $hasCulturalAnalysis
                    }
                }
                
                $romanianPassed++
            }
        }
        catch {
            Write-ColorOutput "  ❌ Romanian processing failed: $($_.Exception.Message)" $Red
            $ValidationResults.RomanianCapabilities[$testCase.Expected] = @{
                Description = $testCase.Description
                Status = "FAILED"
                Error = $_.Exception.Message
            }
        }
    }
    
    Write-ColorOutput "`n📊 Romanian Capabilities Summary:" $Cyan
    Write-ColorOutput "   Total Tests: $totalTests" "White"
    Write-ColorOutput "   Passed: $romanianPassed" $(if ($romanianPassed -eq $totalTests) { $Green } else { $Yellow })
    Write-ColorOutput "   Success Rate: $([math]::Round(($romanianPassed / $totalTests) * 100, 1))%" $(if (($romanianPassed / $totalTests) -gt 0.8) { $Green } else { $Red })
}

# ==============================================================================
# API ENDPOINTS VALIDATION
# ==============================================================================

function Test-APIEndpoints {
    Write-Section "🌐 API ENDPOINTS VALIDATION"
    Write-ColorOutput "Testing core API endpoints for accessibility and functionality..." $Yellow
    
    $coreEndpoints = @(
        @{ Path = "/health"; Method = "GET"; Description = "Health check endpoint" },
        @{ Path = "/ready"; Method = "GET"; Description = "Readiness probe endpoint" },
        @{ Path = "/models/status"; Method = "GET"; Description = "Model status endpoint" },
        @{ Path = "/training/metrics"; Method = "GET"; Description = "Training metrics endpoint" },
        @{ Path = "/capabilities/scores"; Method = "GET"; Description = "Capability scores endpoint" },
        @{ Path = "/api/v1/analyze"; Method = "POST"; Description = "General analysis endpoint"; Payload = @{ text = "Test analysis"; task = "general" } }
    )
    
    $endpointsPassed = 0
    $totalEndpoints = $coreEndpoints.Count
    
    foreach ($endpoint in $coreEndpoints) {
        Write-ColorOutput "`n🔍 Testing: $($endpoint.Description)" $Cyan
        Write-ColorOutput "   $($endpoint.Method) $($endpoint.Path)" "White"
        
        try {
            if ($endpoint.Method -eq "GET") {
                $response = Invoke-RestMethod -Uri "$ServerUrl$($endpoint.Path)" -Method Get -TimeoutSec $Timeout
            }
            else {
                $payload = if ($endpoint.Payload) { $endpoint.Payload | ConvertTo-Json -Depth 3 } else { "{}" }
                $response = Invoke-RestMethod -Uri "$ServerUrl$($endpoint.Path)" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
            }
            
            if ($response) {
                Write-ColorOutput "  ✅ Endpoint operational" $Green
                $endpointsPassed++
                
                $ValidationResults.Endpoints[$endpoint.Path] = @{
                    Description = $endpoint.Description
                    Status = "OPERATIONAL"
                    Method = $endpoint.Method
                    Response = $response
                }
            }
        }
        catch {
            Write-ColorOutput "  ❌ Endpoint failed: $($_.Exception.Message)" $Red
            $ValidationResults.Endpoints[$endpoint.Path] = @{
                Description = $endpoint.Description
                Status = "FAILED"
                Method = $endpoint.Method
                Error = $_.Exception.Message
            }
        }
    }
    
    Write-ColorOutput "`n📊 API Endpoints Summary:" $Cyan
    Write-ColorOutput "   Total Endpoints: $totalEndpoints" "White"
    Write-ColorOutput "   Operational: $endpointsPassed" $(if ($endpointsPassed -eq $totalEndpoints) { $Green } else { $Yellow })
    Write-ColorOutput "   Success Rate: $([math]::Round(($endpointsPassed / $totalEndpoints) * 100, 1))%" $(if (($endpointsPassed / $totalEndpoints) -gt 0.7) { $Green } else { $Red })
}

# ==============================================================================
# MAIN VALIDATION EXECUTION
# ==============================================================================

function Invoke-ModelServerValidation {
    $validationStartTime = Get-Date
    
    # Execute validation based on test mode
    switch ($TestMode) {
        "all" {
            Test-ModelServerHealth
            Test-AGITrainingSystems
            Test-SpecializedSystems
            Test-RomanianCapabilities
            Test-APIEndpoints
        }
        "systems" {
            Test-AGITrainingSystems
            Test-SpecializedSystems
        }
        "endpoints" {
            Test-ModelServerHealth
            Test-APIEndpoints
        }
        "romanian" {
            Test-RomanianCapabilities
        }
    }
    
    # Generate overall assessment
    Write-Section "📊 OVERALL VALIDATION ASSESSMENT"
    
    $validationTime = ((Get-Date) - $validationStartTime).TotalSeconds
    Write-ColorOutput "Validation completed in $([math]::Round($validationTime, 2)) seconds" $Yellow
    
    # Calculate overall scores
    $healthPassed = $ValidationResults.HealthCheck.Status -eq "HEALTHY"
    $systemsOperational = ($ValidationResults.TrainingSystems.Values | Where-Object { $_.Status -eq "OPERATIONAL" }).Count
    $totalSystems = $ValidationResults.TrainingSystems.Count
    $endpointsOperational = ($ValidationResults.Endpoints.Values | Where-Object { $_.Status -eq "OPERATIONAL" }).Count
    $totalEndpoints = $ValidationResults.Endpoints.Count
    $romanianOperational = ($ValidationResults.RomanianCapabilities.Values | Where-Object { $_.Status -eq "OPERATIONAL" }).Count
    $totalRomanian = $ValidationResults.RomanianCapabilities.Count
    
    Write-ColorOutput "`nValidation Results:" $Cyan
    Write-ColorOutput "✅ Health Check: $(if ($healthPassed) { "PASSED" } else { "FAILED" })" $(if ($healthPassed) { $Green } else { $Red })
    
    if ($totalSystems -gt 0) {
        $systemsPercent = [math]::Round(($systemsOperational / $totalSystems) * 100, 1)
        Write-ColorOutput "🧠 AGI Training Systems: $systemsOperational/$totalSystems ($systemsPercent%)" $(if ($systemsPercent -gt 70) { $Green } elseif ($systemsPercent -gt 50) { $Yellow } else { $Red })
    }
    
    if ($totalEndpoints -gt 0) {
        $endpointsPercent = [math]::Round(($endpointsOperational / $totalEndpoints) * 100, 1)
        Write-ColorOutput "🌐 API Endpoints: $endpointsOperational/$totalEndpoints ($endpointsPercent%)" $(if ($endpointsPercent -gt 80) { $Green } elseif ($endpointsPercent -gt 60) { $Yellow } else { $Red })
    }
    
    if ($totalRomanian -gt 0) {
        $romanianPercent = [math]::Round(($romanianOperational / $totalRomanian) * 100, 1)
        Write-ColorOutput "🇷🇴 Romanian Capabilities: $romanianOperational/$totalRomanian ($romanianPercent%)" $(if ($romanianPercent -gt 80) { $Green } elseif ($romanianPercent -gt 60) { $Yellow } else { $Red })
    }
    
    # Determine overall status
    $overallScore = 0
    $totalChecks = 0
    
    if ($ValidationResults.HealthCheck.Status -ne "NOT_TESTED") {
        $overallScore += if ($healthPassed) { 1 } else { 0 }
        $totalChecks += 1
    }
    
    if ($totalSystems -gt 0) {
        $overallScore += ($systemsOperational / $totalSystems)
        $totalChecks += 1
    }
    
    if ($totalEndpoints -gt 0) {
        $overallScore += ($endpointsOperational / $totalEndpoints)
        $totalChecks += 1
    }
    
    if ($totalRomanian -gt 0) {
        $overallScore += ($romanianOperational / $totalRomanian)
        $totalChecks += 1
    }
    
    $finalScore = if ($totalChecks -gt 0) { ($overallScore / $totalChecks) * 100 } else { 0 }
    
    $overallStatus = if ($finalScore -ge 80) { "EXCELLENT" } elseif ($finalScore -ge 60) { "GOOD" } elseif ($finalScore -ge 40) { "NEEDS_IMPROVEMENT" } else { "CRITICAL_ISSUES" }
    $statusColor = if ($finalScore -ge 80) { $Green } elseif ($finalScore -ge 60) { $Yellow } else { $Red }
    
    $ValidationResults.OverallStatus = $overallStatus
    
    Write-ColorOutput "`n🎯 OVERALL SCORE: $([math]::Round($finalScore, 1))% - $overallStatus" $statusColor
    
    # Save validation results to JSON
    $jsonResults = $ValidationResults | ConvertTo-Json -Depth 10
    $resultsFile = "model-server-validation-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $jsonResults | Out-File -FilePath $resultsFile -Encoding UTF8
    
    Write-ColorOutput "`n💾 Validation results saved to: $resultsFile" $Cyan
    
    # Exit with appropriate code
    $exitCode = if ($finalScore -ge 60) { 0 } else { 1 }
    return $exitCode
}

# ==============================================================================
# SCRIPT EXECUTION
# ==============================================================================

try {
    $exitCode = Invoke-ModelServerValidation
    
    Write-ColorOutput "`n🏁 Model server validation completed" $Cyan
    if ($exitCode -eq 0) {
        Write-ColorOutput "✅ Validation PASSED - Model server ready for production deployment" $Green
    }
    else {
        Write-ColorOutput "❌ Validation FAILED - Model server needs improvement before production deployment" $Red
    }
    
    exit $exitCode
}
catch {
    Write-ColorOutput "`n💥 Fatal error during validation: $($_.Exception.Message)" $Red
    Write-ColorOutput "Stack trace: $($_.ScriptStackTrace)" $Red
    exit 2
}