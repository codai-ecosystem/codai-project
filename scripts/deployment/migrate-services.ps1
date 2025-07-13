# Service Migration Script
$services = @("tools", "dash", "hub", "docs", "admin", "stocai", "ajutai", "legalizai")

foreach ($service in $services) {
    if (Test-Path "services\$service") {
        Write-Host "🔄 Migrating $service..."
        
        # Use robocopy for reliable migration
        $result = robocopy "services\$service" "apps\$service" /E /MOVE /R:1 /W:1 /XD "node_modules" ".next" ".turbo" /NP
        
        if ($LASTEXITCODE -le 3) {
            Write-Host "✅ Successfully migrated $service"
            
            # Clean up source if it still exists
            if (Test-Path "services\$service") {
                Remove-Item "services\$service" -Recurse -Force -ErrorAction SilentlyContinue
            }
        } else {
            Write-Host "❌ Failed to migrate $service (exit code: $LASTEXITCODE)"
        }
    } else {
        Write-Host "⚠️ Service $service not found"
    }
}

Write-Host "`n🎯 Migration Summary:"
Write-Host "Apps directory now contains:"
Get-ChildItem "apps" -Directory | ForEach-Object { Write-Host "  - $($_.Name)" }
