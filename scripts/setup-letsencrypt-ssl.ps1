# 🔐 Let's Encrypt SSL Certificate Setup Guide
# Independent SSL solution - No cloud provider dependencies

Write-Host "🚀 Setting up Let's Encrypt SSL Certificate for cbd.memorai.ro" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Gray

# Set Certbot path
$certbotPath = "C:\Program Files\Certbot\bin\certbot.exe"

# Step 1: Create certificate with manual HTTP validation
Write-Host "🔧 Step 1: Requesting SSL certificate..." -ForegroundColor Yellow
Write-Host "This will use HTTP-01 challenge validation" -ForegroundColor White
Write-Host "Your domain cbd.memorai.ro is working, so this should succeed!" -ForegroundColor Green
Write-Host ""

# Manual certificate request command
$certCommand = @"
& "$certbotPath" certonly --manual --preferred-challenges http --email codaiecosystem@gmail.com --agree-tos --no-eff-email --domains cbd.memorai.ro
"@

Write-Host "🎯 Certificate Request Command:" -ForegroundColor Cyan
Write-Host $certCommand -ForegroundColor White
Write-Host ""

Write-Host "📋 What will happen:" -ForegroundColor Yellow
Write-Host "1. Certbot will provide a challenge token" -ForegroundColor White
Write-Host "2. You'll need to make this token available at:" -ForegroundColor White
Write-Host "   http://cbd.memorai.ro/.well-known/acme-challenge/[TOKEN]" -ForegroundColor Cyan
Write-Host "3. We can add this to your ALB or ECS service" -ForegroundColor White
Write-Host "4. Certbot validates and generates certificate" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Certificate will be stored at:" -ForegroundColor Green
Write-Host "Certificate: C:\Certbot\live\cbd.memorai.ro\fullchain.pem" -ForegroundColor White
Write-Host "Private Key: C:\Certbot\live\cbd.memorai.ro\privkey.pem" -ForegroundColor White
Write-Host ""

Write-Host "⚡ Ready to proceed? Run this command:" -ForegroundColor Yellow
Write-Host $certCommand -ForegroundColor Cyan
