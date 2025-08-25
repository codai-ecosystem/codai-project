# Test Configuration Consolidation Script
# Automates the process of replacing duplicate test configurations with base config imports

param(
    [string[]]$Apps = @(),
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [string]$ConfigType = "both" # "vitest", "playwright", or "both"
)

$VitestConfigTemplate = @"
/**
 * Vitest Configuration for {APP_NAME}
 * CONSOLIDATED: Using base configuration from @codai/testing-utils
 * 
 * This configuration extends the standardized base configuration with
 * app-specific customizations while maintaining consistency across the workspace.
 * 
 * Features from base config:
 * - Standardized test environment and setup
 * - Consistent coverage thresholds and reporting
 * - Optimized performance settings (4 workers, retry logic)
 * - TypeScript support and type checking
 * - Workspace-aware path resolution
 */

import { defineConfig } from 'vitest/config'
import { baseVitestConfig } from '@codai/testing-utils/configs/vitest.base.config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    ...baseVitestConfig,
    
    // App-specific plugins
    plugins: [react()],
    
    // App-specific configuration
    test: {
        ...baseVitestConfig.test,
        
        // App name for better test reporting
        name: 'app-{APP_NAME_LOWER}',
        
        // App-specific setup files
        setupFiles: ['./tests/setup.ts'],
        
        // Coverage configuration (extends base)
        coverage: {
            ...baseVitestConfig.test.coverage,
            reportsDirectory: './coverage',
            // App-specific excludes (in addition to base excludes)
            exclude: [
                ...(baseVitestConfig.test.coverage.exclude || []),
                '.next/',
                'public/',
                'middleware.*'
            ]
        },
        
        // App-specific includes/excludes
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            ...(baseVitestConfig.test.exclude || []),
            'e2e/**',
            '**/*.e2e.{test,spec}.{js,ts}'
        ]
    },
    
    // App-specific path resolution
    resolve: {
        ...baseVitestConfig.resolve,
        alias: {
            ...baseVitestConfig.resolve.alias,
            '@': resolve(__dirname, './src'),
            '@/tests': resolve(__dirname, './tests'),
            '@/components': resolve(__dirname, './src/components'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/app': resolve(__dirname, './src/app')
        }
    }
})
"@

$PlaywrightConfigTemplate = @"
/**
 * Playwright Configuration for {APP_NAME}
 * CONSOLIDATED: Using base configuration from @codai/testing-utils
 * 
 * This configuration extends the standardized base configuration with
 * app-specific customizations for e2e testing.
 * 
 * Features from base config:
 * - Multi-browser testing (Chrome, Firefox, Safari, Edge)
 * - Mobile device testing
 * - Consistent reporting and retry logic
 * - Optimized performance settings
 * - Screenshot/video capture on failure
 */

import { createAppPlaywrightConfig } from '@codai/testing-utils/configs/playwright.base.config'

// App-specific configuration
const config = createAppPlaywrightConfig('{APP_NAME}', {APP_PORT}, {
    // App-specific customizations
    testDir: './tests/e2e',
    
    // App-specific timeouts (if needed)
    timeout: 60000,
    
    // App-specific use options
    use: {
        // App-specific base URL will be set by createAppPlaywrightConfig
        // Additional app-specific options can go here
    },
    
    // App-specific projects (if different from base)
    // projects: [...] // uncomment and customize if needed
})

export default config
"@

$AppPortMap = @{
    'memorai' = 4006
    'romai' = 3001
    'studiai' = 3002
    'publicai' = 3003
    'codai' = 3000
    'hub' = 4008
    'id' = 4004
    'docs' = 4200
    'explorer' = 4400
    'bancai' = 4005
    'sociai' = 6200
    'ajutai' = 3004
    'analizai' = 4500
    'x' = 3005
    'talentai' = 3006
    'sunai' = 3007
    'wallet' = 3008
    'stocai' = 3009
    'legalizai' = 3010
    'jucai' = 3011
    'marketai' = 3012
}

$AllApps = @(
    'memorai', 'romai', 'studiai', 'publicai', 'codai', 'hub', 'id', 'docs',
    'explorer', 'bancai', 'sociai', 'ajutai', 'analizai', 'x', 'talentai',
    'sunai', 'wallet', 'stocai', 'legalizai', 'jucai', 'marketai', 'controlai-dashboard'
)

