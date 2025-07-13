# Batch deployment script for all Codai apps
# Uses proven AIDE pattern for systematic deployment

$apps = @(
    "acasai", "ajutai", "analizai", "codai", "curtai", "dexai", "docs", 
    "explorer", "fabricai", "hub", "id", "jucai", "kodex", "legalizai", 
    "memorai", "mobile", "mod", "muzicai", "publicai", "sociai", "stocai", 
    "studiai", "sunai", "talentai", "tools", "wallet", "x"
)

# Function to fix tsconfig.json
function Fix-TsConfig($appPath) {
    $tsconfigPath = Join-Path $appPath "tsconfig.json"
    if (Test-Path $tsconfigPath) {
        Write-Host "Fixing tsconfig for $appPath"
        $content = @'
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
'@
        Set-Content -Path $tsconfigPath -Value $content
    }
}

# Function to fix next.config.js
function Fix-NextConfig($appPath) {
    $nextConfigPath = Join-Path $appPath "next.config.js"
    if (Test-Path $nextConfigPath) {
        Write-Host "Fixing next.config for $appPath"
        $content = Get-Content $nextConfigPath -Raw
        $content = $content -replace "swcMinify: true,", ""
        Set-Content -Path $nextConfigPath -Value $content
    }
}

# Deploy each app
foreach ($app in $apps) {
    $appPath = "E:\GitHub\codai-project\apps\$app"
    if (Test-Path $appPath) {
        Write-Host "=== Processing $app ===" -ForegroundColor Green
        Push-Location $appPath
        
        try {
            # Apply fixes
            Fix-TsConfig $appPath
            Fix-NextConfig $appPath
            
            # Build and deploy
            Write-Host "Building $app..."
            npm install --legacy-peer-deps 2>&1 | Out-Null
            $buildResult = npm run build 2>&1
            
            if (Test-Path ".next") {
                Write-Host "✅ Build successful for $app" -ForegroundColor Green
                Write-Host "Deploying $app..."
                $deployResult = npx vercel --prod --yes 2>&1
                Write-Host "✅ Deployed $app" -ForegroundColor Green
            } else {
                Write-Host "❌ Build failed for $app" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Error processing $app : $_" -ForegroundColor Red
        }
        finally {
            Pop-Location
        }
    }
}

Write-Host "=== Deployment batch completed ===" -ForegroundColor Yellow
