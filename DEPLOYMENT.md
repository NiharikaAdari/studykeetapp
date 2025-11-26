# Electron App Deployment Guide

This guide explains how to package and distribute your StudyKeet Electron application as a desktop executable.

## Overview

Your app is configured with **Electron Forge**, which supports building installers for:
- **Windows**: `.exe` installer (Squirrel)
- **macOS**: `.app` bundle + `.zip`
- **Linux**: `.deb` (Debian/Ubuntu) and `.rpm` (Fedora/RedHat)

## Prerequisites

1. **Ensure backend is running** (the app connects to `http://localhost:8000`)
2. **Node.js 16+** installed
3. All dependencies installed: `npm install`

## Quick Start - Build for Your Platform

### Windows
```bash
cd studyKeetApplication
npm run make
```

Output: `out/make/squirrel.windows/x64/StudyKeet-1.0.0 Setup.exe`

### macOS
```bash
cd studyKeetApplication
npm run make
```

Output: `out/make/zip/darwin/x64/StudyKeet-darwin-x64-1.0.0.zip`

### Linux
```bash
cd studyKeetApplication
npm run make
```

Output:
- `out/make/deb/x64/studykeet_1.0.0_amd64.deb`
- `out/make/rpm/x64/studykeet-1.0.0-1.x86_64.rpm`

## Build Commands Explained

### 1. Package Only (No Installer)
```bash
npm run package
```
Creates a portable folder with your app (no installer needed).  
Output: `out/StudyKeet-<platform>-<arch>/`

### 2. Make Installer (Recommended)
```bash
npm run make
```
Creates platform-specific installers.  
Output: `out/make/`

### 3. Publish (Advanced)
```bash
npm run publish
```
Uploads releases to GitHub, S3, etc. (requires publisher configuration)

## Output Structure

After running `npm run make`:
```
studyKeetApplication/
└── out/
    ├── StudyKeet-win32-x64/           # Packaged app (portable)
    │   ├── StudyKeet.exe
    │   └── resources/
    └── make/
        ├── squirrel.windows/
        │   └── x64/
        │       ├── StudyKeet-1.0.0 Setup.exe  ← Install this on Windows
        │       └── RELEASES
        ├── zip/
        │   └── darwin/
        │       └── x64/
        │           └── StudyKeet-darwin-x64-1.0.0.zip  ← macOS
        ├── deb/
        │   └── x64/
        │       └── studykeet_1.0.0_amd64.deb  ← Ubuntu/Debian
        └── rpm/
            └── x64/
                └── studykeet-1.0.0-1.x86_64.rpm  ← Fedora/RedHat
```

## Adding an App Icon

### 1. Create Icons

You need these icon formats:
- **Windows**: `icon.ico` (256x256 or multi-resolution)
- **macOS**: `icon.icns` (512x512)
- **Linux**: `icon.png` (512x512)

### 2. Place Icons

```
studyKeetApplication/
└── assets/
    └── images/
        ├── icon.ico   # Windows
        ├── icon.icns  # macOS
        └── icon.png   # Linux
```

### 3. Update forge.config.js

Already configured! The icon path is set to `./assets/images/icon` (Forge automatically picks the right extension).

### Icon Creation Tools:
- **Online**: https://www.favicon-generator.org/
- **Windows**: IcoFX, GIMP
- **macOS**: Image2icon, IconKit
- **Cross-platform**: Electron Icon Maker

## Distribution Options

### Option 1: Manual Distribution
1. Build: `npm run make`
2. Share the installer file from `out/make/`
3. Users download and run the installer

### Option 2: GitHub Releases
1. Create a GitHub release
2. Upload installers as release assets
3. Users download from GitHub

### Option 3: Auto-Update (Advanced)
Configure `@electron-forge/publisher-github` for automatic updates:

```javascript
// forge.config.js
publishers: [
  {
    name: '@electron-forge/publisher-github',
    config: {
      repository: {
        owner: 'NiharikaAdari',
        name: 'studykeetapp'
      },
      prerelease: false
    }
  }
]
```

