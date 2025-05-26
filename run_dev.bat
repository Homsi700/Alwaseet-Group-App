@echo off
echo Starting Alwaseet Group App Development Server...

REM Check if node_modules exists
if not exist node_modules\ (
    echo Installing dependencies...
    call npm install
)

REM Start the development server
echo Starting development server...
start "" http://localhost:9002
npm run dev
