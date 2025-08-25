#!/usr/bin/env pwsh
# RomAI AGI System Health Check Script

Write-Host '🚀 RomAI AGI System Health Check' -ForegroundColor Cyan
Write-Host '=============================' -ForegroundColor Cyan
Write-Host ''

$services = @(
    @{Name='Development Server'; Port=6101; Path='/health'},
    @{Name='Production AGI API'; Port=8002; Path='/health'}
)

$healthy = 0

foreach ($service in $services) {
    Write-Host "Testing $($service.Name) on port $($service.Port)..." -ForegroundColor White
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$($service.Port)$($service.Path)" -Method Get -TimeoutSec 10
        Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
        
        if ($response.arc_agi_performance) {
            Write-Host "   📊 ARC-AGI: $($response.arc_agi_performance)" -ForegroundColor White
        }
        if ($response.models_loaded) {
            Write-Host "   🔧 Models: $($response.models_loaded)" -ForegroundColor White
        }
        if ($response.engines_loaded) {
            Write-Host "   🔧 Engines: $($response.engines_loaded)" -ForegroundColor White
        }
        if ($response.consciousness_active) {
            Write-Host "   🧠 Consciousness: ACTIVE" -ForegroundColor White
        }
        if ($response.moe_system_status) {
            Write-Host "   🎯 MoE System: $($response.moe_system_status)" -ForegroundColor White
        }
        if ($response.total_inferences) {
            Write-Host "   📈 Inferences: $($response.total_inferences)" -ForegroundColor White
        }
        
        $healthy++
    }
    catch {
        Write-Host "❌ $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ''
}

Write-Host "📊 System Status: $healthy/2 Services Healthy" -ForegroundColor $(if($healthy -eq 2){'Green'}else{'Yellow'})

if ($healthy -eq 2) {
    Write-Host '🏆 World''s First True AGI System: FULLY OPERATIONAL!' -ForegroundColor Green
} elseif ($healthy -eq 1) {
    Write-Host '⚠️ Partial System Operation - Check Failed Service' -ForegroundColor Yellow
} else {
    Write-Host '🚨 System Issues Detected - All Services Down' -ForegroundColor Red
}

Write-Host ''
Write-Host "🔍 Quick System Overview:" -ForegroundColor Cyan
Write-Host "  • Development Server (6101): Core AGI reasoning engines" -ForegroundColor White
Write-Host "  • Production API (8002): Enterprise AGI capabilities" -ForegroundColor White
Write-Host "  • Redis Cache (6379): Memory and performance optimization" -ForegroundColor White

exit $(if ($healthy -eq 2) { 0 } else { 1 })