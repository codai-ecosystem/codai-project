@echo off
echo Installing dependencies for MCP packages...

echo.
echo Installing Glass MCP dependencies...
cd /d "e:\GitHub\codai-project\apps\glass\packages\mcp"
call pnpm install
if errorlevel 1 (
    echo Error installing Glass MCP dependencies
    pause
    exit /b 1
)

echo.
echo Installing Memorai MCP dependencies...
cd /d "e:\GitHub\codai-project\apps\memorai\packages\mcp"
call pnpm install
if errorlevel 1 (
    echo Error installing Memorai MCP dependencies
    pause
    exit /b 1
)

echo.
echo Installing Romai MCP dependencies...
cd /d "e:\GitHub\codai-project\apps\romai\packages\romai-mcp"
call pnpm install
if errorlevel 1 (
    echo Error installing Romai MCP dependencies
    pause
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo.
echo Starting MCP HTTP servers...

echo.
echo Starting Glass MCP Server (port 8001)...
cd /d "e:\GitHub\codai-project\apps\glass\packages\mcp\src"
start "Glass MCP" cmd /k "node http-wrapper.js"
timeout /t 2 /nobreak >nul

echo.
echo Starting Memorai MCP Server (port 8002)...
cd /d "e:\GitHub\codai-project\apps\memorai\packages\mcp\src"
start "Memorai MCP" cmd /k "node http-wrapper.js"
timeout /t 2 /nobreak >nul

echo.
echo Starting Romai MCP Server (port 8003)...
cd /d "e:\GitHub\codai-project\apps\romai\packages\romai-mcp\src"
start "Romai MCP" cmd /k "node http-wrapper.js"
timeout /t 2 /nobreak >nul

echo.
echo All servers started! Testing health endpoints...
timeout /t 3 /nobreak >nul

echo.
echo Testing Glass MCP (port 8001)...
curl -s http://localhost:8001/health
echo.

echo Testing Memorai MCP (port 8002)...
curl -s http://localhost:8002/health
echo.

echo Testing Romai MCP (port 8003)...
curl -s http://localhost:8003/health
echo.

echo.
echo MCP HTTP servers are running!
echo Glass MCP: http://localhost:8001/health
echo Memorai MCP: http://localhost:8002/health  
echo Romai MCP: http://localhost:8003/health
echo.
pause
