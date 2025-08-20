#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive Test Suite for CBD AI-Powered Analytics Engine
    Phase 4.3.2 - AI Analytics Testing & Validation
    
.DESCRIPTION
    Tests all AI Analytics Engine features including:
    - Health Check & Service Status
    - Natural Language Processing
    - Sentiment Analysis & Text Mining
    - Statistical Predictions & Forecasting
    - Anomaly Detection
    - Pattern Discovery
    - Recommendation Engine
    - Report Generation
    - Real-time Analytics
    
.AUTHOR
    CBD Development Team
    
.DATE
    August 2, 2025
#>

param(
    [string]$BaseUrl = "http://localhost:4700",
    [switch]$Verbose,
    [switch]$DetailedOutput
)

# Test Results Tracking
$TestResults = @()
$PassedTests = 0
$FailedTests = 0

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = "",
        [object]$Data = $null
    )
    
    $global:TestResults += [PSCustomObject]@{
        TestName = $TestName
        Success = $Success
        Details = $Details
        Timestamp = Get-Date
        Data = $Data
    }
    
    if ($Success) {
        $global:PassedTests++
        Write-Host "✅ $TestName" -ForegroundColor Green
        if ($Details) { Write-Host "   $Details" -ForegroundColor Gray }
    } else {
        $global:FailedTests++
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "   $Details" -ForegroundColor Yellow }
    }
    
    if ($DetailedOutput -and $Data) {
        Write-Host "   Data: $($Data | ConvertTo-Json -Compress)" -ForegroundColor Blue
    }
}

function Invoke-APITest {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = @{},
        [int]$TimeoutSec = 10
    )
    
    try {
        $Uri = "$BaseUrl$Endpoint"
        $Headers = @{ "Content-Type" = "application/json" }
        
        if ($Method -eq "GET") {
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -TimeoutSec $TimeoutSec
        } else {
            $JsonBody = $Body | ConvertTo-Json -Depth 10
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Body $JsonBody -Headers $Headers -TimeoutSec $TimeoutSec
        }
        
        return @{
            Success = $true
            Data = $Response
            StatusCode = 200
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { 0 }
        }
    }
}

# Start Testing
Write-Host "`n🧠 CBD AI-Powered Analytics Engine - Comprehensive Test Suite" -ForegroundColor Magenta
Write-Host "🌐 Testing Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "📅 Test Date: $(Get-Date)" -ForegroundColor Gray

# Test 1: Health Check
Write-TestHeader "🏥 HEALTH CHECK & SERVICE STATUS"

$healthTest = Invoke-APITest -Endpoint "/health"
if ($healthTest.Success) {
    $health = $healthTest.Data
    Write-TestResult "Service Health Check" $true "Status: $($health.status), Version: $($health.version)" $health
    Write-TestResult "AI Features Available" ($health.features -ne $null) "Features: $($health.features.Keys -join ', ')" $health.features
    Write-TestResult "Statistical Models Loaded" ($health.models.statistical_models -gt 0) "Models: $($health.models.statistical_models)" $health.models
    Write-TestResult "Performance Metrics" ($health.performance -ne $null) "Memory: $($health.performance.memory_usage)" $health.performance
} else {
    Write-TestResult "Service Health Check" $false "Error: $($healthTest.Error)"
}

# Test 2: Analytics Dashboard
Write-TestHeader "📊 ANALYTICS DASHBOARD"

$dashboardTest = Invoke-APITest -Endpoint "/api/analytics/dashboard"
if ($dashboardTest.Success) {
    $dashboard = $dashboardTest.Data
    Write-TestResult "Dashboard Overview" $true "Models: $($dashboard.overview.models_active)" $dashboard.overview
    Write-TestResult "Performance Metrics" ($dashboard.performance_metrics -ne $null) "Analyses: $($dashboard.performance_metrics.totalAnalyses)" $dashboard.performance_metrics
    Write-TestResult "Real-time Status" ($dashboard.real_time_data -ne $null) "Streams: $($dashboard.real_time_data.active_streams)" $dashboard.real_time_data
} else {
    Write-TestResult "Dashboard Overview" $false "Error: $($dashboardTest.Error)"
}

