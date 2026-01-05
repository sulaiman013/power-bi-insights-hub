@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   Power BI Insights Hub - Build Script
echo ============================================================
echo.

:: Check for required tools
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js/npm is not installed or not in PATH
    exit /b 1
)

:: Create dist directory
if not exist "dist" mkdir dist
if not exist "dist\PowerBI_Insights_Hub" mkdir "dist\PowerBI_Insights_Hub"

echo.
echo [1/4] Building Frontend...
echo ============================================================
cd frontend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    cd ..
    exit /b 1
)
cd ..

:: Copy frontend build to dist
echo Copying frontend build...
xcopy /E /I /Y "frontend\dist" "dist\PowerBI_Insights_Hub\frontend"

echo.
echo [2/4] Installing Backend Dependencies...
echo ============================================================
cd backend
pip install pyinstaller
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Backend dependencies installation failed
    cd ..
    exit /b 1
)

echo.
echo [3/4] Building Backend Executable...
echo ============================================================
pyinstaller --clean powerbi_expert.spec
if %errorlevel% neq 0 (
    echo ERROR: PyInstaller build failed
    cd ..
    exit /b 1
)
cd ..

:: Copy backend executable to dist
echo Copying backend executable...
copy /Y "backend\dist\PowerBI_Expert_Server.exe" "dist\PowerBI_Insights_Hub\"

:: Copy additional files
echo Copying additional files...
copy /Y "README.md" "dist\PowerBI_Insights_Hub\"
copy /Y "backend\LICENSE" "dist\PowerBI_Insights_Hub\"

echo.
echo [4/4] Creating Launcher...
echo ============================================================

:: Create launcher batch file
(
echo @echo off
echo echo ============================================================
echo echo   Power BI Insights Hub
echo echo   AI-Powered Power BI Assistant
echo echo ============================================================
echo echo.
echo echo Starting server...
echo echo.
echo echo Frontend: http://localhost:5173
echo echo Backend:  http://localhost:5050
echo echo.
echo echo Press Ctrl+C to stop
echo echo ============================================================
echo.
echo start "" "frontend\index.html"
echo PowerBI_Expert_Server.exe
) > "dist\PowerBI_Insights_Hub\Start_PowerBI_Expert.bat"

echo.
echo ============================================================
echo   BUILD COMPLETE!
echo ============================================================
echo.
echo Output: dist\PowerBI_Insights_Hub\
echo.
echo Contents:
echo   - PowerBI_Expert_Server.exe (Backend)
echo   - frontend\ (Web UI)
echo   - Start_PowerBI_Expert.bat (Launcher)
echo   - README.md
echo   - LICENSE
echo.
echo Next steps:
echo   1. Run installer\build_installer.bat to create .exe installer
echo   2. Or distribute the dist\PowerBI_Insights_Hub folder as-is
echo.

endlocal
