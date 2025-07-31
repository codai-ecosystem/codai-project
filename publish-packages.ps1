# Script to publish all CODAI packages

$packageDirs = Get-ChildItem "packages" -Directory

foreach ($dir in $packageDirs) {
    $packagePath = "packages/$($dir.Name)"
    $packageJsonPath = "$packagePath/package.json"
    
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
            $packageName = $packageJson.name
            $packageVersion = $packageJson.version
            
            Write-Host "=== Publishing $packageName@$packageVersion ===" -ForegroundColor Yellow
            
            # Check if package has build script
            if ($packageJson.scripts.build) {
                Write-Host "Building package..." -ForegroundColor Blue
                Set-Location $packagePath
                try {
                    if ($packageJson.scripts.build -eq "tsc" -or $packageJson.scripts.build -like "*tsc*") {
                        # Skip TypeScript packages that need dependencies
                        Write-Host "Skipping TypeScript build (dependency issues)" -ForegroundColor Red
                        continue
                    } else {
                        & npm run build
                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Build failed, skipping..." -ForegroundColor Red
                            Set-Location "../../"
                            continue
                        }
                    }
                } catch {
                    Write-Host "Build error: $($_.Exception.Message)" -ForegroundColor Red
                    Set-Location "../../"
                    continue
                }
            }
            
            # Try to publish
            try {
                if ($packageVersion -like "*-*") {
                    # Prerelease version
                    & npm publish --access public --tag beta
                } else {
                    # Regular version
                    & npm publish --access public
                }
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Successfully published $packageName@$packageVersion" -ForegroundColor Green
                } else {
                    Write-Host "❌ Failed to publish $packageName" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Publish error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            Set-Location "../../"
            
        } catch {
            Write-Host "Error reading package.json for $($dir.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Publishing Summary ===" -ForegroundColor Cyan
Write-Host "Check above for successful packages marked with ✅" -ForegroundColor Cyan
