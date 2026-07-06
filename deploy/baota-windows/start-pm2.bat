@echo off
setlocal EnableExtensions

rem Baota Windows: start Next.js standalone in PM2 fork mode (not cluster).
rem Run from repo root: deploy\baota-windows\start-pm2.bat

set "NODE_HOME=C:\BtSoft\nodejs\v20.20.2"
set "PATH=%NODE_HOME%;%PATH%"

set "APP_DIR=%~dp0..\.."
for %%I in ("%APP_DIR%") do set "APP_DIR=%%~fI"

cd /d "%APP_DIR%"
if not exist ".next\standalone\server.js" (
  echo Missing .next\standalone\server.js - run npm run build first.
  exit /b 1
)
if not exist ".env.production" (
  echo Missing .env.production in %APP_DIR%
  exit /b 1
)

echo APP_DIR=%APP_DIR%
echo PM2 path:
where pm2

echo.
echo Stopping PM2 and clearing saved process list...
call pm2 delete ai-iep-platform 2>nul
call pm2 kill 2>nul
if exist "C:\BtSoft\pm2\.pm2\dump.pm2" del /f /q "C:\BtSoft\pm2\.pm2\dump.pm2"

echo.
echo Starting server.js in fork mode (no -i flag)...
set "APP_DIR=%APP_DIR%"
call pm2 start deploy\tencent-cloud\ecosystem.config.cjs
call pm2 save
call pm2 status

echo.
echo Test: curl http://127.0.0.1:3000/auth/login
endlocal
