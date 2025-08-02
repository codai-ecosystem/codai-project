#!/usr/bin/env pwsh
# Add Vercel environment variables properly

# Azure OpenAI Endpoint
vercel env add AZURE_OPENAI_ENDPOINT production --value "https://swedencentral.api.cognitive.microsoft.com/"

# Azure OpenAI API Key  
vercel env add AZURE_OPENAI_API_KEY production --value "8f9d3fd033c04f5ab6b5886c15f16a2c"

# Azure OpenAI Deployment Name
vercel env add AZURE_OPENAI_DEPLOYMENT_NAME production --value "gpt-4o-realtime"

# NextAuth Secret
$secret = -join ((1..32) | ForEach {[char]((65..90) + (97..122) + (48..57) | Get-Random)})
vercel env add NEXTAUTH_SECRET production --value $secret

Write-Host "✅ All environment variables added successfully!" -ForegroundColor Green
