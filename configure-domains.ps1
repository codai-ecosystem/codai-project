# CODAI Custom Domain Configuration Script

Write-Host "🌐 CODAI Custom Domain Configuration" -ForegroundColor Green
Write-Host "=================================="

# Domain mapping configuration
$domains = @{
    "auth.codai.ro" = "codai-auth-r0khnm5wj-codai-ro.vercel.app"
    "hub.codai.ro" = "codai-qodfkjkh8-codai-ro.vercel.app"
    "id.codai.ro" = "codai-i3nx4k1s7-codai-ro.vercel.app"
    "codai.ro" = "codai-standalone-asonw7yrx-codai-ro.vercel.app"
}

Write-Host "📋 Domain Mapping Plan:" -ForegroundColor Yellow
foreach ($domain in $domains.GetEnumerator()) {
    Write-Host "  $($domain.Key) → $($domain.Value)" -ForegroundColor Cyan
}

Write-Host "`n🔧 Configuration Steps:" -ForegroundColor Yellow
Write-Host "1. Configure domains in Vercel dashboard"
Write-Host "2. Add DNS records in domain provider"
Write-Host "3. Disable Vercel organization protection"
Write-Host "4. Test public access"

# Vercel domain configuration commands
Write-Host "`n📝 Vercel CLI Commands:" -ForegroundColor Yellow

foreach ($domain in $domains.GetEnumerator()) {
    $projectName = $domain.Value.Split('.')[0]
    Write-Host "vercel domains add $($domain.Key) --scope=codai-ro" -ForegroundColor Green
}

Write-Host "`n🔐 DNS Configuration Required:" -ForegroundColor Yellow
Write-Host "Add CNAME records in your DNS provider:"
foreach ($domain in $domains.GetEnumerator()) {
    Write-Host "  CNAME $($domain.Key) → cname.vercel-dns.com" -ForegroundColor Cyan
}

Write-Host "`n⚠️  Manual Steps Required:" -ForegroundColor Red
Write-Host "1. Log into Vercel dashboard (https://vercel.com/codai-ro)"
Write-Host "2. Navigate to each project settings"
Write-Host "3. Add custom domain in Domains section"
Write-Host "4. Configure DNS records with your domain provider"
Write-Host "5. Disable organization protection for public access"

Write-Host "`n✅ Expected Final URLs:" -ForegroundColor Green
foreach ($domain in $domains.GetEnumerator()) {
    Write-Host "  https://$($domain.Key) (Production Ready)" -ForegroundColor Green
}

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
