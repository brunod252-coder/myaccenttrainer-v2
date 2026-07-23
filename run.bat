@echo off
cd /d "%~dp0"
echo ============================================
echo   Starting MyAccentTrainer
echo   It will open at http://localhost:3000
echo   (Leave this window open while you use it.)
echo ============================================
echo.
start "" http://localhost:3000
call npm run dev
