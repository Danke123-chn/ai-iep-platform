# Baota Windows - full redeploy wrapper (use when Cmd PATH is broken)
$ErrorActionPreference = "Stop"
$AppDir = "C:\wwwroot\49.232.129.88"
Set-Location $AppDir
& "$AppDir\deploy\baota-windows\redeploy.bat"