# Test 3: Natural Language Processing
Write-TestHeader "📝 NATURAL LANGUAGE PROCESSING"

$nlpData = @{
    text = "I am very happy with this amazing product! It's absolutely fantastic and works perfectly."
    analysis_type = "comprehensive"
}

$nlpTest = Invoke-APITest -Endpoint "/api/nlp/analyze" -Method "POST" -Body $nlpData
if ($nlpTest.Success) {
    $nlp = $nlpTest.Data
    Write-TestResult "Text Tokenization" ($nlp.tokens.Count -gt 0) "Tokens: $($nlp.tokens.Count)" $nlp.tokens
    Write-TestResult "Sentiment Analysis" ($nlp.sentiment_score -ne $null) "Score: $($nlp.sentiment_score), Classification: $($nlp.sentiment_classification)" 
    Write-TestResult "Intent Classification" ($nlp.intent -ne $null) "Intent: $($nlp.intent)" 
    Write-TestResult "Entity Extraction" ($nlp.entities -ne $null) "Entities: $($nlp.entities.Count)" $nlp.entities
    Write-TestResult "Key Phrases" ($nlp.key_phrases -ne $null) "Phrases: $($nlp.key_phrases.Count)" $nlp.key_phrases
} else {
    Write-TestResult "NLP Analysis" $false "Error: $($nlpTest.Error)"
}

# Test 4: Sentiment Analysis
Write-TestHeader "💭 SENTIMENT ANALYSIS"

$sentimentData = @{
    text = "This service is terrible and I hate using it. Very disappointing experience."
    detailed = $true
}

$sentimentTest = Invoke-APITest -Endpoint "/api/nlp/sentiment" -Method "POST" -Body $sentimentData
if ($sentimentTest.Success) {
    $sentiment = $sentimentTest.Data
    Write-TestResult "Sentiment Score Calculation" ($sentiment.sentiment_score -ne $null) "Score: $($sentiment.sentiment_score)"
    Write-TestResult "Sentiment Classification" ($sentiment.sentiment_classification -ne $null) "Classification: $($sentiment.sentiment_classification)"
    Write-TestResult "Detailed Analysis" ($sentiment.detailed_analysis -ne $null) "Analysis provided"
} else {
    Write-TestResult "Sentiment Analysis" $false "Error: $($sentimentTest.Error)"
}

# Test 5: Statistical Prediction
Write-TestHeader "🔮 STATISTICAL PREDICTION"

$predictionData = @{
    data = @(10, 15, 12, 18, 22, 25, 30, 28, 35, 40, 45, 50)
    method = "linear_regression"
    options = @{
        forecast_length = 5
    }
}

$predictionTest = Invoke-APITest -Endpoint "/api/analytics/predict" -Method "POST" -Body $predictionData
if ($predictionTest.Success) {
    $prediction = $predictionTest.Data
    Write-TestResult "Linear Regression Prediction" ($prediction.predictions -ne $null) "Predictions: $($prediction.predictions.Count)" $prediction.predictions
    Write-TestResult "Confidence Score" ($prediction.confidence -gt 0) "Confidence: $([math]::Round($prediction.confidence, 3))"
    Write-TestResult "Model Metadata" ($prediction.metadata -ne $null) "Method: $($prediction.metadata.method)" $prediction.metadata
} else {
    Write-TestResult "Statistical Prediction" $false "Error: $($predictionTest.Error)"
}

# Test 6: Time Series Forecasting
Write-TestHeader "📈 TIME SERIES FORECASTING"

$forecastData = @{
    data = @(
        @{ timestamp = "2025-01-01"; value = 100 },
        @{ timestamp = "2025-01-02"; value = 110 },
        @{ timestamp = "2025-01-03"; value = 105 },
        @{ timestamp = "2025-01-04"; value = 120 },
        @{ timestamp = "2025-01-05"; value = 130 },
        @{ timestamp = "2025-01-06"; value = 125 },
        @{ timestamp = "2025-01-07"; value = 140 }
    )
    timeframe = "1_week"
    metrics = @{
        confidence_interval = 0.95
    }
}

