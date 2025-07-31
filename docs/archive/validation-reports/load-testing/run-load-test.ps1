# Load Test Runner for Windows
param([int]$Duration = 300, [int]$Users = 1000)

Write-Host "Starting load test with $Users users for $Duration seconds..."

if (Get-Command k6 -ErrorAction SilentlyContinue) {
    k6 run k6-api-test.js --vus $Users --duration "${Duration}s" --out json=load-test-results.json
} else {
    Write-Warning "k6 not found. Please install k6 first."
}
