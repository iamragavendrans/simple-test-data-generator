@echo off
REM Launcher for Windows. Forwards any args to app\server.py.
REM   run.bat
REM   run.bat --port 9000

setlocal
cd /d "%~dp0"

REM Prefer the py launcher (ships with python.org installer)
where py >nul 2>nul
if %ERRORLEVEL% == 0 (
  py -3 app\server.py %*
  goto :end
)

where python >nul 2>nul
if %ERRORLEVEL% == 0 (
  python app\server.py %*
  goto :end
)

where python3 >nul 2>nul
if %ERRORLEVEL% == 0 (
  python3 app\server.py %*
  goto :end
)

echo Python 3.7+ is required but was not found on PATH.
echo Install it from https://www.python.org/downloads/
echo Make sure "Add python.exe to PATH" is checked during install.
pause
exit /b 1

:end
endlocal
