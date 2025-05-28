@echo off
echo.
echo Starting Alwaseet Group App Dependency Installation...
echo ======================================================
echo.

REM Check for Node.js and npm
echo Checking for Node.js and npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm (Node Package Manager) is not found. Please install Node.js and npm.
    echo Visit https://nodejs.org/ to download and install Node.js.
    echo.
    pause
    exit /b 1
)
echo Node.js and npm found.
echo.

REM Install Node.js dependencies
echo Installing Node.js dependencies (npm install)...
call npm install
echo Installing SQL Server Native Client dependencies...
call npm install mssql msnodesqlv8 --save
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Node.js dependencies using 'npm install'.
    echo Please check the error messages above for more details.
    echo Common issues:
    echo   - Network connectivity problems.
    echo   - Incorrect package versions in package.json.
    echo   - Missing system dependencies for native modules.
    echo.
    pause
    exit /b 1
)
echo Node.js dependencies installed successfully.
echo.

echo ======================================================
echo Dependency installation process finished.
echo Please review any messages above for errors or warnings.
echo.
echo ========================================================================
echo Dependency installation finished.
echo You can now try to run the project using run_project.bat
echo IMPORTANT: Ensure your .env.local file is created and configured
echo with your SQL Server connection details and JWT_SECRET.
echo ========================================================================
echo.
pause
exit /b 0