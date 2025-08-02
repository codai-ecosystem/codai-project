# Setup Vercel Environment Variables Script
# This script sets up environment variables for CODAI ecosystem apps

Write-Host "🔧 Setting up Vercel Environment Variables..." -ForegroundColor Green

# Function to add environment variable
function Add-VercelEnv {
    param(
        [string]$ProjectPath,
        [string]$VarName,
        [string]$VarValue,
        [string]$Environment = "development,preview,production"
    )
    
    Write-Host "Adding $VarName to $ProjectPath..." -ForegroundColor Cyan
    Set-Location $ProjectPath
    echo $VarValue | vercel env add $VarName $Environment
    Set-Location ..
}

# CODAI App Environment Variables
Write-Host "📦 Setting up CODAI app environment..." -ForegroundColor Yellow
Set-Location "apps/codai"

# Azure OpenAI Configuration
echo "2JmGjCLh0AYJfYn1saLjAYasj9rdIJiK7Y2nX4EUtD5HtnpgIFKrJQQJ99BFACHYHv6XJ3w3AAABACOGM6y6" | vercel env add AZURE_OPENAI_API_KEY
echo "https://aide-openai-dev.openai.azure.com/" | vercel env add AZURE_OPENAI_ENDPOINT
echo "2024-12-01-preview" | vercel env add AZURE_OPENAI_API_VERSION

# Firebase Configuration
echo "AIzaSyA2Ofgv-PznryvAwVH-Ws-S_5qLOdL58f4" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
echo "codai-ecosystem.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
echo "codai-ecosystem" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo "codai-ecosystem.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
echo "637430467623" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
echo "1:637430467623:web:eec13e4151bc7f7b211202" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# App Configuration
echo "https://codai.ro" | vercel env add NEXT_PUBLIC_APP_URL
echo "https://api.codai.ro" | vercel env add NEXT_PUBLIC_API_BASE_URL
echo "Main CODAI platform" | vercel env add NEXT_PUBLIC_APP_DESCRIPTION

Set-Location ../..

# MEMORAI App Environment Variables
Write-Host "📦 Setting up MEMORAI app environment..." -ForegroundColor Yellow
Set-Location "apps/memorai"

# Azure OpenAI Configuration (same as CODAI)
echo "2JmGjCLh0AYJfYn1saLjAYasj9rdIJiK7Y2nX4EUtD5HtnpgIFKrJQQJ99BFACHYHv6XJ3w3AAABACOGM6y6" | vercel env add AZURE_OPENAI_API_KEY
echo "https://aide-openai-dev.openai.azure.com/" | vercel env add AZURE_OPENAI_ENDPOINT
echo "2024-12-01-preview" | vercel env add AZURE_OPENAI_API_VERSION

# Firebase Configuration (MEMORAI specific)
echo "AIzaSyA2Ofgv-PznryvAwVH-Ws-S_5qLOdL58f4" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
echo "codai-ecosystem.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
echo "codai-ecosystem" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo "codai-ecosystem.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
echo "637430467623" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
echo "1:637430467623:web:a39daabf004e45ea211202" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# App Configuration
echo "https://memorai.ro" | vercel env add NEXT_PUBLIC_APP_URL
echo "https://api.memorai.ro" | vercel env add NEXT_PUBLIC_API_BASE_URL
echo "AI-powered memory platform" | vercel env add NEXT_PUBLIC_APP_DESCRIPTION

Set-Location ../..

Write-Host "✅ Environment variables setup completed!" -ForegroundColor Green
