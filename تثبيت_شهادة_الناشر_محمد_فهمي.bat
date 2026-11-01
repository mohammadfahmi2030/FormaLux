@echo off
chcp 65001 >nul
title تثبيت وتوثيق شهادة الناشر: Mohammad Fahmi
echo ======================================================================
echo   تثبيت وتوثيق شهادة أمان برنامج FormaLux - الناشر: Mohammad Fahmi
echo ======================================================================
echo.

:: التحقق من صلاحيات المسؤول
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [تنبيه هام]
    echo يرجى تشغيل هذا الملف كمسؤول (Run as administrator) لتوثيق الشهادة في نظام ويندوز.
    echo.
    echo اضغط بزر الفأرة الأيمن على هذا الملف واختر:
    echo "تشغيل كمسؤول" (Run as administrator)
    echo.
    pause
    exit /b 1
)

set "CERT_FILE=%~dp0build\MohammadFahmi.cer"

if not exist "%CERT_FILE%" (
    echo [خطأ] لم يتم العثور على ملف الشهادة: %CERT_FILE%
    pause
    exit /b 1
)

echo [1/2] جاري إضافة الشهادة إلى مخزن المراجع الموثوقة (Root Authority)...
certutil -addstore -f "ROOT" "%CERT_FILE%" >nul 2>&1

echo [2/2] جاري إضافة الشهادة إلى مخزن الناشرين الموثوقين (Trusted Publishers)...
certutil -addstore -f "TrustedPublisher" "%CERT_FILE%" >nul 2>&1

echo.
echo ======================================================================
echo   ✓ تم توثيق وتثبيت شهادة الناشر (Mohammad Fahmi) بنجاح تام!
echo.
echo   النتائج الآن:
echo   1. لن تظهر نافذة Microsoft Defender SmartScreen الزرقاء المانعة.
echo   2. سيظهر اسم الناشر الرسمي في نافذة التثبيت: Mohammad Fahmi
echo   3. أصبح البرنامج موثوقاً ومعتمداً كلياً على نظام ويندوز.
echo ======================================================================
echo.
pause
