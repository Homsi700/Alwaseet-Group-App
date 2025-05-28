@echo off
echo Starting Alwaseet Group App Dependency Installation...
echo.

REM Check for Node.js and npm
echo Checking for Node.js and npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm (Node.js) is not installed or not found in PATH.
    echo Please install Node.js (which includes npm) from https://nodejs.org/ and try again.
    goto :eof
) else (
    echo npm found.
)
echo.

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies. See messages above.
    goto :eof
) else (
    echo Node.js dependencies installed successfully.
)
echo.

echo ========================================================================
echo Dependency installation finished.
echo You can now try to run the project using run_project.bat
echo IMPORTANT: Ensure your .env.local file is created and configured
echo with your SQL Server connection details and JWT_SECRET.
echo ========================================================================

:eof
pause
