@echo off
REM Legacy launcher. Prefer the top-level run.bat (it has fallbacks and arg-passing).
title Test Data Generator
setlocal
cd /d "%~dp0"

where py >nul 2>nul && ( py -3 server.py %* & goto :end )
where python >nul 2>nul && ( python server.py %* & goto :end )
where python3 >nul 2>nul && ( python3 server.py %* & goto :end )

echo Python 3.7+ is required. Install from https://www.python.org/downloads/
pause
exit /b 1

:end
endlocal