Then run:
```bash
npm run publish
```

## Important Considerations

### Backend Dependency
⚠️ **The Electron app requires the backend server to be running!**

**Options:**
1. **Separate Installation** (Current approach)
   - Users install the desktop app
   - Users run backend separately: `start-dev.bat`
   - Simple but requires two steps

2. **Bundle Backend with Electron** (Advanced)
   - Package Python backend inside the Electron app
   - Use `python-shell` or `child_process` to run backend
   - Single executable, more complex setup

3. **Cloud Backend** (Production)
   - Deploy backend to Heroku, AWS, etc.
   - Electron app connects to cloud URL
   - No local backend needed

### Recommended: Cloud Backend for Distribution

For end-user distribution, deploy your FastAPI backend to a cloud service:

```javascript
// Update frontend axios baseURL
// src/components/NoteContext.jsx, FlashcardContext.jsx, etc.
const API_URL = process.env.API_URL || 'https://your-backend.herokuapp.com';
```

## Testing Your Build

### Windows
```bash
cd out/make/squirrel.windows/x64
"StudyKeet-1.0.0 Setup.exe"
```

### macOS
```bash
cd out/make/zip/darwin/x64
unzip StudyKeet-darwin-x64-1.0.0.zip
open StudyKeet.app
```

### Linux (Debian/Ubuntu)
```bash
cd out/make/deb/x64
sudo dpkg -i studykeet_1.0.0_amd64.deb
studykeet
```

## Customization

### Update App Metadata

Edit `studyKeetApplication/package.json`:
```json
{
  "name": "studykeet",
  "productName": "StudyKeet",
  "version": "1.0.0",
  "description": "AI-Powered Study Assistant",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

### Code Signing (Production)

For macOS and Windows code signing (removes security warnings):

**macOS:**
```javascript
// forge.config.js
packagerConfig: {
  osxSign: {
    identity: 'Developer ID Application: Your Name (TEAM_ID)'
  },
  osxNotarize: {
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_PASSWORD,
  }
}
```

**Windows:**
```javascript
// forge.config.js
packagerConfig: {
  certificateFile: './path/to/certificate.pfx',
  certificatePassword: process.env.CERTIFICATE_PASSWORD,
}
```

## Build Script for All Platforms

Create `build-all.bat` (Windows with WSL/Docker):
```bash
@echo off
echo Building for all platforms...

echo [1/3] Building Windows installer...
npm run make -- --platform=win32

echo [2/3] Building macOS installer...
npm run make -- --platform=darwin

echo [3/3] Building Linux installers...
npm run make -- --platform=linux

echo Build complete! Check out/make/ folder
pause
```

## Troubleshooting

### "ENOENT: no such file or directory" during build
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### App won't connect to backend
- Ensure backend is running: `uvicorn main:app --reload`
- Check console logs in the app (View → Toggle Developer Tools)
- Verify API_URL in frontend code

### Icon not showing
- Ensure icon files exist in `assets/images/`
- Rebuild: `npm run make`
- Clear cache: `rm -rf out/ .webpack/`

### Large file size
- Enable `asar: true` in `packagerConfig` (already enabled)
- Remove unused dependencies
- Use `NODE_ENV=production` when building

## Next Steps

1. **Test locally**: `npm run make` → Install and test
2. **Add icon**: Create icons and place in `assets/images/`
3. **Update metadata**: Edit `package.json` with your info
4. **Deploy backend**: Deploy to cloud for production use
5. **Create releases**: Use GitHub Releases or your own distribution

## Resources

- **Electron Forge Docs**: https://www.electronforge.io/
- **Electron Builder** (Alternative): https://www.electron.build/
- **Code Signing Guide**: https://www.electronjs.org/docs/latest/tutorial/code-signing
- **Auto-Update Guide**: https://www.electronforge.io/advanced/auto-update

---

**Ready to build?** Run `npm run make` in the `studyKeetApplication` folder! 🚀
