@echo off
echo ================================
echo ROMAI AGI - North Star Demo 2025
echo ================================
echo.

echo Checking system requirements...

:: Check Python
python --version
if errorlevel 1 (
    echo Python not found
    pause
    exit /b 1
)

:: Check PyTorch
echo Checking PyTorch...
python -c "import torch; print('PyTorch version:', torch.__version__)"
if errorlevel 1 (
    echo PyTorch not available
    pause
    exit /b 1
)

echo.
echo Starting North Star AGI Demo...
echo.

cd /d "e:\GitHub\codai-project\apps\romai\src"

echo Running AGI Baseline Measurement...

python -c "import asyncio; import os; import sys; sys.path.insert(0, os.getcwd()); from agi_baseline_measurement import AGIBaselineSystem; asyncio.run(AGIBaselineSystem().generate_comprehensive_baseline())"

if errorlevel 0 (
    echo.
    echo Demo completed successfully!
    echo Results saved to romai_baseline_measurement.json
) else (
    echo.
    echo Demo failed
)

echo.
echo Demo execution finished.
pause