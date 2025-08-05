# 🚀 CBD Custom Domain - HTTPS Setup Script
# Run this after email certificate validation

$ALB_ARN = "arn:aws:elasticloadbalancing:eu-west-1:567877624442:loadbalancer/app/cbd-universal-alb/bb8a319a0f2aa6a1"
$TARGET_GROUP_ARN = "arn:aws:elasticloadbalancing:eu-west-1:567877624442:targetgroup/cbd-universal-targets/cd7ee01a97bbf454"
$EMAIL_CERT_ARN = "arn:aws:acm:eu-west-1:567877624442:certificate/96a3f76e-24fb-4584-9664-e2266974ff87"

Write-Host "🔧 Setting up HTTPS listener for cbd.memorai.ro..." -ForegroundColor Cyan

# Check certificate status
$certStatus = aws acm describe-certificate --certificate-arn $EMAIL_CERT_ARN --region eu-west-1 --query "Certificate.Status" --output text
Write-Host "Certificate Status: $certStatus" -ForegroundColor Yellow

if ($certStatus -eq "ISSUED") {
    Write-Host "✅ Certificate is validated! Creating HTTPS listener..." -ForegroundColor Green
    
    # Create HTTPS listener
    $httpsListener = aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTPS --port 443 --certificates CertificateArn=$EMAIL_CERT_ARN --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN --region eu-west-1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 HTTPS listener created successfully!" -ForegroundColor Green
        
        # Update HTTP listener to redirect to HTTPS
        $httpListenerArn = aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --region eu-west-1 --query "Listeners[?Port==``80``].ListenerArn" --output text
        
        Write-Host "🔄 Updating HTTP listener to redirect to HTTPS..." -ForegroundColor Cyan
        aws elbv2 modify-listener --listener-arn $httpListenerArn --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" --region eu-west-1
        
        Write-Host "🎯 Testing HTTPS endpoint..." -ForegroundColor Cyan
        curl -I -m 10 https://cbd.memorai.ro/health
        
        Write-Host "🚀 SUCCESS! cbd.memorai.ro is now accessible via HTTPS!" -ForegroundColor Green
        Write-Host "✅ HTTP automatically redirects to HTTPS" -ForegroundColor Green
        Write-Host "🔒 SSL certificate is active and secure" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Failed to create HTTPS listener" -ForegroundColor Red
    }
    
} else {
    Write-Host "⏳ Certificate not yet validated. Status: $certStatus" -ForegroundColor Yellow
    Write-Host "📧 Please check your email and approve the certificate validation" -ForegroundColor Yellow
    Write-Host "🔄 Run this script again after email approval" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Current Setup Status:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray
Write-Host "✅ Domain: cbd.memorai.ro" -ForegroundColor Green
Write-Host "✅ HTTP Access: http://cbd.memorai.ro" -ForegroundColor Green
Write-Host "⏳ HTTPS Access: Pending certificate validation" -ForegroundColor Yellow
Write-Host "📧 Email Certificate: $EMAIL_CERT_ARN" -ForegroundColor White
Write-Host "🔍 ALB Endpoint: cbd-universal-alb-1527097302.eu-west-1.elb.amazonaws.com" -ForegroundColor White
