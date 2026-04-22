@echo off
echo Regi peldanyok leallitasa...
taskkill /f /im node.exe >nul 2>&1
set PATH=C:\Users\DELL\nodejs\node-v22.14.0-win-x64;%PATH%
cd /d D:\_BORVADASZ\borvadasz_wset4
echo Inditas...
timeout /t 1 >nul
start "" "chrome.exe" "http://localhost:3000"
npm run dev
pause
