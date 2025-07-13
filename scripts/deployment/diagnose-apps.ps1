# Comprehensive App Diagnosis Script
# Check each app's structure, dependencies, and potential issues

Write-Host "=== CODAI ECOSYSTEM DEPLOYMENT DIAGNOSIS ===" -ForegroundColor Cyan

$structuredApps = @(
    "aide", "ajutai", "analizai", "bancai", "codai", "cumparai", 
    "dash", "explorer", "fabricai", "hub", "id", "kodex", 
    "logai", "marketai", "memorai", "mod", "publicai", "sociai", 
    "stocai", "studiai", "tools", "wallet", "x"
)

$results = @()

foreach ($app in $structuredApps) {
    Write-Host "Analyzing $app..." -ForegroundColor Yellow
    
    $appPath = "apps\$app"
    $packagePath = "$appPath\package.json"
    $layoutPath = "$appPath\app\layout.tsx"
    $pagePath = "$appPath\app\page.tsx"
    $nextConfigPath = "$appPath\next.config.js"
    
    $analysis = [PSCustomObject]@{
        App = $app
        HasPackageJson = Test-Path $packagePath
        HasLayout = Test-Path $layoutPath
        HasPage = Test-Path $pagePath
        HasNextConfig = Test-Path $nextConfigPath
        TailwindVersion = "Unknown"
        HasReact = $false
        HasNext = $false
        HasTypeScript = $false
        Issues = @()
    }
    
    if ($analysis.HasPackageJson) {
        try {
            $package = Get-Content $packagePath | ConvertFrom-Json
            
            # Check dependencies
            $allDeps = @{}
            if ($package.dependencies) { $allDeps += $package.dependencies }
            if ($package.devDependencies) { $allDeps += $package.devDependencies }
            
            $analysis.HasReact = $allDeps.ContainsKey("react")
            $analysis.HasNext = $allDeps.ContainsKey("next")
            $analysis.HasTypeScript = $allDeps.ContainsKey("typescript")
            
            if ($allDeps.ContainsKey("tailwindcss")) {
                $analysis.TailwindVersion = $allDeps["tailwindcss"]
            }
            
            # Check for issues
            if (-not $analysis.HasReact) { $analysis.Issues += "Missing React" }
            if (-not $analysis.HasNext) { $analysis.Issues += "Missing Next.js" }
            if (-not $analysis.HasTypeScript) { $analysis.Issues += "Missing TypeScript" }
            if ($analysis.TailwindVersion -like "*4.*") { $analysis.Issues += "Tailwind 4.x" }
            if ($allDeps.ContainsKey("@tailwindcss/postcss")) { $analysis.Issues += "Has @tailwindcss/postcss" }
            
        } catch {
            $analysis.Issues += "Invalid package.json"
        }
    } else {
        $analysis.Issues += "No package.json"
    }
    
    if (-not $analysis.HasLayout) { $analysis.Issues += "Missing layout.tsx" }
    if (-not $analysis.HasPage) { $analysis.Issues += "Missing page.tsx" }
    
    $results += $analysis
}

# Output results
Write-Host "`n=== ANALYSIS RESULTS ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize

# Categorize apps
$readyApps = $results | Where-Object { $_.Issues.Count -eq 0 }
$fixableApps = $results | Where-Object { $_.Issues.Count -le 2 -and $_.HasLayout -and $_.HasPage }
$problematicApps = $results | Where-Object { $_.Issues.Count -gt 2 -or (-not $_.HasLayout) }

Write-Host "`n=== DEPLOYMENT CATEGORIES ===" -ForegroundColor Green
Write-Host "✅ READY FOR DEPLOYMENT ($($readyApps.Count)):" -ForegroundColor Green
$readyApps.App -join ", " | Write-Host

Write-Host "`n🔧 NEEDS MINOR FIXES ($($fixableApps.Count)):" -ForegroundColor Yellow
$fixableApps.App -join ", " | Write-Host

Write-Host "`n❌ NEEDS MAJOR FIXES ($($problematicApps.Count)):" -ForegroundColor Red
$problematicApps.App -join ", " | Write-Host

Write-Host "`n=== AIDE BASELINE (WORKING) ===" -ForegroundColor Cyan
$aide = $results | Where-Object { $_.App -eq "aide" }
$aide | Format-List
