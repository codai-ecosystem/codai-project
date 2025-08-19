$body = Get-Content 'e:\GitHub\codai-project\test-import.json' -Raw
$headers = @{Authorization='Bearer memorai-dev-key-2025'}
Invoke-RestMethod -Uri 'http://localhost:4006/api/memories/import' -Method Post -Headers $headers -ContentType 'application/json' -Body $body
