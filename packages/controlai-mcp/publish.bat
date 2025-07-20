@echo off
echo 🚀 ControlAI MCP v1.0.3 - High-Performance Edition Publishing Script
echo.

echo 📂 Navigating to package directory...
cd /d "E:\GitHub\codai-project\packages\controlai-mcp"
if errorlevel 1 (
    echo ❌ Failed to navigate to package directory
    exit /b 1
)

echo 🧹 Cleaning previous build...
if exist "dist" rmdir /s /q "dist"
pnpm run clean 2>nul

echo 🔨 Building TypeScript...
pnpm run build
if errorlevel 1 (
    echo ❌ Build failed! Check TypeScript errors above.
    exit /b 1
)

echo ✅ Build completed successfully!

echo 📦 Publishing to npm...
npm publish --registry https://registry.npmjs.org/ --access public
if errorlevel 1 (
    echo ❌ Publish failed! Check npm errors above.
    exit /b 1
)

echo.
echo ✅ Successfully published controlai-mcp@1.0.3!
echo 🎉 High-Performance Enterprise Edition is now available!
echo.
echo 📊 Performance Improvements:
echo   • Enhanced multi-agent coordination
echo   • Optimized database operations  
echo   • Intelligent caching system
echo   • Enterprise-grade error handling
echo   • Real-time performance monitoring
echo.
echo 🔧 Install command:
echo   npx -y controlai-mcp@latest
echo.
echo 🌐 Update VS Code MCP configuration to use the new version:
echo   "controlai-mcp@latest" in mcp.json
echo.
pause
