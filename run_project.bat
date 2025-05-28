@echo off
echo Starting Alwaseet Group App Development Environment...
echo.

REM Check if Python virtual environment exists
if not exist .\.venv\Scripts\activate.bat (
    echo ERROR: Python virtual environment (.venv) not found or not set up correctly.
    echo Please run install_dependencies.bat first to set it up.
    pause
    goto :eof
)

echo Activating Python virtual environment...
call .\.venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate Python virtual environment.
    pause
    goto :eof
)
echo Python virtual environment activated.
echo.

echo Starting Python DB bridge in a new window...
REM Using start /B runs the command in the background without a new window,
REM but its output will mix. Using `start "Title" cmd /c` gives it a separate window.
start "Python DB Bridge" cmd /c "echo Starting Python DB Bridge... ^& python src/scripts/db_bridge.py ^& echo Python DB Bridge has finished. You can close this window. ^& pause"

echo.
echo Waiting for Python DB bridge to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo Starting Next.js development server...
echo (This will open the application in your default web browser at http://localhost:9002)
echo.
call npm run dev

echo.
echo Next.js development server has been stopped.
pause
:eof
