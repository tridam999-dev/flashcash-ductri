@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  start "" http://localhost:8080
  py -m http.server 8080
  exit /b
)
where python >nul 2>&1
if %errorlevel%==0 (
  start "" http://localhost:8080
  python -m http.server 8080
  exit /b
)
echo Khong tim thay Python. Ban van co the mo truc tiep file index.html.
pause
