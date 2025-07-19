# CODAI Ecosystem - Environment Files Solution
# This script creates .env files that can be imported to Vercel using vercel env pull

Write-Host "🔧 CODAI Environment Files Solution" -ForegroundColor Green
Write-Host "===================================="

# Load actual environment variables from root .env
$rootEnvPath = ".\.env"
$envVars = @{}

if (Test-Path $rootEnvPath) {
    Write-Host "📋 Loading environment variables from root .env..." -ForegroundColor Yellow
    
    Get-Content $rootEnvPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value -replace '^"(.*)"$', '$1'
            $envVars[$key] = $value
        }
    }
    
    Write-Host "✅ Loaded $($envVars.Count) environment variables" -ForegroundColor Green
} else {
    Write-Host "❌ Root .env file not found!" -ForegroundColor Red
    exit 1
}

# Define app configurations with domains
$appConfigs = @{
    'acasai' = @{ 'domain' = 'acasai.ro'; 'port' = '3000' }
    'admin' = @{ 'domain' = 'admin.codai.ro'; 'port' = '3100' }
    'aide' = @{ 'domain' = 'aide.codai.ro'; 'port' = '3200' }
    'ajutai' = @{ 'domain' = 'ajutai.ro'; 'port' = '3300' }
    'bancai' = @{ 'domain' = 'bancai.ro'; 'port' = '3400' }
    'codai' = @{ 'domain' = 'codai.ro'; 'port' = '3500' }
    'docs' = @{ 'domain' = 'docs.codai.ro'; 'port' = '3600' }
    'fabricai' = @{ 'domain' = 'fabricai.ro'; 'port' = '3700' }
    'glass' = @{ 'domain' = 'controlai.ro'; 'port' = '3800' }
    'hub' = @{ 'domain' = 'hub.codai.ro'; 'port' = '3900' }
    'id' = @{ 'domain' = 'id.codai.ro'; 'port' = '4000' }
    'jucai' = @{ 'domain' = 'jucai.ro'; 'port' = '4100' }
    'kodex' = @{ 'domain' = 'kodex.codai.ro'; 'port' = '4200' }
    'memorai' = @{ 'domain' = 'memorai.ro'; 'port' = '4300' }
    'metu-web' = @{ 'domain' = 'metu.ro'; 'port' = '4400' }
    'publicai' = @{ 'domain' = 'publicai.ro'; 'port' = '4500' }
    'romai' = @{ 'domain' = 'romai.ro'; 'port' = '4600' }
    'stocai' = @{ 'domain' = 'stocai.ro'; 'port' = '4700' }
    'wallet' = @{ 'domain' = 'wallet.bancai.ro'; 'port' = '4800' }
    'adoptai' = @{ 'domain' = 'adoptai.ro'; 'port' = '7100' }
}

# Create environment directories
$envDir = "environment-configs"
if (!(Test-Path $envDir)) {
    New-Item -ItemType Directory -Path $envDir -Force | Out-Null
}

$coreApps = @('codai', 'admin', 'hub', 'docs', 'id')

Write-Host "`n🚀 Creating environment files for core apps..." -ForegroundColor Cyan

