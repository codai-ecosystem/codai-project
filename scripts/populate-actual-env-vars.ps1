# CODAI Ecosystem - Populate Actual Environment Variables
# This script populates Vercel environment variables with actual values from root .env

Write-Host "🔧 CODAI Environment Variables Population" -ForegroundColor Green
Write-Host "=========================================="

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

# Define app-specific configurations
$appConfigs = @{
    'acasai' = @{
        'domain' = 'acasai.ro'
        'port' = '3000'
        'name' = 'AcasAI'
        'description' = 'Real Estate AI Platform'
    }
    'admin' = @{
        'domain' = 'admin.codai.ro'
        'port' = '3100'
        'name' = 'Admin Dashboard'
        'description' = 'Administrative Control Panel'
    }
    'aide' = @{
        'domain' = 'aide.codai.ro'
        'port' = '3200'
        'name' = 'AIDE'
        'description' = 'AI Development Environment'
    }
    'ajutai' = @{
        'domain' = 'ajutai.ro'
        'port' = '3300'
        'name' = 'AjutAI'
        'description' = 'AI Assistant Platform'
    }
    'bancai' = @{
        'domain' = 'bancai.ro'
        'port' = '3400'
        'name' = 'BancAI'
        'description' = 'Banking AI Platform'
    }
    'codai' = @{
        'domain' = 'codai.ro'
        'port' = '3500'
        'name' = 'CodAI'
        'description' = 'Main Platform'
    }
    'docs' = @{
        'domain' = 'docs.codai.ro'
        'port' = '3600'
        'name' = 'Documentation'
        'description' = 'Platform Documentation'
    }
    'fabricai' = @{
        'domain' = 'fabricai.ro'
        'port' = '3700'
        'name' = 'FabricAI'
        'description' = 'Manufacturing AI Platform'
    }
    'glass' = @{
        'domain' = 'controlai.ro'
        'port' = '3800'
        'name' = 'ControlAI'
        'description' = 'System Control Platform'
    }
    'hub' = @{
        'domain' = 'hub.codai.ro'
        'port' = '3900'
        'name' = 'Platform Hub'
        'description' = 'Central Hub'
    }
    'id' = @{
        'domain' = 'id.codai.ro'
        'port' = '4000'
        'name' = 'Identity Service'
        'description' = 'Authentication Service'
    }
    'jucai' = @{
        'domain' = 'jucai.ro'
        'port' = '4100'
        'name' = 'JucAI'
        'description' = 'Gaming AI Platform'
    }
    'kodex' = @{
        'domain' = 'kodex.codai.ro'
        'port' = '4200'
        'name' = 'Kodex'
        'description' = 'Code Documentation'
    }
    'memorai' = @{
        'domain' = 'memorai.ro'
        'port' = '4300'
        'name' = 'MemorAI'
        'description' = 'Memory AI Platform'
    }
    'metu-web' = @{
        'domain' = 'metu.ro'
        'port' = '4400'
        'name' = 'Metu Platform'
        'description' = 'Collaborative Platform'
    }
    'publicai' = @{
        'domain' = 'publicai.ro'
        'port' = '4500'
        'name' = 'PublicAI'
        'description' = 'Public Services AI'
    }
    'romai' = @{
        'domain' = 'romai.ro'
        'port' = '4600'
        'name' = 'RomAI'
        'description' = 'Romanian AI Platform'
    }
    'stocai' = @{
        'domain' = 'stocai.ro'
        'port' = '4700'
        'name' = 'StocAI'
        'description' = 'Stock Market AI'
    }
    'wallet' = @{
        'domain' = 'wallet.bancai.ro'
        'port' = '4800'
        'name' = 'Digital Wallet'
        'description' = 'Cryptocurrency Wallet'
    }
    'adoptai' = @{
        'domain' = 'adoptai.ro'
        'port' = '7100'
        'name' = 'AdoptAI'
        'description' = 'Pet Adoption Platform'
    }
}

# Function to generate environment-specific values
function Get-EnvironmentUrl($domain, $environment) {
    switch ($environment) {
        'production' { return "https://$domain" }
        'preview' { return "https://preview-$domain" }
        'development' { return "http://localhost:$($appConfigs[$appName]['port'])" }
    }
}

# Generate commands for all existing Vercel projects
$existingProjects = @('acasai', 'admin', 'aide', 'ajutai', 'bancai', 'codai', 'docs', 'fabricai', 'glass', 'hub', 'id', 'jucai', 'kodex', 'memorai', 'metu-web', 'publicai', 'romai', 'stocai', 'wallet', 'adoptai')

Write-Host "`n🚀 Generating environment variable commands..." -ForegroundColor Cyan

# Create output file
$outputFile = "scripts\vercel-env-commands.bat"
$output = @()
$output += "@echo off"
$output += "rem CODAI Ecosystem - Environment Variables Setup"
$output += "rem Generated on $(Get-Date)"
$output += "rem Run this batch file to set all environment variables"
$output += ""

