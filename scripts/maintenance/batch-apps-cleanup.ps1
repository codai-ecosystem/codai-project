# Comprehensive Apps Cleanup Script - Efficient Batch Operations
Write-Host "🧹 Starting comprehensive cleanup of all apps..." -ForegroundColor Green

$rootPath = "e:\GitHub\codai-project"
$appsPath = "$rootPath\apps"

# Get all app directories
$appDirs = Get-ChildItem -Path $appsPath -Directory

Write-Host "📂 Found $($appDirs.Count) apps to clean..." -ForegroundColor Cyan

foreach ($app in $appDirs) {
    $appPath = $app.FullName
    $appName = $app.Name
    
    Write-Host "🔧 Cleaning app: $appName" -ForegroundColor Yellow
    
    # Create organized directories
    $docsReports = "$appPath\docs\reports"
    $deploymentDir = "$appPath\deployment"
    $testsDir = "$appPath\tests"
    
    New-Item -ItemType Directory -Path $docsReports -Force -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Path $deploymentDir -Force -ErrorAction SilentlyContinue | Out-Null
    New-Item -ItemType Directory -Path $testsDir -Force -ErrorAction SilentlyContinue | Out-Null
    
    # Batch move documentation files
    Get-ChildItem -Path $appPath -File | Where-Object { 
        $_.Name -match ".*_(REPORT|GUIDE|PLAN|STATUS|COMPLETE|SUCCESS|PROGRESS|FINAL|DEPLOYMENT|ENTERPRISE|PERFORMANCE|OPTIMIZATION|PRODUCTION|PUBLISHED|ENHANCEMENT|CLEANUP|DEMONSTRATION|PROOF|CONFIG).*\.md$" 
    } | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $docsReports -Force -ErrorAction SilentlyContinue
        Write-Host "  📋 Moved: $($_.Name)" -ForegroundColor Gray
    }
    
    # Batch move deployment files
    Get-ChildItem -Path $appPath -File | Where-Object { 
        $_.Name -match "^(Dockerfile|docker-compose|k8s-).*" -or $_.Extension -eq ".dockerfile" 
    } | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $deploymentDir -Force -ErrorAction SilentlyContinue
        Write-Host "  🚀 Moved: $($_.Name)" -ForegroundColor Gray
    }
    
    # Batch move test files
    Get-ChildItem -Path $appPath -File | Where-Object { 
        $_.Name -match "^(test-|quick-test|demo-)" -or $_.Name -match "test\.(cjs|mjs)$" 
    } | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $testsDir -Force -ErrorAction SilentlyContinue
        Write-Host "  🧪 Moved: $($_.Name)" -ForegroundColor Gray
    }
    
    # Batch remove temporary files
    Get-ChildItem -Path $appPath -File | Where-Object { 
        $_.Extension -in @(".log", ".tmp", ".cache", ".tsbuildinfo") -or $_.Name -eq "package-lock.json" -or $_.Name -match "^output\." 
    } | ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "  🗑️ Removed: $($_.Name)" -ForegroundColor DarkGray
    }
    
    # Remove backup files
    Get-ChildItem -Path $appPath -File | Where-Object { 
        $_.Extension -in @(".bak", ".backup", ".old") -or $_.Name -match "_OLD" -or $_.Name -match "\.disabled$" 
    } | ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "  🗑️ Removed: $($_.Name)" -ForegroundColor DarkGray
    }
    
    Write-Host "  ✅ Completed: $appName" -ForegroundColor Green
}

Write-Host "`n🎉 Comprehensive cleanup completed!" -ForegroundColor Green
