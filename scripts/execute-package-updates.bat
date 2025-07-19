@echo off
echo 📦 CODAI ECOSYSTEM - PACKAGE UPDATE EXECUTION
echo =============================================

cd /d "E:\GitHub\codai-project"

echo.
echo 🚀 Starting comprehensive package update...
node scripts\comprehensive-package-updater.cjs

echo.
echo 📥 Installing updated packages...
pnpm install

echo.
echo ✅ Package update process complete!
echo 🧪 Please test critical apps before deployment.

pause
