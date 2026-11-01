@echo off
echo ========================================
echo   FormaLux - Building Windows EXE
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%~dp0node_modules\.bin\node.exe" (
        set "PATH=%~dp0node_modules\.bin;%PATH%"
    ) else if exist "C:\nvm4w\nodejs\node.exe" (
        set "PATH=C:\nvm4w\nodejs;%PATH%"
    ) else (
        echo [ERROR] Node.js is not installed!
        echo Please install Node.js from https://nodejs.org
        pause
        exit /b 1
    )
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo [1/3] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

:: Generate icons if needed
if not exist "build\icon.ico" (
    echo [INFO] Generating application icons...
    powershell.exe -ExecutionPolicy Bypass -File .\create-icons.ps1
)

:: Populate bin directory if needed
if not exist "bin\ffmpeg.exe" (
    echo [INFO] Populating bin directory from packages...
    powershell.exe -ExecutionPolicy Bypass -Command "New-Item -ItemType Directory -Force -Path 'bin' | Out-Null; if (Test-Path 'node_modules\ffmpeg-static\ffmpeg.exe') { Copy-Item 'node_modules\ffmpeg-static\ffmpeg.exe' -Destination 'bin\ffmpeg.exe' -Force }; if (Test-Path 'node_modules\ffprobe-static\bin\win32\x64\ffprobe.exe') { Copy-Item 'node_modules\ffprobe-static\bin\win32\x64\ffprobe.exe' -Destination 'bin\ffprobe.exe' -Force }"
)

:: Ensure code signing certificate exists
if not exist "build\MohammadFahmi.pfx" (
    echo [INFO] Generating code signing certificate for Mohammad Fahmi...
    powershell.exe -ExecutionPolicy Bypass -File .\build\generate-cert.ps1
)

:: Build
echo.
echo [2/3] Building EXE with electron-builder...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Complete!
echo   Output: dist\FormaLux Setup*.exe
echo ========================================
echo.
pause
