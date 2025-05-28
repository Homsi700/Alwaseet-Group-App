@echo off
echo Installing project dependencies...
echo.

echo Checking for Node.js and npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm (Node.js) is not installed or not found in PATH.
    echo Please install Node.js (which includes npm) from https://nodejs.org/
    goto :eof
) else (
    echo npm found.
)
echo.

echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not found in PATH.
    echo Please install Python from https://www.python.org/downloads/
    goto :eof
) else (
    echo Python found.
)
echo.

echo Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Please check the errors above.
    goto :error_exit
)
echo Node.js dependencies installed successfully.
echo.

echo Setting up Python virtual environment and installing Python dependencies...

REM Check if .venv exists
if not exist .\.venv (
    echo Creating Python virtual environment (.venv)...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create Python virtual environment. Please ensure 'venv' module is available.
        goto :error_exit
    )
    echo Python virtual environment created in .\.venv folder.
) else (
    echo Python virtual environment (.venv) already exists.
)
echo.

echo Activating Python virtual environment...
call .\.venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate Python virtual environment. Make sure it was created correctly.
    goto :error_exit
)
echo.

echo Installing Python dependencies from requirements.txt...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install -r requirements.txt failed. Please check the errors above.
    echo.
    echo COMMON ISSUES FOR PYODBC ON WINDOWS:
    echo 1. Ensure 'Microsoft C++ Build Tools' are installed.
    echo    Get them from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo    During installation, select 'Desktop development with C++'.
    echo 2. Ensure you have the Microsoft ODBC Driver for SQL Server installed.
    echo.
    goto :error_exit
)
echo Python dependencies installed successfully.
echo.

echo All dependencies installed successfully!
goto :success_exit

:error_exit
echo.
echo **********************************************************************
echo * An error occurred during dependency installation. Please review    *
echo * the messages above to diagnose and fix the issue.                *
echo **********************************************************************
pause
exit /b 1

:success_exit
pause
exit /b 0