$forecastTest = Invoke-APITest -Endpoint "/api/analytics/forecast" -Method "POST" -Body $forecastData
if ($forecastTest.Success) {
    $forecast = $forecastTest.Data
    Write-TestResult "Multi-method Forecasting" ($forecast.individual_forecasts -ne $null) "Methods: $($forecast.individual_forecasts.Keys -join ', ')"
    Write-TestResult "Combined Forecast" ($forecast.combined_forecast -ne $null) "Predictions: $($forecast.combined_forecast.predictions.Count)"
    Write-TestResult "Trend Identification" ($forecast.trends -ne $null) "Trends detected"
    Write-TestResult "Seasonal Patterns" ($forecast.seasonal_patterns -ne $null) "Patterns analyzed"
} else {
    Write-TestResult "Time Series Forecasting" $false "Error: $($forecastTest.Error)"
}

# Test 7: Anomaly Detection
Write-TestHeader "🚨 ANOMALY DETECTION"

$anomalyData = @{
    data = @(10, 12, 11, 13, 15, 14, 16, 50, 12, 11, 13, 10, 85, 12, 14) # Contains obvious anomalies
    sensitivity = 0.95
    realTime = $false
}

$anomalyTest = Invoke-APITest -Endpoint "/api/analytics/anomaly-detection" -Method "POST" -Body $anomalyData
if ($anomalyTest.Success) {
    $anomaly = $anomalyTest.Data
    Write-TestResult "Multi-method Anomaly Detection" ($anomaly.individual_methods -ne $null) "Methods: $($anomaly.individual_methods.Keys -join ', ')"
    Write-TestResult "Combined Anomaly Results" ($anomaly.combined_anomalies -ne $null) "Anomalies: $($anomaly.anomalies_detected)"
    Write-TestResult "Data Points Analyzed" ($anomaly.data_points_analyzed -eq 15) "Points: $($anomaly.data_points_analyzed)"
} else {
    Write-TestResult "Anomaly Detection" $false "Error: $($anomalyTest.Error)"
}

# Test 8: Pattern Discovery
Write-TestHeader "🔍 PATTERN DISCOVERY"

$patternData = @{
    data = @(
        @{ category = "A"; value = 10 },
        @{ category = "B"; value = 20 },
        @{ category = "A"; value = 15 },
        @{ category = "C"; value = 30 },
        @{ category = "B"; value = 25 },
        @{ category = "A"; value = 12 }
    )
    algorithm = "frequency"
    parameters = @{
        min_support = 0.1
    }
}

$patternTest = Invoke-APITest -Endpoint "/api/analytics/pattern-discovery" -Method "POST" -Body $patternData
if ($patternTest.Success) {
    $pattern = $patternTest.Data
    Write-TestResult "Pattern Discovery Algorithm" ($pattern.algorithm -eq "frequency") "Algorithm: $($pattern.algorithm)"
    Write-TestResult "Patterns Found" ($pattern.patterns_discovered -ge 0) "Patterns: $($pattern.patterns_discovered)"
    Write-TestResult "Pattern Insights" ($pattern.insights -ne $null) "Insights generated"
} else {
    Write-TestResult "Pattern Discovery" $false "Error: $($patternTest.Error)"
}

# Test 9: Recommendation Engine
Write-TestHeader "💡 RECOMMENDATION ENGINE"

$recommendationData = @{
    userId = "test_user_123"
    context = @{
        user_preferences = @("technology", "analytics", "data_science")
        recent_activity = @("viewed_dashboard", "ran_analysis", "generated_report")
    }
    preferences = @{
        recommendation_count = 5
        include_explanations = $true
    }
}

$recommendationTest = Invoke-APITest -Endpoint "/api/recommendations/generate" -Method "POST" -Body $recommendationData
if ($recommendationTest.Success) {
    $recommendation = $recommendationTest.Data
    Write-TestResult "User Profile Analysis" ($recommendation.user_profile -ne $null) "Profile generated"
    Write-TestResult "Recommendations Generated" ($recommendation.recommendations -ne $null) "Count: $($recommendation.recommendation_count)"
    Write-TestResult "User Context Processing" ($recommendation.context -ne $null) "Context processed"
} else {
    Write-TestResult "Recommendation Engine" $false "Error: $($recommendationTest.Error)"
}

