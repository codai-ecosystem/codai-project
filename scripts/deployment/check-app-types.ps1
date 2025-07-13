# Check which migrated services are Next.js vs Express.js
$nextApps = @()
$expressApps = @()
$otherApps = @()

$migratedServices = @("aide", "analizai", "marketai", "explorer", "kodex", "id", "mod", "tools", "dash", "hub", "docs", "admin", "stocai", "ajutai", "legalizai")

foreach ($service in $migratedServices) {
    $packagePath = "apps\$service\package.json"
    
    if (Test-Path $packagePath) {
        try {
            $package = Get-Content $packagePath | ConvertFrom-Json
            
            if ($package.scripts.dev -like "*next*") {
                $nextApps += $service
                Write-Host "✅ Next.js: $service"
            } elseif ($package.scripts.dev -like "*node*" -or $package.scripts.start -like "*node*") {
                $expressApps += $service
                Write-Host "⚡ Express: $service"
            } else {
                $otherApps += $service
                Write-Host "❓ Other: $service ($($package.scripts.dev))"
            }
        } catch {
            Write-Host "❌ Error reading $service package.json"
        }
    } else {
        Write-Host "⚠️ No package.json: $service"
    }
}

Write-Host "`n📊 SUMMARY:"
Write-Host "  Next.js Apps: $($nextApps.Count) - $($nextApps -join ', ')"
Write-Host "  Express Apps: $($expressApps.Count) - $($expressApps -join ', ')"
Write-Host "  Other Apps: $($otherApps.Count) - $($otherApps -join ', ')"