if ($Apps.Count -eq 0) {
    $Apps = $AllApps
}

$TotalLinesEliminated = 0
$AppsProcessed = 0
$VitestFilesProcessed = 0
$PlaywrightFilesProcessed = 0
$AppsWithTestingUtils = @()
$AppsWithoutTestingUtils = @()

Write-Host "🧪 Starting Test Configuration Consolidation" -ForegroundColor Cyan
Write-Host "📍 Target Apps: $($Apps -join ', ')" -ForegroundColor White
Write-Host "🔧 Configuration Type: $ConfigType" -ForegroundColor White
Write-Host "🔧 Dry Run Mode: $DryRun" -ForegroundColor $(if($DryRun) {'Yellow'} else {'Green'})
Write-Host ""

foreach ($App in $Apps) {
    $AppPath = "apps/$App"
    $VitestConfigPath = "$AppPath/vitest.config.ts"
    $PlaywrightConfigPath = "$AppPath/playwright.config.ts"
    $PackageJsonPath = "$AppPath/package.json"
    
    if (-not (Test-Path $AppPath)) {
        Write-Host "⚠️  App '$App' not found at $AppPath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "🔍 Processing app: $App" -ForegroundColor Cyan
    
    # Check package.json for @codai/testing-utils dependency
    $HasTestingUtils = $false
    if (Test-Path $PackageJsonPath) {
        $PackageContent = Get-Content $PackageJsonPath | ConvertFrom-Json
        if ($PackageContent.dependencies.'@codai/testing-utils' -or $PackageContent.devDependencies.'@codai/testing-utils') {
            $HasTestingUtils = $true
            $AppsWithTestingUtils += $App
        } else {
            $AppsWithoutTestingUtils += $App
        }
    }
    
    Write-Host "   📦 Testing-Utils dependency: $(if($HasTestingUtils) {'✅ Found'} else {'❌ Missing'})" -ForegroundColor $(if($HasTestingUtils) {'Green'} else {'Red'})
    
    $AppLinesEliminated = 0
    
    # Process Vitest configuration
    if (($ConfigType -eq "vitest" -or $ConfigType -eq "both") -and (Test-Path $VitestConfigPath)) {
        $OriginalContent = Get-Content $VitestConfigPath
        $OriginalLines = $OriginalContent.Count
        
        Write-Host "   📄 vitest.config.ts: $OriginalLines lines" -ForegroundColor White
        
        if ($Verbose) {
            Write-Host "   🔍 Vitest config preview:" -ForegroundColor Gray
            $PreviewLines = $OriginalContent | Select-Object -First 3
            foreach ($Line in $PreviewLines) {
                Write-Host "      $Line" -ForegroundColor DarkGray
            }
            Write-Host "      ..." -ForegroundColor DarkGray
        }
        
        if (-not $DryRun) {
            # Generate app-specific config
            $NewConfig = $VitestConfigTemplate -replace '{APP_NAME}', $App -replace '{APP_NAME_LOWER}', $App.ToLower()
            Set-Content $VitestConfigPath $NewConfig
            Write-Host "   ✅ vitest.config.ts consolidated!" -ForegroundColor Green
        } else {
            Write-Host "   🔄 Would replace vitest.config.ts ($OriginalLines lines)" -ForegroundColor Yellow
        }
        
        $AppLinesEliminated += $OriginalLines
        $VitestFilesProcessed++
    }
    
    # Process Playwright configuration
    if (($ConfigType -eq "playwright" -or $ConfigType -eq "both") -and (Test-Path $PlaywrightConfigPath)) {
        $OriginalContent = Get-Content $PlaywrightConfigPath
        $OriginalLines = $OriginalContent.Count
        
        Write-Host "   📄 playwright.config.ts: $OriginalLines lines" -ForegroundColor White
        
        if (-not $DryRun) {
            # Generate app-specific config with port
            $AppPort = $AppPortMap[$App]
            if (-not $AppPort) { $AppPort = 3000 }
            
            $NewConfig = $PlaywrightConfigTemplate -replace '{APP_NAME}', $App -replace '{APP_PORT}', $AppPort
            Set-Content $PlaywrightConfigPath $NewConfig
            Write-Host "   ✅ playwright.config.ts consolidated!" -ForegroundColor Green
        } else {
            Write-Host "   🔄 Would replace playwright.config.ts ($OriginalLines lines)" -ForegroundColor Yellow
        }
        
        $AppLinesEliminated += $OriginalLines
        $PlaywrightFilesProcessed++
    }
    
    if (-not $DryRun) {
        # Add testing-utils dependency if missing
        if (-not $HasTestingUtils -and (Test-Path $PackageJsonPath)) {
            Write-Host "   📦 Adding @codai/testing-utils dependency..." -ForegroundColor Yellow
            $PackageContent = Get-Content $PackageJsonPath | ConvertFrom-Json
            
            # Add to devDependencies
            if (-not $PackageContent.devDependencies) {
                $PackageContent | Add-Member -Name "devDependencies" -Value @{} -MemberType NoteProperty -Force
            }
            $PackageContent.devDependencies | Add-Member -Name "@codai/testing-utils" -Value "workspace:*" -MemberType NoteProperty -Force
            
            $PackageContent | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
        }
        
        Write-Host "   ✅ App processed: $AppLinesEliminated lines eliminated!" -ForegroundColor Green
        $TotalLinesEliminated += $AppLinesEliminated
        $AppsProcessed++
    } else {
        Write-Host "   🔄 Would eliminate $AppLinesEliminated lines" -ForegroundColor Yellow
        $TotalLinesEliminated += $AppLinesEliminated
        $AppsProcessed++
    }
    
    Write-Host ""
}

# Summary Report
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 TEST CONFIGURATION CONSOLIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Apps processed: $AppsProcessed" -ForegroundColor Green
Write-Host "📄 Vitest configs processed: $VitestFilesProcessed" -ForegroundColor Green
Write-Host "📄 Playwright configs processed: $PlaywrightFilesProcessed" -ForegroundColor Green
Write-Host "📉 Total lines eliminated: $TotalLinesEliminated" -ForegroundColor Green
Write-Host "📦 Apps with testing-utils: $($AppsWithTestingUtils.Count)" -ForegroundColor Blue
Write-Host "📦 Apps without testing-utils: $($AppsWithoutTestingUtils.Count)" -ForegroundColor Red
Write-Host ""

if ($AppsWithTestingUtils.Count -gt 0) {
    Write-Host "📦 Apps with testing-utils dependency:" -ForegroundColor Blue
    foreach ($App in $AppsWithTestingUtils) {
        Write-Host "   ✅ $App" -ForegroundColor Green
    }
    Write-Host ""
}

if ($AppsWithoutTestingUtils.Count -gt 0) {
    Write-Host "📦 Apps needing testing-utils dependency:" -ForegroundColor Red
    foreach ($App in $AppsWithoutTestingUtils) {
        Write-Host "   ❌ $App $(if(-not $DryRun) {'(ADDED)'} else {'(WOULD ADD)'})" -ForegroundColor $(if(-not $DryRun) {'Green'} else {'Yellow'})
    }
    Write-Host ""
}

if ($DryRun) {
    Write-Host "🔧 This was a DRY RUN - no files were modified" -ForegroundColor Yellow
    Write-Host "💡 Run without -DryRun flag to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "🎉 Test configuration consolidation completed successfully!" -ForegroundColor Green
    Write-Host "💡 Run 'pnpm install' to update dependencies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📈 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test apps to ensure test configurations work" -ForegroundColor White
Write-Host "   2. Run 'pnpm test' in each app to verify functionality" -ForegroundColor White
Write-Host "   3. Consider consolidating test setup files and utilities" -ForegroundColor White
Write-Host "   4. Proceed to test content consolidation phase" -ForegroundColor White
Write-Host ""
Write-Host "🏆 Enhanced Testing Features Available:" -ForegroundColor Cyan
Write-Host "   - Consistent test environment across all apps" -ForegroundColor White
Write-Host "   - Standardized coverage reporting and thresholds" -ForegroundColor White
Write-Host "   - Optimized performance with proper worker configuration" -ForegroundColor White
Write-Host "   - Multi-browser e2e testing with Playwright" -ForegroundColor White
Write-Host "   - TypeScript support and type checking in tests" -ForegroundColor White
Write-Host "   - Workspace-aware path resolution" -ForegroundColor White