# Test 10: Report Generation
Write-TestHeader "📄 AUTOMATED REPORT GENERATION"

$reportData = @{
    reportType = "analytics_summary"
    data = @{
        metrics = @{
            total_users = 1500
            active_sessions = 250
            conversion_rate = 0.12
        }
        time_period = "last_30_days"
    }
    format = "json"
    options = @{
        include_charts = $true
        detailed_analysis = $true
    }
}

$reportTest = Invoke-APITest -Endpoint "/api/reports/generate" -Method "POST" -Body $reportData
if ($reportTest.Success) {
    $report = $reportTest.Data
    Write-TestResult "Report Generation" ($report.report_id -ne $null) "Report ID: $($report.report_id)"
    Write-TestResult "Report URL Generated" ($report.report_url -ne $null) "URL: $($report.report_url)"
    Write-TestResult "Processing Time" ($report.processing_time -gt 0) "Time: $($report.processing_time)ms"
    
    # Test report retrieval
    if ($report.report_id) {
        $reportRetrievalTest = Invoke-APITest -Endpoint "/api/reports/$($report.report_id)"
        if ($reportRetrievalTest.Success) {
            Write-TestResult "Report Retrieval" $true "Report content retrieved"
        } else {
            Write-TestResult "Report Retrieval" $false "Error: $($reportRetrievalTest.Error)"
        }
    }
} else {
    Write-TestResult "Report Generation" $false "Error: $($reportTest.Error)"
}

# Test 11: Text Mining
Write-TestHeader "📖 TEXT MINING & ANALYSIS"

$textMiningData = @{
    texts = @(
        "This product is amazing and I love using it every day.",
        "The service quality is poor and needs improvement.",
        "Great experience overall, would recommend to others.",
        "Disappointed with the recent updates and changes.",
        "Excellent customer support and fast response times."
    )
    options = @{
        topic_count = 3
        include_sentiment = $true
    }
}

$textMiningTest = Invoke-APITest -Endpoint "/api/nlp/text-mining" -Method "POST" -Body $textMiningData
if ($textMiningTest.Success) {
    $textMining = $textMiningTest.Data
    Write-TestResult "Text Processing" ($textMining.texts_processed -eq 5) "Texts: $($textMining.texts_processed)"
    Write-TestResult "Topic Extraction" ($textMining.topics -ne $null) "Topics: $($textMining.topics.Count)"
    Write-TestResult "Sentiment Distribution" ($textMining.sentiment_distribution -ne $null) "Distribution calculated"
    Write-TestResult "Common Patterns" ($textMining.common_patterns -ne $null) "Patterns found"
} else {
    Write-TestResult "Text Mining" $false "Error: $($textMiningTest.Error)"
}

# Test 12: Statistical Analysis
Write-TestHeader "📊 STATISTICAL ANALYSIS SUITE"

$statisticalData = @{
    data = @(12, 15, 18, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50)
    tests = @("normality", "correlation")
    options = @{
        confidence_level = 0.95
        include_distribution = $true
    }
}

$statisticalTest = Invoke-APITest -Endpoint "/api/analytics/statistical-analysis" -Method "POST" -Body $statisticalData
if ($statisticalTest.Success) {
    $statistical = $statisticalTest.Data
    Write-TestResult "Descriptive Statistics" ($statistical.descriptive_statistics -ne $null) "Mean: $($statistical.descriptive_statistics.mean)"
    Write-TestResult "Distribution Analysis" ($statistical.distribution_analysis -ne $null) "Type: $($statistical.distribution_analysis.distribution_type)"
    Write-TestResult "Statistical Insights" ($statistical.insights -ne $null) "Insights generated"
} else {
    Write-TestResult "Statistical Analysis" $false "Error: $($statisticalTest.Error)"
}

# Test 13: Real-time Analytics
Write-TestHeader "⚡ REAL-TIME ANALYTICS"

