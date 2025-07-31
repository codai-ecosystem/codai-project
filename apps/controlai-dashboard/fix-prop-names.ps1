# Fix prop name mismatches script
Write-Host "🔧 Fixing prop name mismatches in test files..." -ForegroundColor Cyan

$testFiles = Get-ChildItem -Path "tests" -Filter "*.test.tsx" -Recurse

foreach ($file in $testFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace dashboardData prop with data prop
    $content = $content -replace "dashboardData=\{", "data={"
    $content = $content -replace "dashboardData:", "data:"
    
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "✅ Prop name fixes completed!" -ForegroundColor Green
