# Phase 1: Service Health Check (Alias to API Suite)
# This provides service health validation functionality

Write-Host "🏥 Phase 1: Service Health Check" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

# Execute the API test suite which includes health checks
& ".\scripts\test-api-suite.ps1"
