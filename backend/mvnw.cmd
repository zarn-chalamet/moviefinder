@echo off
:: Maven Wrapper for Windows

:: Try to find Maven in PATH
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

:: Maven not found
echo Maven not found. Please install Maven:
echo.
echo   Windows: choco install maven
echo   Or download from: https://maven.apache.org/download.cgi
echo.
echo After installing, restart your terminal and try again.
exit /b 1