foreach ($appName in $coreApps) {
    if ($appConfigs.ContainsKey($appName)) {
        $config = $appConfigs[$appName]
        $domain = $config['domain']
        $port = $config['port']
        
        Write-Host "  📦 Creating environment files for $appName ($domain)..." -ForegroundColor Yellow
        
        # Create app directory
        $appEnvDir = "$envDir\$appName"
        if (!(Test-Path $appEnvDir)) {
            New-Item -ItemType Directory -Path $appEnvDir -Force | Out-Null
        }
        
        # Production environment
        $prodEnv = @()
        $prodEnv += "# $appName Production Environment"
        $prodEnv += "# Generated on $(Get-Date)"
        $prodEnv += ""
        $prodEnv += "NODE_ENV=production"
        $prodEnv += "NEXTAUTH_URL=https://$domain"
        $prodEnv += "NEXTAUTH_SECRET=nextauth_secret_$($appName)_prod_$(Get-Random -Max 999999)"
        $prodEnv += ""
        $prodEnv += "# Azure OpenAI Configuration"
        $prodEnv += "AZURE_OPENAI_API_KEY=$($envVars['AZURE_OPENAI_API_KEY'])"
        $prodEnv += "AZURE_OPENAI_ENDPOINT=$($envVars['AZURE_OPENAI_ENDPOINT'])"
        $prodEnv += "AZURE_OPENAI_API_VERSION=$($envVars['AZURE_OPENAI_API_VERSION'])"
        $prodEnv += ""
        $prodEnv += "# Azure Tenant"
        $prodEnv += "AZURE_TENANT_ID=$($envVars['AZURE_TENANT_ID'])"
        $prodEnv += "AZURE_CLIENT_ID=$($envVars['AZURE_CLIENT_ID'])"
        $prodEnv += "AZURE_CLIENT_SECRET=$($envVars['AZURE_CLIENT_SECRET'])"
        $prodEnv += ""
        $prodEnv += "# Firebase Configuration (Unified codai-ecosystem)"
        $prodEnv += "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCKH8lI2rF_JEMk8xO-H6_4gzYQHghGdH8"
        $prodEnv += "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codai-ecosystem.firebaseapp.com"
        $prodEnv += "NEXT_PUBLIC_FIREBASE_PROJECT_ID=codai-ecosystem"
        $prodEnv += "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codai-ecosystem.firebasestorage.app"
        $prodEnv += "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=637430467623"
        $prodEnv += "NEXT_PUBLIC_FIREBASE_APP_ID=1:637430467623:web:$($appName)123456789"
        $prodEnv += ""
        $prodEnv += "# GitHub Configuration"
        $prodEnv += "GITHUB_CLIENT_ID=$($envVars['GITHUB_CLIENT_ID'])"
        $prodEnv += "GITHUB_CLIENT_SECRET=$($envVars['GITHUB_CLIENT_SECRET'])"
        $prodEnv += ""
        $prodEnv += "# Stripe Configuration"
        $prodEnv += "STRIPE_SECRET_KEY=$($envVars['STRIPE_SECRET_KEY'])"
        $prodEnv += "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$($envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])"
        $prodEnv += "STRIPE_WEBHOOK_SECRET=$($envVars['STRIPE_WEBHOOK_SECRET'])"
        
        $prodEnv | Out-File -FilePath "$appEnvDir\.env.production" -Encoding UTF8
        
        # Preview environment
        $previewEnv = @()
        $previewEnv += "# $appName Preview Environment"
        $previewEnv += "# Generated on $(Get-Date)"
        $previewEnv += ""
        $previewEnv += "NODE_ENV=production"
        $previewEnv += "NEXTAUTH_URL=https://preview-$domain"
        $previewEnv += "NEXTAUTH_SECRET=nextauth_secret_$($appName)_preview_$(Get-Random -Max 999999)"
        $previewEnv += ""
        $previewEnv += "# Azure OpenAI Configuration"
        $previewEnv += "AZURE_OPENAI_API_KEY=$($envVars['AZURE_OPENAI_API_KEY'])"
        $previewEnv += "AZURE_OPENAI_ENDPOINT=$($envVars['AZURE_OPENAI_ENDPOINT'])"
        $previewEnv += "AZURE_OPENAI_API_VERSION=$($envVars['AZURE_OPENAI_API_VERSION'])"
        $previewEnv += ""
        $previewEnv += "# Azure Tenant"
        $previewEnv += "AZURE_TENANT_ID=$($envVars['AZURE_TENANT_ID'])"
        $previewEnv += "AZURE_CLIENT_ID=$($envVars['AZURE_CLIENT_ID'])"
        $previewEnv += "AZURE_CLIENT_SECRET=$($envVars['AZURE_CLIENT_SECRET'])"
        $previewEnv += ""
        $previewEnv += "# Firebase Configuration (Unified codai-ecosystem)"
        $previewEnv += "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCKH8lI2rF_JEMk8xO-H6_4gzYQHghGdH8"
        $previewEnv += "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codai-ecosystem.firebaseapp.com"
        $previewEnv += "NEXT_PUBLIC_FIREBASE_PROJECT_ID=codai-ecosystem"
        $previewEnv += "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codai-ecosystem.firebasestorage.app"
        $previewEnv += "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=637430467623"
        $previewEnv += "NEXT_PUBLIC_FIREBASE_APP_ID=1:637430467623:web:$($appName)123456789"
        $previewEnv += ""
        $previewEnv += "# GitHub Configuration"
        $previewEnv += "GITHUB_CLIENT_ID=$($envVars['GITHUB_CLIENT_ID'])"
        $previewEnv += "GITHUB_CLIENT_SECRET=$($envVars['GITHUB_CLIENT_SECRET'])"
        $previewEnv += ""
        $previewEnv += "# Stripe Configuration"
        $previewEnv += "STRIPE_SECRET_KEY=$($envVars['STRIPE_SECRET_KEY'])"
        $previewEnv += "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$($envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])"
        $previewEnv += "STRIPE_WEBHOOK_SECRET=$($envVars['STRIPE_WEBHOOK_SECRET'])"
        
        $previewEnv | Out-File -FilePath "$appEnvDir\.env.preview" -Encoding UTF8
        
        # Development environment
        $devEnv = @()
        $devEnv += "# $appName Development Environment"
        $devEnv += "# Generated on $(Get-Date)"
        $devEnv += ""
        $devEnv += "NODE_ENV=development"
        $devEnv += "NEXTAUTH_URL=http://localhost:$port"
        $devEnv += "NEXTAUTH_SECRET=nextauth_secret_$($appName)_dev_$(Get-Random -Max 999999)"
        $devEnv += ""
        $devEnv += "# Azure OpenAI Configuration"
        $devEnv += "AZURE_OPENAI_API_KEY=$($envVars['AZURE_OPENAI_API_KEY'])"
        $devEnv += "AZURE_OPENAI_ENDPOINT=$($envVars['AZURE_OPENAI_ENDPOINT'])"
        $devEnv += "AZURE_OPENAI_API_VERSION=$($envVars['AZURE_OPENAI_API_VERSION'])"
        $devEnv += ""
        $devEnv += "# Azure Tenant"
        $devEnv += "AZURE_TENANT_ID=$($envVars['AZURE_TENANT_ID'])"
        $devEnv += "AZURE_CLIENT_ID=$($envVars['AZURE_CLIENT_ID'])"
        $devEnv += "AZURE_CLIENT_SECRET=$($envVars['AZURE_CLIENT_SECRET'])"
        $devEnv += ""
        $devEnv += "# Firebase Configuration (Unified codai-ecosystem)"
        $devEnv += "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCKH8lI2rF_JEMk8xO-H6_4gzYQHghGdH8"
        $devEnv += "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codai-ecosystem.firebaseapp.com"
        $devEnv += "NEXT_PUBLIC_FIREBASE_PROJECT_ID=codai-ecosystem"
        $devEnv += "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codai-ecosystem.firebasestorage.app"
        $devEnv += "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=637430467623"
        $devEnv += "NEXT_PUBLIC_FIREBASE_APP_ID=1:637430467623:web:$($appName)123456789"
        $devEnv += ""
        $devEnv += "# GitHub Configuration"
        $devEnv += "GITHUB_CLIENT_ID=$($envVars['GITHUB_CLIENT_ID'])"
        $devEnv += "GITHUB_CLIENT_SECRET=$($envVars['GITHUB_CLIENT_SECRET'])"
        $devEnv += ""
        $devEnv += "# Stripe Configuration"
        $devEnv += "STRIPE_SECRET_KEY=$($envVars['STRIPE_SECRET_KEY'])"
        $devEnv += "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$($envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])"
        $devEnv += "STRIPE_WEBHOOK_SECRET=$($envVars['STRIPE_WEBHOOK_SECRET'])"
        
        $devEnv | Out-File -FilePath "$appEnvDir\.env.development" -Encoding UTF8
        
        Write-Host "    ✅ Created environment files for $appName" -ForegroundColor Green
    }
}

