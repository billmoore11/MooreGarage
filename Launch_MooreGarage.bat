@echo off
title MooreGarage - Personal Fleet Oil Change Tracker
color 0A
cls
echo ========================================================
echo         Starting MooreGarage Localhost Server...
echo ========================================================
echo.
cd /d "%~dp0"

echo Opening http://localhost:5173 in your default browser...
start "" "http://localhost:5173"

echo.
echo Server is running! Keep this window open while using the app.
echo Press Ctrl+C in this window to stop the server.
echo.
call npm run dev -- --host --port 5173
pause
