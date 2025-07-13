# Fix TailwindCSS PostCSS Configuration for All Apps
# This script replaces "tailwindcss: {}" with "@tailwindcss/postcss: {}" in all postcss.config.js files

$appsPath = "e:\GitHub\codai-project\apps"
$appDirectories = Get-ChildItem -Path $appsPath -Directory

foreach ($appDir in $appDirectories) {
    $postcssConfigPath = Join-Path $appDir.FullName "postcss.config.js"
    
    if (Test-Path $postcssConfigPath) {
        $content = Get-Content $postcssConfigPath -Raw
        
        # Check if the file contains the old configuration
        if ($content -match "tailwindcss: \{\}") {
            # Replace the old configuration with the new one
            $newContent = $content -replace "tailwindcss: \{\}", "'@tailwindcss/postcss': {}"
            
            # Write the updated content back to the file
            Set-Content -Path $postcssConfigPath -Value $newContent -NoNewline
            
            Write-Host "Updated PostCSS config for: $($appDir.Name)" -ForegroundColor Green
        }
    }
    
    # Also check nested app directories (like dexai/apps/web, memorai/apps/dashboard)
    $nestedAppsPath = Join-Path $appDir.FullName "apps"
    if (Test-Path $nestedAppsPath) {
        $nestedAppDirectories = Get-ChildItem -Path $nestedAppsPath -Directory
        
        foreach ($nestedAppDir in $nestedAppDirectories) {
            $nestedPostcssConfigPath = Join-Path $nestedAppDir.FullName "postcss.config.js"
            
            if (Test-Path $nestedPostcssConfigPath) {
                $nestedContent = Get-Content $nestedPostcssConfigPath -Raw
                
                if ($nestedContent -match "tailwindcss: \{\}") {
                    $newNestedContent = $nestedContent -replace "tailwindcss: \{\}", "'@tailwindcss/postcss': {}"
                    Set-Content -Path $nestedPostcssConfigPath -Value $newNestedContent -NoNewline
                    
                    Write-Host "Updated PostCSS config for: $($appDir.Name)/$($nestedAppDir.Name)" -ForegroundColor Green
                }
            }
        }
    }
}

Write-Host "PostCSS configuration update completed!" -ForegroundColor Cyan