$realTimeData = @{
    streamId = "test_stream_001"
    data = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        value = 75
        category = "performance_metric"
    }
    processing = @{
        anomaly_detection = $true
        pattern_analysis = $false
        sensitivity = 0.9
    }
}

$realTimeTest = Invoke-APITest -Endpoint "/api/realtime/stream" -Method "POST" -Body $realTimeData
if ($realTimeTest.Success) {
    $realTime = $realTimeTest.Data
    Write-TestResult "Real-time Data Processing" ($realTime.processed -eq $true) "Stream: $($realTime.stream_id)"
    Write-TestResult "Data Points Tracking" ($realTime.data_points_total -gt 0) "Points: $($realTime.data_points_total)"
    Write-TestResult "Processing Performance" ($realTime.processing_time -gt 0) "Time: $($realTime.processing_time)ms"
    
    # Test stream status
    $streamStatusTest = Invoke-APITest -Endpoint "/api/realtime/status/$($realTimeData.streamId)"
    if ($streamStatusTest.Success) {
        Write-TestResult "Stream Status Retrieval" $true "Status retrieved"
    } else {
        Write-TestResult "Stream Status Retrieval" $false "Error: $($streamStatusTest.Error)"
    }
} else {
    Write-TestResult "Real-time Analytics" $false "Error: $($realTimeTest.Error)"
}

# Test 14: Natural Language Query Interpretation
Write-TestHeader "🗣️ NATURAL LANGUAGE QUERY INTERPRETATION"

$queryData = @{
    query = "Show me the sales forecast for next month and identify any anomalies in the data"
    context = @{
        user_role = "analyst"
        available_data = @("sales", "revenue", "customers")
        time_range = "last_6_months"
    }
}

$queryTest = Invoke-APITest -Endpoint "/api/nlp/query" -Method "POST" -Body $queryData
if ($queryTest.Success) {
    $query = $queryTest.Data
    Write-TestResult "Query Interpretation" ($query.nlp_analysis -ne $null) "Intent: $($query.nlp_analysis.intent)"
    Write-TestResult "Structured Query Generation" ($query.structured_query -ne $null) "Query generated"
    Write-TestResult "Action Suggestions" ($query.suggested_actions -ne $null) "Suggestions: $($query.suggested_actions.Count)"
    Write-TestResult "Query Executability" ($query.executable -ne $null) "Executable: $($query.executable)"
} else {
    Write-TestResult "Query Interpretation" $false "Error: $($queryTest.Error)"
}

# Final Results Summary
Write-TestHeader "📋 TEST RESULTS SUMMARY"

$TotalTests = $PassedTests + $FailedTests
$SuccessRate = if ($TotalTests -gt 0) { [math]::Round(($PassedTests / $TotalTests) * 100, 2) } else { 0 }

Write-Host "📊 Total Tests: $TotalTests" -ForegroundColor Cyan
Write-Host "✅ Passed: $PassedTests" -ForegroundColor Green
Write-Host "❌ Failed: $FailedTests" -ForegroundColor Red
Write-Host "📈 Success Rate: $SuccessRate%" -ForegroundColor $(if ($SuccessRate -ge 80) { "Green" } elseif ($SuccessRate -ge 60) { "Yellow" } else { "Red" })

if ($FailedTests -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    $TestResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "   • $($_.TestName): $($_.Details)" -ForegroundColor Yellow
    }
}

Write-Host "`n🧠 AI Analytics Engine Testing Complete!" -ForegroundColor Magenta
Write-Host "📅 Test Completed: $(Get-Date)" -ForegroundColor Gray

# Export test results if requested
if ($DetailedOutput) {
    $ResultsFile = "cbd-ai-analytics-test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $TestResults | ConvertTo-Json -Depth 5 | Out-File -FilePath $ResultsFile -Encoding UTF8
    Write-Host "📄 Detailed results exported to: $ResultsFile" -ForegroundColor Blue
}

# Return exit code based on test results
if ($FailedTests -eq 0) {
    Write-Host "🎉 All tests passed! AI Analytics Engine is fully operational." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please review the results above." -ForegroundColor Yellow
    exit 1
}
