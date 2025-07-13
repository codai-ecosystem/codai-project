@echo off
echo 🧹 Comprehensive Apps Cleanup - Batch Operations
echo.

set "APPS_DIR=e:\GitHub\codai-project\apps"

for /d %%A in ("%APPS_DIR%\*") do (
    echo 🔧 Cleaning: %%~nA
    
    REM Create directories
    mkdir "%%A\docs\reports" 2>nul
    mkdir "%%A\deployment" 2>nul
    mkdir "%%A\tests" 2>nul
    
    REM Move report files
    move "%%A\*_REPORT.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_GUIDE.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_PLAN.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_STATUS.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_COMPLETE.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_SUCCESS*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_FINAL*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_ENTERPRISE*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_PERFORMANCE*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_OPTIMIZATION*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_PRODUCTION*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_PUBLISHED*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_ENHANCEMENT*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_CLEANUP*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_DEMONSTRATION*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_PROOF*.md" "%%A\docs\reports\" 2>nul
    move "%%A\*_CONFIG*.md" "%%A\docs\reports\" 2>nul
    
    REM Move deployment files
    move "%%A\Dockerfile*" "%%A\deployment\" 2>nul
    move "%%A\docker-compose*.yml" "%%A\deployment\" 2>nul
    move "%%A\k8s-*.yaml" "%%A\deployment\" 2>nul
    
    REM Move test files
    move "%%A\test-*.js" "%%A\tests\" 2>nul
    move "%%A\test-*.mjs" "%%A\tests\" 2>nul
    move "%%A\test-*.cjs" "%%A\tests\" 2>nul
    move "%%A\demo-*.js" "%%A\tests\" 2>nul
    move "%%A\demo-*.cjs" "%%A\tests\" 2>nul
    move "%%A\quick-test*.js" "%%A\tests\" 2>nul
    
    REM Remove temporary files
    del "%%A\*.log" 2>nul
    del "%%A\*.tsbuildinfo" 2>nul
    del "%%A\package-lock.json" 2>nul
    del "%%A\*.bak" 2>nul
    del "%%A\*.backup" 2>nul
    del "%%A\*.old" 2>nul
    del "%%A\*.tmp" 2>nul
    del "%%A\*.cache" 2>nul
    del "%%A\output.*" 2>nul
    
    echo ✅ Completed: %%~nA
    echo.
)

echo 🎉 All apps cleaned successfully!
echo 📊 Check each app's docs/reports/ directory for organized documentation