# Create upload script
$uploadScript = @()
$uploadScript += "# CODAI Core Apps - Environment Upload Script"
$uploadScript += "# This script uploads environment variables using environment files"
$uploadScript += ""
$uploadScript += "Write-Host '🚀 Uploading Core Apps Environment Variables' -ForegroundColor Green"
$uploadScript += "Write-Host '============================================' -ForegroundColor Green"
$uploadScript += ""

foreach ($appName in $coreApps) {
    $uploadScript += "Write-Host '📦 Uploading $appName environment variables...' -ForegroundColor Yellow"
    $uploadScript += "cd apps\$appName"
    $uploadScript += ""
    $uploadScript += "Write-Host '  Production environment...'"
    $uploadScript += "Get-Content `"..\..\environment-configs\$appName\.env.production`" | ForEach-Object {"
    $uploadScript += "    if (`$_ -match '^([^#][^=]+)=(.*)$') {"
    $uploadScript += "        `$key = `$matches[1].Trim()"
    $uploadScript += "        `$value = `$matches[2].Trim()"
    $uploadScript += "        Write-Host `"    Setting `$key`""
    $uploadScript += "        `$result = vercel env add `$key `$value production --scope codai-ro --yes 2>&1"
    $uploadScript += "        if (`$LASTEXITCODE -eq 0) { Write-Host `"    ✅ `$key set`" -ForegroundColor Green }"
    $uploadScript += "        else { Write-Host `"    ⚠️  `$key may already exist`" -ForegroundColor Yellow }"
    $uploadScript += "    }"
    $uploadScript += "}"
    $uploadScript += ""
    $uploadScript += "Write-Host '  Preview environment...'"
    $uploadScript += "Get-Content `"..\..\environment-configs\$appName\.env.preview`" | ForEach-Object {"
    $uploadScript += "    if (`$_ -match '^([^#][^=]+)=(.*)$') {"
    $uploadScript += "        `$key = `$matches[1].Trim()"
    $uploadScript += "        `$value = `$matches[2].Trim()"
    $uploadScript += "        Write-Host `"    Setting `$key`""
    $uploadScript += "        `$result = vercel env add `$key `$value preview --scope codai-ro --yes 2>&1"
    $uploadScript += "        if (`$LASTEXITCODE -eq 0) { Write-Host `"    ✅ `$key set`" -ForegroundColor Green }"
    $uploadScript += "        else { Write-Host `"    ⚠️  `$key may already exist`" -ForegroundColor Yellow }"
    $uploadScript += "    }"
    $uploadScript += "}"
    $uploadScript += ""
    $uploadScript += "Write-Host '  Development environment...'"
    $uploadScript += "Get-Content `"..\..\environment-configs\$appName\.env.development`" | ForEach-Object {"
    $uploadScript += "    if (`$_ -match '^([^#][^=]+)=(.*)$') {"
    $uploadScript += "        `$key = `$matches[1].Trim()"
    $uploadScript += "        `$value = `$matches[2].Trim()"
    $uploadScript += "        Write-Host `"    Setting `$key`""
    $uploadScript += "        `$result = vercel env add `$key `$value development --scope codai-ro --yes 2>&1"
    $uploadScript += "        if (`$LASTEXITCODE -eq 0) { Write-Host `"    ✅ `$key set`" -ForegroundColor Green }"
    $uploadScript += "        else { Write-Host `"    ⚠️  `$key may already exist`" -ForegroundColor Yellow }"
    $uploadScript += "    }"
    $uploadScript += "}"
    $uploadScript += ""
    $uploadScript += "cd ..\.. # Back to root"
    $uploadScript += "Write-Host `"✅ $appName environment variables uploaded`" -ForegroundColor Green"
    $uploadScript += ""
}

$uploadScript += "Write-Host '🎯 Core Apps Environment Upload Completed!' -ForegroundColor Green"
$uploadScript += "Write-Host 'Next: Connect Git repositories and configure domains' -ForegroundColor Cyan"

$uploadScript | Out-File -FilePath "scripts\upload-core-env.ps1" -Encoding UTF8

Write-Host "`n✅ Environment files solution created!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "  • Created environment files for $($coreApps.Count) core apps"
Write-Host "  • Each app has 3 environment files: production, preview, development"  
Write-Host "  • Files contain actual values from root .env"
Write-Host "  • Upload script created: scripts\upload-core-env.ps1"

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Upload environment variables:"
Write-Host "     .\scripts\upload-core-env.ps1"
Write-Host "  2. This approach avoids interactive prompts"
Write-Host "  3. Uses --yes flag to skip confirmations"

Write-Host "`n📁 Files Created:" -ForegroundColor White
foreach ($appName in $coreApps) {
    Write-Host "  $envDir\$appName\.env.production"
    Write-Host "  $envDir\$appName\.env.preview"
    Write-Host "  $envDir\$appName\.env.development"
}

Write-Host "`n🔧 Alternative Manual Method:" -ForegroundColor DarkGray
Write-Host "If upload script fails, you can copy .env files to each app directory and use:"
Write-Host "cd apps\[appname] && vercel env pull"
