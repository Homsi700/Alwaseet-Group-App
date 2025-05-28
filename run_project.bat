@echo off
echo Starting Alwaseet Group App - Muhasiby Project...
echo This script will start the Python DB bridge and the Next.js development server.
echo.

set VENV_DIR=.venv

REM Check for Python virtual environment
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo ERROR: Python virtual environment ("%VENV_DIR%") not found.
    echo Please run 'install_dependencies.bat' first to set it up.
    pause
    goto :eof
)
echo Python virtual environment found.
echo.

REM Activate Python virtual environment
echo Activating Python virtual environment...
call "%VENV_DIR%\Scripts\activate.bat"
echo.

REM Start Python DB Bridge in a new window
echo Starting Python DB bridge (src/scripts/db_bridge.py) in a new terminal window...
echo The DB bridge window will show logs for database interactions. Keep it running.
start "Python DB Bridge - Muhasiby" cmd /k "echo Python DB Bridge for Muhasiby - Running... && python src/scripts/db_bridge.py"
echo.

echo Waiting for DB bridge to initialize (5 seconds)...
REM Using ping for delay as timeout might not be available or behave differently
ping -n 6 127.0.0.1 > nul
echo DB bridge should be starting up.
echo.

REM Start Next.js development server
echo Starting Next.js development server (npm run dev)...
echo This will open your browser to http://localhost:9002 when ready.
npm run dev

echo.
echo --------------------------------------------------------------------
echo If the browser did not open automatically, please navigate to http://localhost:9002
echo.
echo To stop the DB bridge, close its dedicated terminal window.
echo To stop the Next.js server, press CTRL+C in this window.
echo --------------------------------------------------------------------
echo.

REM Deactivate virtual environment when this script main cmd window is closed or interrupted (though npm run dev will keep it open)
deactivate
pause
