@echo off
echo Building and Publishing ControlAI MCP v1.0.2...
cd /d "E:\GitHub\codai-project\packages\controlai-mcp"
echo Current directory: %CD%

echo Step 1: Building TypeScript...
call pnpm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Step 2: Publishing to npm...
call npm publish
if %errorlevel% neq 0 (
    echo Publish failed!
    pause
    exit /b 1
)

echo Step 3: Testing help command...
call npx controlai-mcp@latest --help
if %errorlevel% neq 0 (
    echo Help command test failed!
    pause
    exit /b 1
)

echo ✅ ControlAI MCP v1.0.2 published successfully!
echo Ready for VS Code integration and demonstration.
pause
