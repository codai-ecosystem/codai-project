@echo off
REM CBD Enterprise Production Deployment Launcher
REM This batch file launches the PowerShell deployment script

setlocal EnableDelayedExpansion

REM Get script directory
set "SCRIPT_DIR=%~dp0"

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell is not available
    echo Please install PowerShell to use this deployment script
    exit /b 1
)

REM Execute PowerShell script with all arguments
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%deploy-production.ps1" %*

REM Exit with PowerShell script's exit code
exit /b !ERRORLEVEL!
