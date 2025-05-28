@echo off
echo.
echo Starting Alwaseet Group App Dependency Installation...
echo ======================================================
echo.

REM Check for Node.js and npm
echo Checking for Node.js and npm...
npm -v >nul 2>&1
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
npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Node.js dependencies using 'npm install'.
    echo Please check the error messages above for more details.
    echo Common issues:
    echo   - Network connectivity problems.
    echo   - Incorrect package versions in package.json (check for ETARGET errors).
    echo   - Missing system dependencies for native modules (less likely now that Python bridge is removed).
    echo.
    pause
    exit /b 1
)
echo Node.js dependencies installed successfully.
echo.

echo ======================================================
echo Dependency installation process finished.
echo Please review any messages above for errors or warnings.
echo Press any key to close this window.
echo.
pause
exit /b 0
