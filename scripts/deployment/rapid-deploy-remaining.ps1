#!/usr/bin/env pwsh
# Rapid deployment script for remaining Codai apps
# Uses proven AIDE pattern for systematic deployment

$ErrorActionPreference = "Continue"
$apps = @("acasai", "curtai", "dexai", "docs", "explorer", "fabricai", "hub", "id", "jucai", "kodex", "legalizai", "memorai", "mobile", "mod", "muzicai", "publicai", "sociai", "stocai", "studiai", "sunai", "talentai", "tools", "wallet", "x")

$succeededApps = @()
$failedApps = @()

foreach ($app in $apps) {
    $appPath = "E:\GitHub\codai-project\apps\$app"
    if (Test-Path $appPath) {
        Write-Host "=== Processing $app ===" -ForegroundColor Green
        Push-Location $appPath
        
        try {
            # Check for pages directory conflict and remove
            if (Test-Path "pages") {
                Write-Host "Removing pages directory conflict for $app"
                Remove-Item -Path "pages" -Recurse -Force
            }
            
            # Fix tsconfig.json to match AIDE exactly
            $tsconfigPath = "tsconfig.json"
            if (Test-Path $tsconfigPath) {
                Write-Host "Updating tsconfig.json for $app"
                @'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": [
      "dom",
      "dom.iterable",
      "ES6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*",
        "./app/*",
        "./components/*",
        "./lib/*"
      ]
    },
    "strictNullChecks": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
'@ | Set-Content -Path $tsconfigPath
            }
            
            # Fix next.config.js - remove swcMinify
            $nextConfigPath = "next.config.js"
            if (Test-Path $nextConfigPath) {
                Write-Host "Fixing next.config.js for $app"
                $content = Get-Content $nextConfigPath -Raw
                $content = $content -replace "swcMinify: true,", ""
                Set-Content -Path $nextConfigPath -Value $content
            }
            
            # Build locally first
            Write-Host "Building $app locally..."
            $null = npm install --legacy-peer-deps 2>&1
            $buildOutput = npm run build 2>&1
            
            if (Test-Path ".next") {
                Write-Host "✅ Local build successful for $app" -ForegroundColor Green
                
                # Deploy to Vercel
                Write-Host "Deploying $app to Vercel..."
                $deployOutput = npx vercel --prod --yes 2>&1
                $deploymentUrl = ($deployOutput | Select-String "Production: https://") -replace "✅  Production: ", ""
                
                if ($deploymentUrl) {
                    Write-Host "✅ Deployment URL generated for $app : $deploymentUrl" -ForegroundColor Green
                    $succeededApps += "$app : $deploymentUrl"
                } else {
                    Write-Host "❌ No deployment URL for $app" -ForegroundColor Red
                    $failedApps += "$app : No URL generated"
                }
            } else {
                Write-Host "❌ Local build failed for $app" -ForegroundColor Red
                $failedApps += "$app : Local build failed"
            }
        }
        catch {
            Write-Host "❌ Error processing $app : $_" -ForegroundColor Red
            $failedApps += "$app : Exception - $_"
        }
        finally {
            Pop-Location
        }
        
        Start-Sleep -Seconds 2
    } else {
        Write-Host "⚠️  App directory not found: $appPath" -ForegroundColor Yellow
    }
}

Write-Host "`n=== DEPLOYMENT SUMMARY ===" -ForegroundColor Yellow
Write-Host "✅ Succeeded Apps ($($succeededApps.Count)):" -ForegroundColor Green
$succeededApps | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }

Write-Host "`n❌ Failed Apps ($($failedApps.Count)):" -ForegroundColor Red  
$failedApps | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }

Write-Host "`n📊 Total Success Rate: $([math]::Round(($succeededApps.Count / $apps.Count) * 100, 1))%" -ForegroundColor Cyan
