@echo off
setlocal enabledelayedexpansion

REM ============================================================================
REM Portable startup script for CBD Database and MemorAI MCP Server
REM
REM This batch file can be copied to any folder and will automatically detect
REM the codai-project path, then start both services.
REM
REM Usage:
REM   start-cbd-memorai.bat [start|stop|status|help]
REM
REM Author: GitHub Copilot Agent
REM Version: 1.0
REM ============================================================================

set ACTION=%1
if "%ACTION%"=="" set ACTION=start

set CBD_PORT=8080
set MEMORAI_PORT=4950

echo.
echo ==============================================
echo 🚀 CBD Database ^& MemorAI MCP Server Manager
echo ==============================================
echo.

if /i "%ACTION%"=="help" goto :show_help
if /i "%ACTION%"=="start" goto :start_services
if /i "%ACTION%"=="stop" goto :stop_services
if /i "%ACTION%"=="status" goto :show_status
goto :show_help

:show_help
echo USAGE:
echo   start-cbd-memorai.bat [action]
echo.
echo ACTIONS:
echo   start     - Start both services (default)
echo   stop      - Stop both services
echo   status    - Show service status
echo   help      - Show this help
echo.
echo EXAMPLES:
echo   start-cbd-memorai.bat
echo   start-cbd-memorai.bat start
echo   start-cbd-memorai.bat status
echo   start-cbd-memorai.bat stop
echo.
goto :end

:find_project
echo 🔍 Searching for codai-project...

REM Check current directory and parents
set "CURRENT_DIR=%CD%"
for /L %%i in (1,1,4) do (
    if exist "!CURRENT_DIR!\packages\cbd" if exist "!CURRENT_DIR!\packages\memorai-mcp" (
        set "PROJECT_PATH=!CURRENT_DIR!"
        echo ✅ Found codai-project at: !PROJECT_PATH!
        goto :found_project
    )
    for %%p in ("!CURRENT_DIR!") do set "CURRENT_DIR=%%~dpp"
    set "CURRENT_DIR=!CURRENT_DIR:~0,-1!"
)

REM Check common paths
set SEARCH_PATHS=e:\GitHub\codai-project c:\GitHub\codai-project d:\GitHub\codai-project %USERPROFILE%\GitHub\codai-project %USERPROFILE%\codai-project

for %%p in (%SEARCH_PATHS%) do (
    if exist "%%p\packages\cbd" if exist "%%p\packages\memorai-mcp" (
        set "PROJECT_PATH=%%p"
        echo ✅ Found codai-project at: !PROJECT_PATH!
        goto :found_project
    )
)

echo ❌ Could not find codai-project directory!
echo Make sure the codai-project exists in one of these locations:
for %%p in (%SEARCH_PATHS%) do echo   - %%p
exit /b 1

:found_project
exit /b 0

:check_port
set PORT=%1
set SERVICE_NAME=%2

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT% " 2^>nul') do (
    set "PID=%%a"
    if "!PID!" neq "" (
        for /f "tokens=1" %%b in ('tasklist /fi "pid eq !PID!" /fo csv /nh 2^>nul') do (
            set "PROCESS_NAME=%%b"
            set "PROCESS_NAME=!PROCESS_NAME:"=!"
            if "!PROCESS_NAME!" neq "" (
                echo ✅ %SERVICE_NAME% (port %PORT%): RUNNING (PID: !PID!, Process: !PROCESS_NAME!)
                exit /b 0
            )
        )
    )
)
echo ❌ %SERVICE_NAME% (port %PORT%): NOT RUNNING
exit /b 1

:stop_port
set PORT=%1
set SERVICE_NAME=%2

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT% " 2^>nul') do (
    set "PID=%%a"
    if "!PID!" neq "" (
        echo 🛑 Stopping %SERVICE_NAME% (PID: !PID!, Port: %PORT%)...
        taskkill /PID !PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Stopped %SERVICE_NAME%
        ) else (
            echo ❌ Failed to stop %SERVICE_NAME%
        )
        exit /b !errorlevel!
    )
)
echo ℹ️  %SERVICE_NAME% not running on port %PORT%
exit /b 0

:health_check
set URL=%1
set SERVICE_NAME=%2
set PORT=%3

REM Try to check health endpoint using curl (if available)
curl -s --connect-timeout 5 "%URL%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ %SERVICE_NAME% (port %PORT%): HEALTHY
    exit /b 0
) else (
    echo ❌ %SERVICE_NAME% (port %PORT%): FAILED
    exit /b 1
)

:show_status
echo 📊 Service Status:
echo.
call :check_port %CBD_PORT% "CBD Database"
call :check_port %MEMORAI_PORT% "MemorAI MCP Server"
echo.

REM Try health checks if curl is available
where curl >nul 2>&1
if %errorlevel% equ 0 (
    echo 🏥 Health Check:
    call :health_check "http://localhost:%CBD_PORT%/health" "CBD Database" %CBD_PORT%
    call :health_check "http://localhost:%MEMORAI_PORT%/health" "MemorAI MCP Server" %MEMORAI_PORT%
    echo.
) else (
    echo ℹ️  Install curl for health checks
    echo.
)
goto :end

:stop_services
echo 🛑 Stopping all services...
echo.
call :stop_port %MEMORAI_PORT% "MemorAI MCP Server"
call :stop_port %CBD_PORT% "CBD Database"
echo.
echo ✅ Stop command completed!
echo.
call :show_status
goto :end

:start_services
call :find_project
if %errorlevel% neq 0 goto :end

echo 🚀 Starting all services...
echo.

REM Start CBD Database
echo 🗃️ Starting CBD Database...
cd /d "%PROJECT_PATH%\packages\cbd"
start "CBD Database" /min tsx src/start.ts
if %errorlevel% neq 0 (
    echo ❌ Failed to start CBD Database
    goto :end
)
echo ✅ CBD Database started

REM Wait a bit for CBD to initialize
timeout /t 5 /nobreak >nul

REM Start MemorAI MCP Server
echo 🧠 Starting MemorAI MCP Server...
cd /d "%PROJECT_PATH%\packages\memorai-mcp"

REM Set environment variables
set MEMORAI_API_KEY=memorai-dev-key-2025
set MEMORAI_MCP_PORT=%MEMORAI_PORT%
set PORT=%MEMORAI_PORT%
set NODE_ENV=development
set MEMORAI_DEBUG=true
set MEMORAI_LOG_LEVEL=debug
set MEMORAI_CBD_PATH=./memorai-cbd-data

start "MemorAI MCP Server" /min node memorai-mcp-vscode.cjs
if %errorlevel% neq 0 (
    echo ❌ Failed to start MemorAI MCP Server
    goto :end
)
echo ✅ MemorAI MCP Server started

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 All services started successfully!
echo.
call :show_status

REM Return to original directory
cd /d "%CD%"

goto :end

:end
echo ✨ Done!
echo.
pause
