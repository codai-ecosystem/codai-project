@echo off
REM 🚀 CBD & MemorAI MCP Startup Script (Batch Version)
REM Portable script to start CBD database and MemorAI MCP server from any location
REM Version: 1.0.0
REM Date: August 5, 2025

setlocal enabledelayedexpansion

REM Configuration
set SCRIPT_NAME=CBD & MemorAI MCP Startup Script
set VERSION=1.0.0
set CBD_PORT=8080
set MEMORAI_PORT=4950

REM Colors for output (limited in batch)
set SUCCESS=[92m
set ERROR=[91m
set WARNING=[93m
set INFO=[96m
set RESET=[0m

echo %INFO%🚀 %SCRIPT_NAME% v%VERSION%%RESET%
echo %INFO%=================================================%RESET%

REM Check if help requested
if "%1"=="--help" goto :help
if "%1"=="-h" goto :help
if "%1"=="/?" goto :help

REM Auto-detect codai-project path
set CODAI_PATH=
if "%1" neq "" (
    set CODAI_PATH=%1
) else (
    echo %INFO%🔍 Auto-detecting codai-project path...%RESET%
    
    REM Check common locations
    if exist "E:\GitHub\codai-project\packages\cbd" (
        set CODAI_PATH=E:\GitHub\codai-project
        echo %SUCCESS%✅ Found codai-project at: !CODAI_PATH!%RESET%
        goto :pathfound
    )
    
    if exist "C:\GitHub\codai-project\packages\cbd" (
        set CODAI_PATH=C:\GitHub\codai-project
        echo %SUCCESS%✅ Found codai-project at: !CODAI_PATH!%RESET%
        goto :pathfound
    )
    
    if exist "codai-project\packages\cbd" (
        set CODAI_PATH=codai-project
        echo %SUCCESS%✅ Found codai-project at: !CODAI_PATH!%RESET%
        goto :pathfound
    )
    
    if exist "..\codai-project\packages\cbd" (
        set CODAI_PATH=..\codai-project
        echo %SUCCESS%✅ Found codai-project at: !CODAI_PATH!%RESET%
        goto :pathfound
    )
    
    echo %ERROR%❌ Could not auto-detect codai-project path!%RESET%
    echo %WARNING%Please specify the path as the first parameter%RESET%
    echo Example: start-cbd-memorai.bat "C:\Path\To\codai-project"
    pause
    exit /b 1
)

:pathfound
REM Validate paths
if not exist "%CODAI_PATH%" (
    echo %ERROR%❌ Path not found: %CODAI_PATH%%RESET%
    pause
    exit /b 1
)

set CBD_PATH=%CODAI_PATH%\packages\cbd
set MEMORAI_PATH=%CODAI_PATH%\packages\memorai-mcp

if not exist "%CBD_PATH%" (
    echo %ERROR%❌ CBD package not found at: %CBD_PATH%%RESET%
    pause
    exit /b 1
)

if not exist "%MEMORAI_PATH%" (
    echo %ERROR%❌ MemorAI MCP package not found at: %MEMORAI_PATH%%RESET%
    pause
    exit /b 1
)

echo %SUCCESS%✅ Project paths validated%RESET%

REM Clean up existing processes on ports
echo %INFO%🧹 Cleaning up existing processes...%RESET%
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%CBD_PORT%') do (
    echo Stopping process on port %CBD_PORT% (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%MEMORAI_PORT%') do (
    echo Stopping process on port %MEMORAI_PORT% (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

echo %INFO%⏳ Starting services...%RESET%

REM Start CBD Database
echo %INFO%🗃️ Starting CBD Database...%RESET%
cd /d "%CBD_PATH%"
set CBD_PORT=%CBD_PORT%
set CBD_LOG_LEVEL=info
set NODE_ENV=development

start "CBD Database" tsx src/start.ts

REM Wait for CBD to start
timeout /t 5 /nobreak >nul

REM Start MemorAI MCP Server
echo %INFO%🧠 Starting MemorAI MCP Server...%RESET%
cd /d "%MEMORAI_PATH%"
set MEMORAI_API_KEY=memorai-dev-key-2025
set MEMORAI_MCP_PORT=%MEMORAI_PORT%
set PORT=%MEMORAI_PORT%
set NODE_ENV=development
set MEMORAI_LOG_LEVEL=info
set MEMORAI_CBD_PATH=./memorai-cbd-data

start "MemorAI MCP Server" node memorai-mcp-vscode.cjs

REM Wait for services to fully start
echo %INFO%⏳ Waiting for services to initialize...%RESET%
timeout /t 8 /nobreak >nul

REM Check service health
echo %INFO%🔍 Checking service health...%RESET%

REM Check CBD health
curl -s http://localhost:%CBD_PORT%/health >nul 2>&1
if !errorlevel! equ 0 (
    echo %SUCCESS%✅ CBD Database is healthy%RESET%
    set CBD_HEALTHY=1
) else (
    echo %WARNING%⚠️ CBD Database health check failed%RESET%
    set CBD_HEALTHY=0
)

REM Check MemorAI health
curl -s http://localhost:%MEMORAI_PORT%/health >nul 2>&1
if !errorlevel! equ 0 (
    echo %SUCCESS%✅ MemorAI MCP Server is healthy%RESET%
    set MEMORAI_HEALTHY=1
) else (
    echo %WARNING%⚠️ MemorAI MCP Server health check failed%RESET%
    set MEMORAI_HEALTHY=0
)

REM Summary
echo.
echo %SUCCESS%🎉 Startup Complete!%RESET%
echo %INFO%=================================================%RESET%
echo %INFO%📊 Service Status:%RESET%
echo   🗃️ CBD Database:
echo     - Port: %CBD_PORT%
if !CBD_HEALTHY! equ 1 (
    echo     - Status: %SUCCESS%✅ HEALTHY%RESET%
) else (
    echo     - Status: %WARNING%⚠️ CHECK LOGS%RESET%
)
echo     - URL: http://localhost:%CBD_PORT%
echo.
echo   🧠 MemorAI MCP Server:
echo     - Port: %MEMORAI_PORT%
if !MEMORAI_HEALTHY! equ 1 (
    echo     - Status: %SUCCESS%✅ HEALTHY%RESET%
) else (
    echo     - Status: %WARNING%⚠️ CHECK LOGS%RESET%
)
echo     - URL: http://localhost:%MEMORAI_PORT%
echo.
echo %INFO%🔧 Management:%RESET%
echo   - Services are running in separate windows
echo   - Close the service windows to stop them
echo   - Check Windows Task Manager for "CBD Database" and "MemorAI MCP Server"
echo.

if !CBD_HEALTHY! equ 1 if !MEMORAI_HEALTHY! equ 1 (
    echo %SUCCESS%🎯 All services are running successfully!%RESET%
) else (
    echo %WARNING%⚠️ Some services may need attention - check the service windows%RESET%
)

echo %INFO%=================================================%RESET%
echo Press any key to exit this window (services will continue running)...
pause >nul
exit /b 0

:help
echo %INFO%🚀 %SCRIPT_NAME% v%VERSION%%RESET%
echo %INFO%=================================================%RESET%
echo.
echo USAGE:
echo   start-cbd-memorai.bat [CODAI_PROJECT_PATH]
echo.
echo PARAMETERS:
echo   CODAI_PROJECT_PATH    Path to codai-project (auto-detected if not specified)
echo.
echo EXAMPLES:
echo   start-cbd-memorai.bat
echo   start-cbd-memorai.bat "C:\GitHub\codai-project"
echo   start-cbd-memorai.bat "E:\Dev\codai-project"
echo.
echo FEATURES:
echo   - Auto-detects codai-project location
echo   - Starts CBD Database (port 8080)
echo   - Starts MemorAI MCP Server (port 4950)
echo   - Health checks for both services
echo   - Clean process management
echo.
pause
exit /b 0
