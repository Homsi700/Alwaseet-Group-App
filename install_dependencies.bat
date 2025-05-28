@echo off
echo Installing Alwaseet Group App Dependencies...
echo This script will install Node.js and Python dependencies.
echo.

REM Check for Node.js and npm
echo Checking for Node.js and npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm (Node.js) is not found. Please install Node.js (LTS version recommended)
    echo and ensure it's added to your system's PATH.
    echo Download Node.js from: https://nodejs.org/
    pause
    goto :eof
)
echo npm found.
echo.

REM Check for Python
echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: python is not found. Please install Python (e.g., 3.11 or 3.12)
    echo and ensure it's added to your system's PATH.
    echo Download Python from: https://www.python.org/downloads/
    pause
    goto :eof
)
echo Python found.
echo.

echo Installing Node.js dependencies using npm install...
npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Please check the error messages above.
    pause
    goto :eof
)
echo Node.js dependencies installed successfully.
echo.

REM Python virtual environment setup
set VENV_DIR=.venv
echo Checking for Python virtual environment in "%VENV_DIR%"...
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo Python virtual environment not found. Creating one...
    python -m venv %VENV_DIR%
    if errorlevel 1 (
        echo ERROR: Failed to create Python virtual environment.
        echo Please ensure Python is installed correctly and 'venv' module is available.
        pause
        goto :eof
    )
    echo Python virtual environment created successfully in "%VENV_DIR%".
) else (
    echo Python virtual environment found in "%VENV_DIR%".
)
echo.

echo Activating Python virtual environment and installing Python dependencies from requirements.txt...
call "%VENV_DIR%\Scripts\activate.bat"

echo Installing Python packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo --------------------------------------------------------------------
    echo ERROR: 'pip install -r requirements.txt' failed.
    echo This often happens if pyodbc (SQL Server driver for Python) fails to build.
    echo.
    echo To fix pyodbc build issues, please ensure:
    echo 1. You have "Microsoft C++ Build Tools" installed.
    echo    Get them from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo    During installation, select the "Desktop development with C++" workload.
    echo 2. You have the "Microsoft ODBC Driver for SQL Server" installed on your system.
    echo    Search for "ODBC Driver for SQL Server" on Microsoft's website.
    echo.
    echo If pyodbc still fails with Python 3.13, consider:
    echo   - Using Python 3.11 or 3.12, which generally have better pre-compiled support for pyodbc.
    echo   - Manually finding and installing a pre-compiled .whl file for pyodbc
    echo     that matches your Python version (cp313) and Windows architecture (win_amd64).
    echo --------------------------------------------------------------------
    deactivate
    pause
    goto :eof
)
echo Python dependencies installed successfully.
echo.

deactivate
echo.
echo ====================================================================
echo All dependencies installed successfully!
echo You can now run the project using the 'run_project.bat' script.
echo ====================================================================
echo.
pause
