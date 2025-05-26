@echo off
echo Starting Next.js development server...
start "Al Wasit Accounting - Dev Server" cmd /k "npm run dev"

echo.
echo Waiting a few seconds for the server to initialize (approx. 8 seconds)...
timeout /t 8 /nobreak > nul

echo Opening application in your default browser at http://localhost:9002
start http://localhost:9002
echo.
echo The development server is running in a new window.
echo If the browser opened before the server was ready, please refresh the page.