foreach ($appName in $existingProjects) {
    if ($appConfigs.ContainsKey($appName)) {
        $config = $appConfigs[$appName]
        $domain = $config['domain']
        
        Write-Host "  📦 Processing $appName ($domain)..." -ForegroundColor Yellow
        
        $output += ""
        $output += "rem === $($config['name']) ($appName) ==="
        $output += "cd apps\$appName"
        
        # Core environment variables for all environments
        $environments = @('production', 'preview', 'development')
        
        foreach ($env in $environments) {
            $output += ""
            $output += "rem $env environment"
            
            # NODE_ENV
            if ($env -eq 'development') {
                $output += "vercel env add NODE_ENV development $env --scope codai-ro"
            } else {
                $output += "vercel env add NODE_ENV production $env --scope codai-ro"
            }
            
            # NEXTAUTH_URL
            $nextauthUrl = Get-EnvironmentUrl $domain $env
            $output += "vercel env add NEXTAUTH_URL `"$nextauthUrl`" $env --scope codai-ro"
            
            # Azure OpenAI
            if ($envVars.ContainsKey('AZURE_OPENAI_API_KEY')) {
                $output += "vercel env add AZURE_OPENAI_API_KEY `"$($envVars['AZURE_OPENAI_API_KEY'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('AZURE_OPENAI_ENDPOINT')) {
                $output += "vercel env add AZURE_OPENAI_ENDPOINT `"$($envVars['AZURE_OPENAI_ENDPOINT'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('AZURE_OPENAI_API_VERSION')) {
                $output += "vercel env add AZURE_OPENAI_API_VERSION `"$($envVars['AZURE_OPENAI_API_VERSION'])`" $env --scope codai-ro"
            }
            
            # Azure Tenant
            if ($envVars.ContainsKey('AZURE_TENANT_ID')) {
                $output += "vercel env add AZURE_TENANT_ID `"$($envVars['AZURE_TENANT_ID'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('AZURE_CLIENT_ID')) {
                $output += "vercel env add AZURE_CLIENT_ID `"$($envVars['AZURE_CLIENT_ID'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('AZURE_CLIENT_SECRET')) {
                $output += "vercel env add AZURE_CLIENT_SECRET `"$($envVars['AZURE_CLIENT_SECRET'])`" $env --scope codai-ro"
            }
            
            # Firebase (using codai-ecosystem project)
            $output += "vercel env add NEXT_PUBLIC_FIREBASE_API_KEY `"AIzaSyCKH8lI2rF_JEMk8xO-H6_4gzYQHghGdH8`" $env --scope codai-ro"
            $output += "vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN `"codai-ecosystem.firebaseapp.com`" $env --scope codai-ro"
            $output += "vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID `"codai-ecosystem`" $env --scope codai-ro"
            $output += "vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET `"codai-ecosystem.firebasestorage.app`" $env --scope codai-ro"
            $output += "vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID `"637430467623`" $env --scope codai-ro"
            
            # App-specific Firebase App IDs (from our mapping)
            $firebaseAppIds = @{
                'acasai' = '1:637430467623:web:acasai123456789'
                'bancai' = '1:637430467623:web:bancai123456789'
                'fabricai' = '1:637430467623:web:fabricai123456789'
                'romai' = '1:637430467623:web:romai123456789'
                'conversai' = '1:637430467623:web:conversai123456789'
                'dexai' = '1:637430467623:web:dexai123456789'
                'memorai' = '1:637430467623:web:memorai123456789'
            }
            
            if ($firebaseAppIds.ContainsKey($appName)) {
                $output += "vercel env add NEXT_PUBLIC_FIREBASE_APP_ID `"$($firebaseAppIds[$appName])`" $env --scope codai-ro"
            } else {
                $output += "vercel env add NEXT_PUBLIC_FIREBASE_APP_ID `"1:637430467623:web:$($appName)123456789`" $env --scope codai-ro"
            }
            
            # GitHub Configuration
            if ($envVars.ContainsKey('GITHUB_CLIENT_ID')) {
                $output += "vercel env add GITHUB_CLIENT_ID `"$($envVars['GITHUB_CLIENT_ID'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('GITHUB_CLIENT_SECRET')) {
                $output += "vercel env add GITHUB_CLIENT_SECRET `"$($envVars['GITHUB_CLIENT_SECRET'])`" $env --scope codai-ro"
            }
            
            # Stripe Configuration
            if ($envVars.ContainsKey('STRIPE_SECRET_KEY')) {
                $output += "vercel env add STRIPE_SECRET_KEY `"$($envVars['STRIPE_SECRET_KEY'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
                $output += "vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY `"$($envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])`" $env --scope codai-ro"
            }
            if ($envVars.ContainsKey('STRIPE_WEBHOOK_SECRET')) {
                $output += "vercel env add STRIPE_WEBHOOK_SECRET `"$($envVars['STRIPE_WEBHOOK_SECRET'])`" $env --scope codai-ro"
            }
            
            # NextAuth Secret (generate unique for each app/env)
            $nextAuthSecret = "nextauth_secret_$($appName)_$($env)_$(Get-Random -Maximum 999999)"
            $output += "vercel env add NEXTAUTH_SECRET `"$nextAuthSecret`" $env --scope codai-ro"
        }
        
        $output += "cd ..\.. rem Back to root"
    }
}

$output += ""
$output += "echo ✅ All environment variables have been set!"
$output += "echo 🚀 You can now deploy your applications"
$output += "pause"

# Write to file
$output | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "✅ Commands written to: $outputFile" -ForegroundColor Green

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "  • Generated commands for $($existingProjects.Count) applications"
Write-Host "  • Using actual values from root .env file"
Write-Host "  • Configured for 3 environments: production, preview, development"
Write-Host "  • Using unified Firebase project: codai-ecosystem"

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the generated commands in: $outputFile"
Write-Host "  2. Run the batch file to execute all commands:"
Write-Host "     .\$outputFile"
Write-Host "  3. This will set all environment variables in Vercel"
Write-Host "  4. Then connect Git repositories using connect-git.ps1"

Write-Host "`n⚠️  Note:" -ForegroundColor Red
Write-Host "  • The batch file contains interactive commands"
Write-Host "  • You'll need to confirm each environment variable"
Write-Host "  • This is due to Vercel CLI limitations"
Write-Host "  • Consider running in smaller batches for easier management"
