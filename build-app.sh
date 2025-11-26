#!/bin/bash
# Build StudyKeet Desktop Application

echo "================================"
echo "StudyKeet Build Script"
echo "================================"
echo

cd studyKeetApplication

echo "[1/2] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "[2/2] Building installer..."
npm run make
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo
echo "================================"
echo "Build Complete!"
echo "================================"
echo
echo "Installers created in:"
echo "  studyKeetApplication/out/make/"
echo
echo "Platform-specific installers:"
echo "  - Windows: out/make/squirrel.windows/x64/"
echo "  - macOS: out/make/zip/darwin/x64/"
echo "  - Linux: out/make/deb/x64/ and out/make/rpm/x64/"
echo
