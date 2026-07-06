@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem ============================================================
rem  Baota Windows - full redeploy (stop -> build -> pm2 -> verify)
rem  Run in PowerShell OR Cmd after fixing PATH (see DEPLOY.md).
rem
rem  Usage:
rem    cd /d C:\wwwroot\49.232.129.88
rem    deploy\baota-windows\redeploy.bat
rem ============================================================

set "APP_DIR=C:\wwwroot\49.232.129.88"
set "NODE_HOME=C:\BtSoft\nodejs\v20.20.2"
set "GIT=C:\Program Files\Git\bin\git.exe"
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;%NODE_HOME%;C:\BtSoft\pm2;%PATH%"

cd /d "%APP_DIR%" || (
  echo [ERROR] APP_DIR not found: %APP_DIR%
  exit /b 1
)

echo.
echo ===== ai-iep-platform redeploy =====
echo APP_DIR=%APP_DIR%
echo.

if not exist ".env.production" (
  echo [ERROR] Missing .env.production
  echo Copy deploy\tencent-cloud\env.production.example to .env.production and fill values.
  exit /b 1
)

echo [1/8] Stop web services and Node processes...
if exist "C:\BtSoft\nginx\nginx.exe" (
  C:\BtSoft\nginx\nginx.exe -s stop 2>nul
)
taskkill /F /IM node.exe 2>nul
taskkill /F /IM w3wp.exe 2>nul
call pm2 delete all 2>nul
call pm2 kill 2>nul
if exist "C:\BtSoft\pm2\.pm2\dump.pm2" del /f /q "C:\BtSoft\pm2\.pm2\dump.pm2"
timeout /t 3 /nobreak >nul

echo [2/8] Pull latest code...
if exist "%GIT%" (
  "%GIT%" pull origin main
  "%GIT%" log -1 --oneline
) else (
  echo [WARN] Git not found, skip pull
)

echo [3/8] Remove old build...
set "STAMP=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "STAMP=!STAMP: =0!"
if exist ".next" (
  ren ".next" ".next.bak.!STAMP!" 2>nul
  if exist ".next" (
    echo [WARN] Could not rename .next - trying build in place...
    echo        If build fails with EBUSY, restart the server once and run this script again.
  ) else (
    echo Renamed .next to .next.bak.!STAMP!
  )
)

echo [4/8] npm run build (2-5 min)...
call npm run build
if errorlevel 1 (
  echo [ERROR] npm run build failed
  exit /b 1
)

echo [5/8] Prepare standalone bundle...
if not exist ".next\standalone\server.js" (
  echo [ERROR] Missing .next\standalone\server.js after build
  exit /b 1
)
xcopy /E /I /Y /Q public ".next\standalone\public" >nul
if not exist ".next\standalone\.next" mkdir ".next\standalone\.next"
xcopy /E /I /Y /Q ".next\static" ".next\standalone\.next\static" >nul
copy /Y ".env.production" ".next\standalone\.env.production" >nul

echo [6/8] Start PM2 (fork mode, server.js)...
cd /d "%APP_DIR%\.next\standalone"
call pm2 start server.js --name ai-iep-platform
call pm2 save
cd /d "%APP_DIR%"

echo [7/8] Restart Nginx if present...
if exist "C:\BtSoft\nginx\nginx.exe" (
  C:\BtSoft\nginx\nginx.exe 2>nul
)

echo [8/8] Verify login page...
powershell -NoProfile -ExecutionPolicy Bypass -File "%APP_DIR%\deploy\baota-windows\check-login.ps1"

echo.
echo ===== Done =====
echo Open in browser: http://49.232.129.88/auth/login
echo Expect: phone number + password/SMS tabs (NOT you@example.com)
echo.
echo If check-login shows OLD: restart server, run this script again.
echo Remember to START the website in Baota panel if you stopped it manually.
endlocal
