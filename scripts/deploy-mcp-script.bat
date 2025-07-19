@echo off
echo Deploying CODAI MCP Servers PowerShell script...

copy "e:\GitHub\codai-project\scripts\Start-CODAI-MCP-Servers.ps1" "C:\Users\vladu\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Visual Studio Code - Insiders\Start-CODAI-MCP-Servers.ps1"

if errorlevel 1 (
    echo Error: Failed to copy PowerShell script
    pause
    exit /b 1
) else (
    echo Success: PowerShell script deployed to VS Code Start Menu
)

echo.
echo Testing PowerShell script...
powershell -ExecutionPolicy Bypass -File "C:\Users\vladu\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Visual Studio Code - Insiders\Start-CODAI-MCP-Servers.ps1" -Action Start

echo.
echo Deployment completed!
pause
