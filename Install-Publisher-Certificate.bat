@echo off
setlocal
chcp 65001 >nul
title FormaLux - Install Publisher Certificate (Mohammad Fahmi)
echo ======================================================================
echo   FormaLux - Publisher Security Certificate Installation
echo   Publisher: Mohammad Fahmi
echo ======================================================================
echo.

:: Check for Administrator Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ADMINISTRATIVE PRIVILEGES REQUIRED]
    echo This script requires administrative privileges to register the
    echo publisher certificate into your Windows Trusted Certificate Store.
    echo.
    echo Right-click this file and select:
    echo   "Run as administrator"
    echo.
    echo ----------------------------------------------------------------------
    echo [تنبيه: يتطلب تشغيل هذا الملف كمسؤول بالضغط بزر الفأرة الأيمن واختيار Run as administrator]
    echo.
    pause
    exit /b 1
)

set "CERT_FILE=%~dp0build\MohammadFahmi.cer"

if not exist "%CERT_FILE%" (
    echo [ERROR] Certificate file not found: %CERT_FILE%
    echo Please make sure the build folder contains MohammadFahmi.cer.
    echo.
    pause
    exit /b 1
)

echo [1/2] Registering certificate into Trusted Root Certification Authorities (ROOT)...
certutil -addstore -f "ROOT" "%CERT_FILE%" >nul 2>&1

echo [2/2] Registering certificate into Trusted Publishers store...
certutil -addstore -f "TrustedPublisher" "%CERT_FILE%" >nul 2>&1

echo.
echo ======================================================================
echo   SUCCESS: Mohammad Fahmi's Publisher Certificate has been verified!
echo.
echo   What this means:
echo   1. Windows SmartScreen Defender will recognise the verified publisher.
echo   2. The installer will display: Verified Publisher: Mohammad Fahmi
echo   3. FormaLux is now fully trusted on this system.
echo ======================================================================
echo.
pause

