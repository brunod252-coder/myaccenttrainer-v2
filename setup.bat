@echo off
cd /d "%~dp0"
echo ============================================
echo   Setting up MyAccentTrainer
echo ============================================
echo.
echo Installing (this can take a few minutes the first time)...
call npm install
echo.
echo Preparing the database...
call npm run setup
echo.
echo ============================================
echo   Setup complete!
echo   Now double-click  run.bat  to start it.
echo ============================================
pause
