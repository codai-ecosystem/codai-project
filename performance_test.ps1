# RomAI Performance Testing Script
# Test response times and accuracy across different endpoints

$results = @()
$testCases = @(
    @{
        endpoint = 'http://localhost:6101/api/v1/mathematical-reasoning/solve'
        body = @{problem='Calculate 125 * 8 + 67'; context='arithmetic'}
        name = 'Math Reasoning'
    },
    @{
        endpoint = 'http://localhost:6101/api/v1/logical-reasoning/analyze'
        body = @{query='If all birds can fly and penguins are birds, can penguins fly?'}
        name = 'Logic Reasoning'
    },
    @{
        endpoint = 'http://localhost:6101/api/v1/romanian-intelligence/chat'
        body = @{message='Care sunt principalele caracteristici ale limbii române?'; context='romanian'}
        name = 'Romanian Intelligence'
    }
)

Write-Host "🚀 RomAI Performance Testing Started" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

foreach ($test in $testCases) {
    Write-Host "`n🧪 Testing: $($test.name)" -ForegroundColor Yellow
    
    $startTime = Get-Date
    try {
        $response = Invoke-RestMethod -Uri $test.endpoint -Method Post -Body ($test.body | ConvertTo-Json) -ContentType 'application/json'
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        $result = @{
            Test = $test.name
            ResponseTime = [math]::Round($responseTime, 2)
            Success = $response.success
            Confidence = if ($response.confidence) { [math]::Round($response.confidence * 100, 1) } else { 'N/A' }
        }
        
        $results += $result
        
        Write-Host "✅ Success: $($result.Success)" -ForegroundColor Green
        Write-Host "⏱️  Response Time: $($result.ResponseTime)ms" -ForegroundColor White
        Write-Host "🎯 Confidence: $($result.Confidence)%" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Test = $test.name
            ResponseTime = 'ERROR'
            Success = $false
            Confidence = 'ERROR'
        }
    }
}

Write-Host "`n📊 Performance Summary:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$successfulTests = ($results | Where-Object { $_.Success -eq $true }).Count
$averageResponseTime = ($results | Where-Object { $_.ResponseTime -ne 'ERROR' } | ForEach-Object { $_.ResponseTime } | Measure-Object -Average).Average

Write-Host "✅ Successful Tests: $successfulTests / $($results.Count)" -ForegroundColor Green
Write-Host "⏱️  Average Response Time: $([math]::Round($averageResponseTime, 2))ms" -ForegroundColor White
$targetMet = if ($averageResponseTime -lt 500) { 'YES' } else { 'NO' }
$targetColor = if ($averageResponseTime -lt 500) { 'Green' } else { 'Red' }
Write-Host "Target Achievement: $targetMet (<500ms target)" -ForegroundColor $targetColor

# Check server health after tests
$health = Invoke-RestMethod -Uri 'http://localhost:6101/health' -Method Get
Write-Host "`n🏥 Server Health After Testing:" -ForegroundColor Cyan
Write-Host "Status: $($health.status)" -ForegroundColor $(if ($health.status -eq 'healthy') { 'Green' } else { 'Red' })
Write-Host "Total Inferences: $($health.total_inferences)" -ForegroundColor White
Write-Host "MOE Status: $($health.moe_system_status)" -ForegroundColor White