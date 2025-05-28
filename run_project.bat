@echo off
echo Starting Alwaseet Group App Development Server...
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

echo Starting Next.js development server...
echo This will typically open your browser automatically at http://localhost:9002
npm run dev

:eof
pause
