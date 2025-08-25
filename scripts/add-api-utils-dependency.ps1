# Add @codai/api-utils dependency to affected apps
# Identifies apps that need the @codai/api-utils dependency and adds it

param(
    [switch]$DryRun = $false
)

Write-Host "📦 Adding @codai/api-utils Dependency to Affected Apps" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Apps that were migrated (based on the migration script results)
$affectedApps = @(
    "apps/dash",
    "apps/docs", 
    "apps/hub",
    "apps/id",
    "apps/memorai",
    "apps/romai"
)

$addedCount = 0
$alreadyHasCount = 0

foreach ($appPath in $affectedApps) {
    $packageJsonPath = Join-Path $appPath "package.json"
    
    if (Test-Path $packageJsonPath) {
        Write-Host "`n📁 Processing: $appPath" -ForegroundColor Cyan
        
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        
        # Check if already has @codai/api-utils dependency
        $hasApiUtils = $false
        
        if ($packageJson.dependencies -and $packageJson.dependencies."@codai/api-utils") {
            $hasApiUtils = $true
        } elseif ($packageJson.devDependencies -and $packageJson.devDependencies."@codai/api-utils") {
            $hasApiUtils = $true
        }
        
        if ($hasApiUtils) {
            Write-Host "   ✅ Already has @codai/api-utils dependency" -ForegroundColor Green
            $alreadyHasCount++
        } else {
            Write-Host "   📦 Adding @codai/api-utils dependency" -ForegroundColor Yellow
            
            if (!$DryRun) {
                # Initialize dependencies object if it doesn't exist
                if (-not $packageJson.dependencies) {
                    $packageJson | Add-Member -Type NoteProperty -Name "dependencies" -Value @{}
                }
                
                # Add @codai/api-utils dependency as workspace reference
                $packageJson.dependencies | Add-Member -Type NoteProperty -Name "@codai/api-utils" -Value "workspace:*" -Force
                
                # Convert back to JSON with proper formatting
                $jsonContent = $packageJson | ConvertTo-Json -Depth 10 | ForEach-Object {
                    $_ -replace '(?m)^(\s*)"([^"]+)"\s*:\s*', '$1"$2": '
                }
                
                # Write back to file
                Set-Content -Path $packageJsonPath -Value $jsonContent -Encoding UTF8
                Write-Host "   ✅ Added @codai/api-utils: workspace:*" -ForegroundColor Green
            } else {
                Write-Host "   🔄 Would add @codai/api-utils: workspace:* (DRY RUN)" -ForegroundColor Magenta
            }
            
            $addedCount++
        }
    } else {
        Write-Host "`n❌ Package.json not found: $packageJsonPath" -ForegroundColor Red
    }
}

Write-Host "`n📊 Dependency Addition Summary:" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host "Already Had Dependency: $alreadyHasCount" -ForegroundColor Green
Write-Host "$(if($DryRun){'Would Add'}else{'Added'}) Dependency: $addedCount" -ForegroundColor Cyan
Write-Host "Total Processed: $($affectedApps.Count)" -ForegroundColor White

if ($addedCount -gt 0) {
    Write-Host "`n📦 Next Steps:" -ForegroundColor Green
    Write-Host "1. Run: pnpm install (to install the new dependencies)"
    Write-Host "2. Test health endpoints: pnpm test"
    Write-Host "3. Run health checks on all affected services"
    
    if (!$DryRun) {
        Write-Host "`n🚀 Installing dependencies across workspace..." -ForegroundColor Cyan
        Write-Host "Run: pnpm install" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Dependency Addition Complete!" -ForegroundColor Green