@echo off
echo Starting Alwaseet Group App Development Server...

REM Check if Python dependencies are installed
python -m pip install -r requirements.txt

REM Start the Python DB bridge
echo Starting Python DB bridge...
start cmd /k "python src/scripts/db_bridge.py"

REM Wait for DB bridge to start
echo Waiting for DB bridge to start...
timeout /t 5

REM Check if node_modules exists
if not exist node_modules\ (
    echo Installing Node.js dependencies...
    call npm install
)

REM Start the development server
echo Starting Next.js development server...
start "" http://localhost:9002
npm run dev
