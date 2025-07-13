# Comprehensive Apps Cleanup Script
# Cleans all apps and services in the monorepo efficiently

Write-Host "🧹 Starting comprehensive cleanup of all apps..." -ForegroundColor Green

$rootPath = "e:\GitHub\codai-project"
$appsPath = "$rootPath\apps"

# Get all app directories
$appDirs = Get-ChildItem -Path $appsPath -Directory | Where-Object { $_.Name -ne "README.md" }

Write-Host "📂 Found $($appDirs.Count) apps to clean..." -ForegroundColor Cyan

foreach ($app in $appDirs) {
    $appPath = $app.FullName
    $appName = $app.Name
    
    Write-Host "🔧 Cleaning app: $appName" -ForegroundColor Yellow
    
    # Create organized directories if they don't exist
    $docsPath = "$appPath\docs"
    $scriptsPath = "$appPath\scripts"
    $testsPath = "$appPath\tests"
    $deploymentPath = "$appPath\deployment"
    
    New-Item -ItemType Directory -Path $docsPath -Force -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Path "$docsPath\reports" -Force -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Path $scriptsPath -Force -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Path $deploymentPath -Force -ErrorAction SilentlyContinue | Out-Null
    
    # Move documentation and reports (batch operation)
    Get-ChildItem -Path $appPath -Name "*_REPORT.md", "*_GUIDE.md", "*_PLAN.md", "*_STATUS.md", "*_COMPLETE.md", "*_SUCCESS*.md", "*_PROGRESS*.md", "*_FINAL*.md", "*_DEPLOYMENT*.md", "*_ENTERPRISE*.md", "*_PERFORMANCE*.md", "*_OPTIMIZATION*.md", "*_PRODUCTION*.md", "*_PUBLISHED*.md", "*_ENHANCEMENT*.md", "*_CLEANUP*.md", "*_DEMONSTRATION*.md", "*_PROOF*.md", "*_CONFIG*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Move-Item -Path "$appPath\$_" -Destination "$docsPath\reports\" -Force -ErrorAction SilentlyContinue
            Write-Host "  📋 Moved report: $_" -ForegroundColor Gray
        } catch {
            # Silently continue if file doesn't exist or can't be moved
        }
    }
    
    # Move deployment files (batch operation)
    Get-ChildItem -Path $appPath -Name "Dockerfile*", "docker-compose*.yml", "k8s-*.yaml", "*.dockerfile" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Move-Item -Path "$appPath\$_" -Destination "$deploymentPath\" -Force -ErrorAction SilentlyContinue
            Write-Host "  🚀 Moved deployment: $_" -ForegroundColor Gray
        } catch {
            # Silently continue if file doesn't exist or can't be moved
        }
    }
    
    # Move test files (batch operation)
    Get-ChildItem -Path $appPath -Name "test-*", "quick-test*", "demo-*", "*test*.cjs", "*test*.mjs" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Move-Item -Path "$appPath\$_" -Destination "$testsPath\" -Force -ErrorAction SilentlyContinue
            Write-Host "  🧪 Moved test: $_" -ForegroundColor Gray
        } catch {
            # Silently continue if file doesn't exist or can't be moved
        }
    }
    
    # Remove temporary and log files (batch operation)
    Get-ChildItem -Path $appPath -Name "*.log", "*.tmp", "*.cache", "output.*", "*.tsbuildinfo", "package-lock.json" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Remove-Item -Path "$appPath\$_" -Force -ErrorAction SilentlyContinue
            Write-Host "  🗑️ Removed temp: $_" -ForegroundColor DarkGray
        } catch {
            # Silently continue if file doesn't exist or can't be removed
        }
    }
    
    # Remove duplicate configs (batch operation)
    Get-ChildItem -Path $appPath -Name ".eslintrc.cjs", ".eslintrc.js" -ErrorAction SilentlyContinue | ForEach-Object {
        # Keep only one ESLint config, remove others if eslint.config.js exists
        if (Test-Path "$appPath\eslint.config.js") {
            try {
                Remove-Item -Path "$appPath\$_" -Force -ErrorAction SilentlyContinue
                Write-Host "  🗑️ Removed duplicate config: $_" -ForegroundColor DarkGray
            } catch {
                # Silently continue
            }
        }
    }
    
    # Remove backup files (batch operation)
    Get-ChildItem -Path $appPath -Name "*.bak", "*.backup", "*.old", "*_OLD*", "*.disabled" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Remove-Item -Path "$appPath\$_" -Force -ErrorAction SilentlyContinue
            Write-Host "  🗑️ Removed backup: $_" -ForegroundColor DarkGray
        } catch {
            # Silently continue if file doesn't exist or can't be removed
        }
    }
    
    Write-Host "  ✅ Completed cleanup for $appName" -ForegroundColor Green
}

Write-Host "`n🎉 Comprehensive cleanup completed for all apps!" -ForegroundColor Green
Write-Host "📊 Check each app's docs/reports/ directory for organized documentation" -ForegroundColor Cyan
