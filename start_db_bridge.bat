@echo off
echo Checking for Python dependencies...

REM تحديث pip أولاً
python -m pip install --upgrade pip

REM تثبيت المكتبات الأساسية أولاً
pip install flask flask-cors python-dotenv

REM محاولة تثبيت pyodbc
echo Installing pyodbc...
pip install --no-cache-dir pyodbc

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo Error: Failed to install pyodbc
    echo.
    echo You need to install Microsoft Visual C++ Build Tools
    echo Please download and install from:
    echo https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo.
    echo After installation, run this script again
    echo ============================================
    pause
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo Starting Python DB bridge...
python src/scripts/db_bridge.py
