@echo off
REM 🚀 NPM Package Publication Script for codai.ro (Windows)

echo 📦 Publishing codai.ro NPM packages...

REM Check if we're logged into NPM
npm whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged into NPM. Please run: npm login
    exit /b 1
)

REM Create @codai organization if it doesn't exist
echo 🏢 Checking @codai organization...
npm org ls codai >nul 2>&1
if errorlevel 1 (
    echo Creating @codai organization...
    npm org create codai
)

REM Function to publish a package
:publish_package
set package_path=%1
set package_name=%2

echo 📦 Publishing %package_name%...

cd %package_path%

REM Build the package
echo 🔨 Building %package_name%...
npm run build

if errorlevel 1 (
    echo ❌ Build failed for %package_name%
    goto :eof
)

REM Publish to NPM
echo 🚀 Publishing %package_name% to NPM...
npm publish --access public

if not errorlevel 1 (
    echo ✅ Successfully published %package_name%
) else (
    echo ❌ Failed to publish %package_name%
    goto :eof
)

cd ..
goto :eof

REM Publish packages in dependency order
echo 📚 Publishing packages in dependency order...

REM 1. Memory Graph (no dependencies)
call :publish_package "packages\memory-graph" "@codai/memory-graph"

REM 2. Agent Runtime (depends on memory-graph)
call :publish_package "packages\agent-runtime" "@codai/agent-runtime"

REM 3. UI Components (depends on both)
call :publish_package "packages\ui-components" "@codai/ui-components"

echo.
echo 🎉 Publication complete!
echo.
echo 📦 Published packages:
echo    • @codai/memory-graph@1.0.0
echo    • @codai/agent-runtime@1.0.1
echo    • @codai/ui-components@1.0.0
echo.
echo 📚 View packages:
echo    • https://www.npmjs.com/package/@codai/memory-graph
echo    • https://www.npmjs.com/package/@codai/agent-runtime
echo    • https://www.npmjs.com/package/@codai/ui-components
echo.
echo 🔗 Usage:
echo    npm install @codai/memory-graph
echo    npm install @codai/agent-runtime
echo    npm install @codai/ui-components
echo.
echo ✅ All packages ready for production use!
