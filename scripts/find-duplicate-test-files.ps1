# Find Duplicate Test Files Script
# Analyzes JSX test files for exact duplicates using content comparison

param(
    [string]$RootPath = "e:\GitHub\codai-project\apps",
    [switch]$ShowDetails
)

Write-Host "🔍 Analyzing JSX test files for duplicates..." -ForegroundColor Cyan

try {
    # Get all JSX test files, avoiding broken symlinks
    $testFiles = @()
    Get-ChildItem -Path $RootPath -Recurse -Include "*.test.jsx" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            if (Test-Path $_.FullName) {
                $content = Get-Content $_.FullName -Raw -ErrorAction Stop
                if ($content) {
                    # Create hash of content (excluding comments and whitespace differences)
                    $normalizedContent = $content -replace '\s+', ' ' -replace '/\*.*?\*/', '' -replace '//.*', ''
                    $hash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($normalizedContent))
                    $hashString = [System.BitConverter]::ToString($hash) -replace '-', ''
                    
                    $testFiles += [PSCustomObject]@{
                        Path = $_.FullName
                        Name = $_.Name
                        Hash = $hashString
                        Size = $_.Length
                        Directory = $_.Directory.FullName
                    }
                }
            }
        }
        catch {
            Write-Warning "Skipped $($_.FullName): $($_.Exception.Message)"
        }
    }

    Write-Host "📊 Found $($testFiles.Count) JSX test files" -ForegroundColor Yellow

    # Group by hash to find duplicates
    $duplicateGroups = $testFiles | Group-Object -Property Hash | Where-Object { $_.Count -gt 1 }

    if ($duplicateGroups.Count -eq 0) {
        Write-Host "✅ No exact duplicate JSX test files found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Found $($duplicateGroups.Count) duplicate groups:" -ForegroundColor Red
        
        foreach ($group in $duplicateGroups) {
            Write-Host "`n📁 Duplicate Group ($($group.Count) files):" -ForegroundColor Magenta
            
            foreach ($file in $group.Group) {
                $relativePath = $file.Path -replace [regex]::Escape($RootPath), ""
                Write-Host "  📄 $relativePath" -ForegroundColor White
                Write-Host "      Size: $($file.Size) bytes, Directory: $(Split-Path $file.Directory -Leaf)" -ForegroundColor Gray
            }
            
            if ($ShowDetails) {
                Write-Host "  🔍 Content Preview:" -ForegroundColor Blue
                $sampleContent = Get-Content $group.Group[0].Path -TotalCount 10 -ErrorAction SilentlyContinue
                $sampleContent | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                Write-Host "      ..." -ForegroundColor Gray
            }
        }
        
        # Summary
        $totalDuplicates = ($duplicateGroups | ForEach-Object { $_.Count - 1 } | Measure-Object -Sum).Sum
        Write-Host "`n📈 Summary:" -ForegroundColor Yellow
        Write-Host "   - Duplicate groups: $($duplicateGroups.Count)" -ForegroundColor White
        Write-Host "   - Total duplicate files: $totalDuplicates" -ForegroundColor White
        Write-Host "   - Files to remove: $totalDuplicates" -ForegroundColor White
        
        # Recommendations
        Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
        Write-Host "   1. Keep one copy of each duplicate group" -ForegroundColor White
        Write-Host "   2. Move shared tests to a common test utilities location" -ForegroundColor White
        Write-Host "   3. Update import statements in remaining files" -ForegroundColor White
        Write-Host "   4. Add pre-commit hooks to prevent future duplicates" -ForegroundColor White
    }

    # Check for similar file names (potential duplicates)
    Write-Host "`n🔍 Checking for similar file names..." -ForegroundColor Cyan
    $nameGroups = $testFiles | Group-Object -Property Name | Where-Object { $_.Count -gt 1 }
    
    if ($nameGroups.Count -gt 0) {
        Write-Host "⚠️  Found $($nameGroups.Count) files with identical names in different locations:" -ForegroundColor Yellow
        
        foreach ($nameGroup in $nameGroups) {
            Write-Host "`n📁 Same Name Group: $($nameGroup.Name)" -ForegroundColor Magenta
            foreach ($file in $nameGroup.Group) {
                $relativePath = $file.Path -replace [regex]::Escape($RootPath), ""
                Write-Host "  📄 $relativePath" -ForegroundColor White
            }
        }
    }

} catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
}

Write-Host "`n✅ Analysis completed!" -ForegroundColor Green