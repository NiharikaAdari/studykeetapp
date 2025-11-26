@echo off
REM StudyKeet Development Environment Setup and Startup Script

echo ================================
echo StudyKeet Development Environment
echo ================================
echo.

REM Check if conda is available
where conda >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Conda is not installed or not in PATH
    echo Please install Anaconda or Miniconda first
    pause
    exit /b 1
)

REM Activate conda environment
echo [1/5] Activating conda environment: snakepy311
call conda activate snakepy311
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate conda environment
    echo Please create the environment first: conda create -n snakepy311 python=3.11
    pause
    exit /b 1
)

REM Install Python dependencies
echo.
echo [2/5] Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Some Python dependencies may have failed to install
)

REM Start backend server
echo.
echo [3/5] Starting FastAPI backend server...
start "StudyKeet Backend" cmd /k "conda activate snakepy311 && uvicorn main:app --reload"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Navigate to frontend directory
echo.
echo [4/5] Setting up frontend...
cd studyKeetApplication

REM Install npm dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install npm dependencies
        pause
        exit /b 1
    )
)

REM Start frontend
echo.
echo [5/5] Starting Electron frontend...
start "StudyKeet Frontend" cmd /k "npm start"

echo.
echo ================================
echo StudyKeet is starting!
echo ================================
echo Backend: http://localhost:8000
echo Frontend: Electron app will launch shortly
echo.
echo Press any key to close this window (servers will continue running)
pause >nul
