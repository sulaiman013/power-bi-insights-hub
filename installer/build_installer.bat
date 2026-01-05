@echo off
echo ============================================================
echo   Power BI Insights Hub - Installer Builder
echo ============================================================
echo.

:: Check for Inno Setup
set "INNO_PATH="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set "INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
) else if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    set "INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"
) else (
    echo ERROR: Inno Setup 6 not found!
    echo.
    echo Please download and install Inno Setup from:
    echo https://jrsoftware.org/isdl.php
    echo.
    pause
    exit /b 1
)

echo Using Inno Setup: %INNO_PATH%
echo.

:: Check if build files exist
if not exist "..\dist\PowerBI_Insights_Hub\PowerBI_Expert_Server.exe" (
    echo ERROR: Build files not found!
    echo.
    echo Please run build.bat first to create the distribution files.
    echo.
    pause
    exit /b 1
)

:: Build installer
echo Building installer...
"%INNO_PATH%" setup.iss

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   INSTALLER CREATED SUCCESSFULLY!
    echo ============================================================
    echo.
    echo Output: ..\dist\PowerBI_Insights_Hub_Setup_1.0.0.exe
    echo.
) else (
    echo.
    echo ERROR: Installer build failed!
    echo.
)

pause
