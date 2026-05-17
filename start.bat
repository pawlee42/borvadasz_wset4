@echo off
cd /d "%~dp0"

echo Cache torlese...
if exist .next rmdir /s /q .next

echo Csomagok telepitese...
call npm install

echo Inditas...
start "" "chrome.exe" "http://localhost:3000"
npm run dev
pause
