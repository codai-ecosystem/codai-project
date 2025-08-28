# North Star AGI Demo - Simplified PowerShell Version
Write-Host "================================" -ForegroundColor Cyan
Write-Host "ROMAI AGI - North Star Demo 2025" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Checking system requirements..." -ForegroundColor Yellow

# Check Python
Write-Host "  ✓ Python:" -NoNewline
try {
    $pythonVersion = python --version
    Write-Host " $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host " ❌ Python not found" -ForegroundColor Red
    exit 1
}

# Check PyTorch
Write-Host "  ✓ PyTorch:" -NoNewline
try {
    $torchCheck = python -c "import torch; print(torch.__version__)"
    Write-Host " $torchCheck" -ForegroundColor Green
}
catch {
    Write-Host " ❌ PyTorch not available" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Navigate to correct directory
Set-Location -Path "e:\GitHub\codai-project\apps\romai\src"

Write-Host "🚀 Starting North Star AGI Demo..." -ForegroundColor Green

# Run the actual AGI baseline measurement
Write-Host "📊 Running AGI Baseline Measurement..." -ForegroundColor Yellow

python -c "
import asyncio
import os
import sys

# Add current directory to path
sys.path.insert(0, os.getcwd())

from agi_baseline_measurement import AGIBaselineSystem

async def main():
    print('🧠 Initializing ROMAI AGI System...')
    system = AGIBaselineSystem()
    
    print('📊 Running comprehensive baseline measurements...')
    baseline_results = await system.generate_comprehensive_baseline()
    
    print('\\n=== NORTH STAR DEMO RESULTS ===')
    print(f'AGI Overall Score: {baseline_results[\"agi_score\"]:.1%}')
    print(f'Measurement Timestamp: {baseline_results[\"measurement_timestamp\"]}')
    print(f'System Version: {baseline_results[\"romai_version\"]}')
    
    print('\\n📈 MLP Capability Scores:')
    for capability, score in baseline_results['mlp_capabilities'].items():
        percentage = score * 100
        print(f'  • {capability.replace(\"_\", \" \").title()}: {percentage:.1f}%')
    
    print('\\n🎯 North Star Progress:')
    ns_score = baseline_results['north_star_capability']
    print(f'  Turing Test Progress: {ns_score * 100:.1f}% (Target: 90%)')
    
    if ns_score >= 0.9:
        print('\\n🏆 NORTH STAR ACHIEVED! ROMAI has reached AGI!')
    elif ns_score >= 0.7:
        print('\\n✨ Strong AGI progress - approaching North Star')
    elif ns_score >= 0.5:
        print('\\n📈 Solid foundation - significant development needed')
    else:
        print('\\n🔧 Early development stage - foundational work required')
    
    return baseline_results

# Run the demo
asyncio.run(main())
"

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ North Star Demo completed successfully!" -ForegroundColor Green
    Write-Host "📄 Results saved to romai_baseline_measurement.json" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Demo failed with exit code: $exitCode" -ForegroundColor Red
}

Write-Host ""
Write-Host "Demo execution finished." -ForegroundColor White