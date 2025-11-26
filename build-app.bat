@echo off
REM Build StudyKeet Desktop Application

echo ================================
echo StudyKeet Build Script
echo ================================
echo.

cd studyKeetApplication

echo [1/2] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/2] Building installer...
call npm run make
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ================================
echo Build Complete!
echo ================================
echo.
echo Installers created in:
echo   studyKeetApplication\out\make\
echo.
echo Windows: out\make\squirrel.windows\x64\StudyKeet-1.0.0 Setup.exe
echo.
pause
