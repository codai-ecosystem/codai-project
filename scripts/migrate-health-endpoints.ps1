# Health Endpoints Migration Script
# Migrates existing health endpoints to use @codai/api-utils package

param(
    [switch]$DryRun = $false,
    [string]$AppFilter = "*"
)

Write-Host "🏥 Health Endpoints Migration to @codai/api-utils" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Find all health endpoint files
$healthEndpoints = Get-ChildItem -Path "apps" -Recurse -Filter "route.ts" | 
    Where-Object { $_.FullName -like "*health*route.ts" -and $_.FullName -like "*$AppFilter*" }

Write-Host "📊 Analysis Results:" -ForegroundColor Yellow
Write-Host "Total Health Endpoints Found: $($healthEndpoints.Count)" -ForegroundColor White

$migratedCount = 0
$alreadyMigratedCount = 0
$customImplementationCount = 0

foreach ($endpoint in $healthEndpoints) {
    $relativePath = $endpoint.FullName.Replace((Get-Location).Path, "").TrimStart('\')
    $content = Get-Content $endpoint.FullName -Raw
    
    Write-Host "`n📁 Analyzing: $relativePath" -ForegroundColor Cyan
    
    # Check if already using @codai/shared-ui
    if ($content -match "@codai/shared-ui" -and $content -match "createHealthEndpoint") {
        Write-Host "   ✅ Already migrated to @codai/shared-ui" -ForegroundColor Green
        $alreadyMigratedCount++
        continue
    }
    
    # Check if it's a custom implementation that needs migration
    if ($content -match "NextRequest|NextResponse" -and $content -match "GET.*function") {
        Write-Host "   🔧 Custom implementation detected - needs migration" -ForegroundColor Yellow
        $customImplementationCount++
        
        # Extract service information
        $appName = ""
        if ($relativePath -match "apps\\([^\\]+)") {
            $appName = $matches[1].ToUpper()
        }
        
        # Determine service capabilities based on app name
        $capabilities = "CommonCapabilities.WEB_APP"
        switch ($appName) {
            "ROMAI" { $capabilities = "CommonCapabilities.AI_PLATFORM" }
            "MEMORAI" { $capabilities = "CommonCapabilities.MEMORY_AI" }
            "TALENTAI" { $capabilities = "CommonCapabilities.TALENT_AI" }
            "BANCAI" { $capabilities = "CommonCapabilities.FINANCIAL_AI" }
            "ADOPTAI" { $capabilities = "CommonCapabilities.SOCIAL_PLATFORM" }
            "LEGALIZAI" { $capabilities = "CommonCapabilities.LEGAL_AI" }
            "CONVERSAI" { $capabilities = "CommonCapabilities.CHAT_AI" }
            "ANALIZAI" { $capabilities = "CommonCapabilities.ANALYTICS_AI" }
            "CURTAI" { $capabilities = "CommonCapabilities.LEGAL_AI" }
            default { $capabilities = "CommonCapabilities.WEB_APP" }
        }
        
        # Create the new migration content
        $newContent = @"
/**
 * Migrated Health Check API Route - $appName
 * Path: /api/health
 * Methods: GET, HEAD
 * Migrated from custom implementation to @codai/api-utils
 */

import { createHealthEndpoint } from '@codai/api-utils/health';

// $appName health configuration with standardized endpoint
const { GET, HEAD } = createHealthEndpoint({
    serviceName: '$appName',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    capabilities: ['$($appName.ToLower())'],
    systemMetrics: true,
    customChecks: async () => {
        // Custom health checks for $appName
        return {
            status: 'healthy',
            customChecks: {
                // Add any app-specific health checks here
            }
        };
    }
});

export { GET, HEAD };

"@
        
        if (!$DryRun) {
            # Backup the original file
            $backupPath = $endpoint.FullName + ".backup"
            Copy-Item $endpoint.FullName $backupPath
            Write-Host "   📋 Backed up to: $($backupPath.Split('\')[-1])" -ForegroundColor Gray
            
            # Write the new content
            Set-Content -Path $endpoint.FullName -Value $newContent -Encoding UTF8
            Write-Host "   ✅ Migrated to @codai/api-utils" -ForegroundColor Green
        } else {
            Write-Host "   🔄 Would migrate (DRY RUN)" -ForegroundColor Magenta
        }
        
        $migratedCount++
    }
}

Write-Host "`n📊 Migration Summary:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "Already Using @codai/shared-ui: $alreadyMigratedCount" -ForegroundColor Green
Write-Host "Custom Implementations Found: $customImplementationCount" -ForegroundColor Yellow
Write-Host "$(if($DryRun){'Would Migrate'}else{'Migrated'}): $migratedCount" -ForegroundColor Cyan
Write-Host "Total Processed: $($healthEndpoints.Count)" -ForegroundColor White

if ($migratedCount -gt 0) {
    Write-Host "`n📦 Next Steps:" -ForegroundColor Green
    Write-Host "1. Install @codai/api-utils dependency in affected apps"
    Write-Host "2. Test all migrated endpoints: npm run test"
    Write-Host "3. Run health checks on all services"
    Write-Host "4. Update any app-specific health check logic"
    
    if (!$DryRun) {
        Write-Host "`n💾 Backup files created with .backup extension" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Health Endpoints Migration Complete!" -ForegroundColor Green