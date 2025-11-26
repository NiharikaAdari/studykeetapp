#!/bin/bash
# StudyKeet Development Environment Setup and Startup Script

echo "================================"
echo "StudyKeet Development Environment"
echo "================================"
echo

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo "ERROR: Conda is not installed or not in PATH"
    echo "Please install Anaconda or Miniconda first"
    exit 1
fi

# Activate conda environment
echo "[1/5] Activating conda environment: snakepy311"
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate snakepy311
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate conda environment"
    echo "Please create the environment first: conda create -n snakepy311 python=3.11"
    exit 1
fi

# Install Python dependencies
echo
echo "[2/5] Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "WARNING: Some Python dependencies may have failed to install"
fi

# Start backend server in background
echo
echo "[3/5] Starting FastAPI backend server..."
uvicorn main:app --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to initialize
sleep 3

# Navigate to frontend directory
echo
echo "[4/5] Setting up frontend..."
cd studyKeetApplication

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install npm dependencies"
        kill $BACKEND_PID
        exit 1
    fi
fi

# Start frontend
echo
echo "[5/5] Starting Electron frontend..."
npm start &
FRONTEND_PID=$!

echo
echo "================================"
echo "StudyKeet is running!"
echo "================================"
echo "Backend: http://localhost:8000"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Press Ctrl+C to stop all servers"

# Handle Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for processes
wait
