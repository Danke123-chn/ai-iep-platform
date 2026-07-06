# Run once on server (PowerShell as Administrator not required).
# Creates redeploy.ps1 when git pull / GitHub is unavailable.

$AppDir = "C:\wwwroot\49.232.129.88"
$DeployDir = Join-Path $AppDir "deploy\baota-windows"
New-Item -ItemType Directory -Force -Path $DeployDir | Out-Null

@'
@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "APP_DIR=C:\wwwroot\49.232.129.88"
set "NODE_HOME=C:\BtSoft\nodejs\v20.20.2"
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;%NODE_HOME%;C:\BtSoft\pm2;%PATH%"
cd /d "%APP_DIR%" || exit /b 1
if not exist ".env.production" ( echo Missing .env.production & exit /b 1 )
echo [1/7] Stop processes...
if exist "C:\BtSoft\nginx\nginx.exe" C:\BtSoft\nginx\nginx.exe -s stop 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM w3wp.exe 2>nul
call pm2 delete all 2>nul
call pm2 kill 2>nul
timeout /t 3 /nobreak >nul
echo [2/7] Backup old build...
set "STAMP=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%_%TIME:~0,2%%TIME:~3,2%"
set "STAMP=!STAMP: =0!"
if exist ".next" ren ".next" ".next.bak.!STAMP!" 2>nul
echo [3/7] npm run build...
call npm run build || exit /b 1
echo [4/7] Copy standalone assets...
xcopy /E /I /Y /Q public ".next\standalone\public" >nul
if not exist ".next\standalone\.next" mkdir ".next\standalone\.next"
xcopy /E /I /Y /Q ".next\static" ".next\standalone\.next\static" >nul
copy /Y ".env.production" ".next\standalone\.env.production" >nul
echo [5/7] Start PM2...
cd /d "%APP_DIR%\.next\standalone"
call pm2 start server.js --name ai-iep-platform
call pm2 save
cd /d "%APP_DIR%"
if exist "C:\BtSoft\nginx\nginx.exe" C:\BtSoft\nginx\nginx.exe 2>nul
echo [6/7] Verify...
powershell -NoProfile -ExecutionPolicy Bypass -File "%APP_DIR%\deploy\baota-windows\check-login.ps1"
echo Done. Open http://49.232.129.88/auth/login
endlocal
'@ | Set-Content -Path (Join-Path $DeployDir "redeploy.bat") -Encoding ASCII

@'
param([string[]]$Urls = @("http://127.0.0.1:3000/auth/login","http://127.0.0.1/auth/login"))
foreach ($Url in $Urls) {
  Write-Host "`nURL: $Url"
  try { $html = (Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 15).Content }
  catch { Write-Host "  ERROR: $($_.Exception.Message)"; continue }
  $new = $html.Contains("signInWithPhonePassword") -or $html.Contains("verifyPhoneLoginCode")
  $old = $html.Contains("you@example.com") -and $html.Contains('type="email"')
  if ($new -and -not $old) { Write-Host "  RESULT: NEW phone login" }
  elseif ($old) { Write-Host "  RESULT: OLD email login - rebuild failed" }
  else { Write-Host "  RESULT: UNKNOWN" }
  Write-Host "  new_marker: $new  old_marker: $old"
}
'@ | Set-Content -Path (Join-Path $DeployDir "check-login.ps1") -Encoding UTF8

Write-Host "Created:"
Write-Host "  $DeployDir\redeploy.bat"
Write-Host "  $DeployDir\check-login.ps1"
Write-Host ""
Write-Host "Next: Baota -> stop website + stop nginx -> run redeploy.bat"
