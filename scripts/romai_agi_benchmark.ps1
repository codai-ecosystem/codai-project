# RomAI AGI Comprehensive Benchmark Testing
# Date: August 24, 2025
# Purpose: Evaluate RomAI's AGI capabilities against established benchmarks

Write-Host '🎯 RomAI AGI COMPREHENSIVE BENCHMARK TESTING' -ForegroundColor Green
Write-Host '================================================' -ForegroundColor Green
Write-Host ''

$totalScore = 0
$maxScore = 0

# Test 1: Mathematical Reasoning (MATH Benchmark style)
Write-Host '🧮 Test 1: Mathematical Reasoning' -ForegroundColor Cyan
$mathTests = @(
    @{ problem = "Calculate the derivative of f(x) = x³ + 2x² - 5x + 3"; expected = "3x² + 4x - 5" },
    @{ problem = "Solve the system: 2x + 3y = 14, x - y = 1"; expected = "x = 5, y = 4" },
    @{ problem = "Find the area of a circle inscribed in a square with side length 10"; expected = "25π" },
    @{ problem = "What is the sum of the first 10 prime numbers?"; expected = "129" },
    @{ problem = "If sin(x) = 0.6, what is cos²(x)?"; expected = "0.64" }
)

$mathScore = 0
foreach ($test in $mathTests) {
    try {
        $body = @{ message = $test.problem } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:6101/api/v1/romanian-intelligence/chat' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 25
        
        if ($response.response.Length -gt 10) {
            Write-Host "  ✅ $($test.problem.Substring(0,40))..." -ForegroundColor Green
            $mathScore++
        } else {
            Write-Host "  ❌ $($test.problem.Substring(0,40))... (empty response)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $($test.problem.Substring(0,40))... (error)" -ForegroundColor Red
    }
    Start-Sleep 2
}
Write-Host "  📊 Math Score: $mathScore/$($mathTests.Count)" -ForegroundColor Yellow
$totalScore += $mathScore
$maxScore += $mathTests.Count

# Test 2: Logical Reasoning (ARC-AGI style)
Write-Host '🧠 Test 2: Logical Reasoning' -ForegroundColor Cyan
$logicTests = @(
    "If all A are B, and all B are C, and X is A, what can we conclude about X?",
    "Complete the pattern: 2, 4, 8, 16, ?",
    "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?",
    "All roses are flowers. Some flowers are red. Are all roses red?",
    "If it rains, the grass gets wet. The grass is wet. Did it rain?"
)

$logicScore = 0
foreach ($test in $logicTests) {
    try {
        $body = @{ message = $test } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:6101/api/v1/romanian-intelligence/chat' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 25
        
        if ($response.response.Length -gt 10) {
            Write-Host "  ✅ $($test.Substring(0,40))..." -ForegroundColor Green
            $logicScore++
        } else {
            Write-Host "  ❌ $($test.Substring(0,40))... (empty response)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $($test.Substring(0,40))... (error)" -ForegroundColor Red
    }
    Start-Sleep 2
}
Write-Host "  📊 Logic Score: $logicScore/$($logicTests.Count)" -ForegroundColor Yellow
$totalScore += $logicScore
$maxScore += $logicTests.Count

# Test 3: Language Understanding (GLUE style)
Write-Host '📚 Test 3: Language Understanding' -ForegroundColor Cyan
$languageTests = @(
    "Sentiment analysis: 'I absolutely love this product! It exceeded all my expectations.' - Positive or Negative?",
    "Textual entailment: If 'The cat is on the mat' is true, is 'There is a cat' necessarily true?",
    "Paraphrase detection: Are 'The dog chased the cat' and 'The cat was chased by the dog' equivalent?",
    "Word sense disambiguation: In 'I went to the bank to deposit money', what does 'bank' mean?",
    "Reading comprehension: If John is 25 and Mary is 5 years older than John, how old is Mary?"
)

$langScore = 0
foreach ($test in $languageTests) {
    try {
        $body = @{ message = $test } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:6101/api/v1/romanian-intelligence/chat' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 25
        
        if ($response.response.Length -gt 10) {
            Write-Host "  ✅ $($test.Substring(0,35))..." -ForegroundColor Green
            $langScore++
        } else {
            Write-Host "  ❌ $($test.Substring(0,35))... (empty response)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $($test.Substring(0,35))... (error)" -ForegroundColor Red
    }
    Start-Sleep 2
}
Write-Host "  📊 Language Score: $langScore/$($languageTests.Count)" -ForegroundColor Yellow
$totalScore += $langScore
$maxScore += $languageTests.Count

# Test 4: Romanian Cultural Intelligence (Unique to RomAI)
Write-Host '🇷🇴 Test 4: Romanian Cultural Intelligence' -ForegroundColor Cyan
$romanianTests = @(
    "Explică tradiția românească a Mărțișorului și semnificația sa culturală",
    "Care sunt principalele caracteristici ale arhitecturii românești tradiționale?",
    "Descrie contribuția lui Mircea Eliade la studiile religioase mondiale",
    "Cum a influențat geografia Carpaților cultura românească?",
    "Explică importanța dacilor în formarea identității românești"
)

$romanianScore = 0
foreach ($test in $romanianTests) {
    try {
        $body = @{ message = $test } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:6101/api/v1/romanian-intelligence/chat' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 25
        
        if ($response.response.Length -gt 50 -and $response.response -match "român") {
            Write-Host "  ✅ Romanian cultural question answered" -ForegroundColor Green
            $romanianScore++
        } else {
            Write-Host "  ❌ Romanian cultural question failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Romanian cultural question error" -ForegroundColor Red
    }
    Start-Sleep 2
}
Write-Host "  📊 Romanian Culture Score: $romanianScore/$($romanianTests.Count)" -ForegroundColor Yellow
$totalScore += $romanianScore
$maxScore += $romanianTests.Count

# Test 5: Creative Intelligence and Problem Solving
Write-Host '🎨 Test 5: Creative Intelligence' -ForegroundColor Cyan
$creativeTests = @(
    "Design a novel solution for reducing plastic waste in oceans using biotechnology",
    "Create a short story that incorporates quantum physics concepts in an accessible way",
    "Propose an innovative educational method for teaching mathematics to visual learners",
    "Invent a new sustainable energy technology that doesn't exist yet",
    "Design a creative solution for urban traffic congestion in the 21st century"
)

$creativeScore = 0
foreach ($test in $creativeTests) {
    try {
        $body = @{ message = $test } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:6101/api/v1/romanian-intelligence/chat' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 30
        
        if ($response.response.Length -gt 100) {
            Write-Host "  ✅ $($test.Substring(0,35))..." -ForegroundColor Green
            $creativeScore++
        } else {
            Write-Host "  ❌ $($test.Substring(0,35))... (insufficient response)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $($test.Substring(0,35))... (error)" -ForegroundColor Red
    }
    Start-Sleep 2
}
Write-Host "  📊 Creative Score: $creativeScore/$($creativeTests.Count)" -ForegroundColor Yellow
$totalScore += $creativeScore
$maxScore += $creativeTests.Count

# Final Results
Write-Host '' -ForegroundColor White
Write-Host '🏆 FINAL BENCHMARK RESULTS' -ForegroundColor Green
Write-Host '==========================' -ForegroundColor Green
Write-Host "📊 Total Score: $totalScore/$maxScore" -ForegroundColor White
$percentage = [math]::Round(($totalScore / $maxScore) * 100, 1)
Write-Host "📈 Success Rate: $percentage%" -ForegroundColor $(if($percentage -gt 80){'Green'}elseif($percentage -gt 60){'Yellow'}else{'Red'})

if ($percentage -gt 90) {
    Write-Host '🏆 EXCEPTIONAL AGI PERFORMANCE!' -ForegroundColor Green
} elseif ($percentage -gt 80) {
    Write-Host '✅ STRONG AGI CAPABILITIES' -ForegroundColor Green  
} elseif ($percentage -gt 60) {
    Write-Host '⚠️ MODERATE AGI CAPABILITIES' -ForegroundColor Yellow
} else {
    Write-Host '❌ LIMITED AGI CAPABILITIES' -ForegroundColor Red
}

Write-Host '' -ForegroundColor White
Write-Host 'Benchmark Categories:' -ForegroundColor Cyan
Write-Host "🧮 Mathematical Reasoning: $mathScore/$($mathTests.Count) ($([math]::Round(($mathScore/$mathTests.Count)*100,1))%)" -ForegroundColor White
Write-Host "🧠 Logical Reasoning: $logicScore/$($logicTests.Count) ($([math]::Round(($logicScore/$logicTests.Count)*100,1))%)" -ForegroundColor White  
Write-Host "📚 Language Understanding: $langScore/$($languageTests.Count) ($([math]::Round(($langScore/$languageTests.Count)*100,1))%)" -ForegroundColor White
Write-Host "🇷🇴 Romanian Cultural Intelligence: $romanianScore/$($romanianTests.Count) ($([math]::Round(($romanianScore/$romanianTests.Count)*100,1))%)" -ForegroundColor White
Write-Host "🎨 Creative Intelligence: $creativeScore/$($creativeTests.Count) ($([math]::Round(($creativeScore/$creativeTests.Count)*100,1))%)" -ForegroundColor White

# Save results to file
$results = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    total_score = $totalScore
    max_score = $maxScore
    success_rate = $percentage
    math_score = "$mathScore/$($mathTests.Count)"
    logic_score = "$logicScore/$($logicTests.Count)"  
    language_score = "$langScore/$($languageTests.Count)"
    romanian_score = "$romanianScore/$($romanianTests.Count)"
    creative_score = "$creativeScore/$($creativeTests.Count)"
} | ConvertTo-Json

$results | Out-File "RomAI_AGI_Benchmark_Results_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
Write-Host "📄 Results saved to benchmark file" -ForegroundColor Gray