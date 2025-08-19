# GraphQL Health Test Script
param(
  [string]$Url = "http://localhost:4500/",
  [int]$TimeoutSec = 8,
  [string]$ApiKey = $env:GRAPHQL_CLIENT_API_KEY,
  [string]$Bearer = $env:GRAPHQL_SERVICE_TOKEN
)

Write-Host "🚀 Testing MemorAI GraphQL Health..." -ForegroundColor Cyan

$body = @{ query = "query health { health { status version uptime } }" } | ConvertTo-Json -Compress

try {
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($ApiKey) { $headers['X-API-Key'] = $ApiKey }
  if ($Bearer) { $headers['Authorization'] = ("Bearer {0}" -f $Bearer) }
  $response = Invoke-RestMethod -Uri $Url -Method Post -Body $body -Headers $headers -TimeoutSec $TimeoutSec
  Write-Host "✅ GraphQL Health: HEALTHY" -ForegroundColor Green
  $response | ConvertTo-Json -Depth 5
} catch {
  Write-Host "❌ GraphQL Health: FAILED" -ForegroundColor Red
  Write-Host ("Error: {0}" -f $_.Exception.Message) -ForegroundColor Yellow
  if ($_.ErrorDetails.Message) {
    Write-Host $_.ErrorDetails.Message -ForegroundColor DarkYellow
  }
  exit 1
}
