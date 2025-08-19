@echo off
echo 🚀 Quick PNPM Operations for CODAI Project
echo ============================================

:menu
echo.
echo Choose an option:
echo 1. ⚡ Quick Install (prefer offline)
echo 2. 📦 Add Package (with optimization)
echo 3. 🧹 Clean and Reinstall
echo 4. 📊 Show Dependencies Status
echo 5. 🔍 Audit Dependencies
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto quick_install
if "%choice%"=="2" goto add_package
if "%choice%"=="3" goto clean_reinstall
if "%choice%"=="4" goto show_status
if "%choice%"=="5" goto audit
if "%choice%"=="6" goto exit
echo Invalid choice. Please try again.
goto menu

:quick_install
echo 📥 Installing dependencies with offline preference...
pnpm install --prefer-offline --reporter=silent
echo ✅ Installation complete!
goto menu

:add_package
set /p package="Enter package name: "
echo 📦 Adding %package% with optimization...
pnpm add %package% --prefer-offline --reporter=silent
echo ✅ Package added!
goto menu

:clean_reinstall
echo 🧹 Cleaning cache and reinstalling...
pnpm store prune
pnpm install --prefer-offline --no-frozen-lockfile --reporter=silent
echo ✅ Clean reinstall complete!
goto menu

:show_status
echo 📊 Current dependencies status:
pnpm list --depth=0
goto menu

:audit
echo 🔍 Auditing dependencies...
pnpm audit
goto menu

:exit
echo 👋 Goodbye!
