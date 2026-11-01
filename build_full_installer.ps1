# ==============================================================================
# FormaLux - Full Custom Suite Installer Builder
# Creates the self-extracting luxury installer (FormaLux-Setup.exe ~540-650 MB)
# with the custom Electron installer window, feature carousel, Maintenance UI,
# and native GUI Uninstaller.
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  FormaLux - Building Full Custom Setup & Uninstaller" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Ensure Node.js is in PATH
if (Test-Path "C:\nvm4w\nodejs\node.exe") {
    $env:PATH = "C:\nvm4w\nodejs;$env:PATH"
}

# 2. Build main win-unpacked app build
Write-Host "[1/5] Building main FormaLux application (win-unpacked)..." -ForegroundColor Yellow
& npx electron-builder --win --dir


# 3. Create payload.tar.gz from dist\win-unpacked
Write-Host "[2/5] Creating application payload archive (payload.tar.gz)..." -ForegroundColor Yellow
$payloadTar = Join-Path $PSScriptRoot "installer\payload.tar.gz"
$tarExe = "C:\Windows\System32\tar.exe"
& $tarExe -czf $payloadTar -C (Join-Path $PSScriptRoot "dist") win-unpacked
Write-Host "      Payload size: $([math]::Round((Get-Item $payloadTar).Length / 1MB, 2)) MB" -ForegroundColor Gray

# 4. Build custom installer Electron runtime
Write-Host "[3/5] Packaging custom GUI installer runtime..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "installer")
try {
    & npx electron-builder --win --dir
} finally {
    Pop-Location
}

# 5. Bundle installer into zip
Write-Host "[4/5] Zipping installer directory..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
$unpackedInstallerDir = Join-Path $PSScriptRoot "dist\setup-installer\win-unpacked"
$tempZip = Join-Path $PSScriptRoot "installer_bundle.zip"
if (Test-Path $tempZip) { Remove-Item $tempZip -Force }

[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $unpackedInstallerDir,
    $tempZip,
    [System.IO.Compression.CompressionLevel]::Fastest,
    $false
)

# 6. Assemble FormaLux-Setup.exe
Write-Host "[5/5] Assembling self-extracting FormaLux-Setup.exe..." -ForegroundColor Yellow
$baseExe = Join-Path $PSScriptRoot "installer\FormaLuxSetupBase.exe"
$markerBin = Join-Path $PSScriptRoot "installer\marker.bin"
$finalSetup = Join-Path $PSScriptRoot "dist\FormaLux-Setup.exe"

# Sign base if certificate is present
$certPath = Join-Path $PSScriptRoot "build\MohammadFahmi.pfx"
if (Test-Path $certPath) {
    try {
        $secPass = ConvertTo-SecureString "FormaLux2026" -AsPlainText -Force
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath, $secPass)
        Set-AuthenticodeSignature -FilePath $baseExe -Certificate $cert | Out-Null
    } catch {
        Write-Warning "Could not sign base executable: $_"
    }
}

$baseBytes = [System.IO.File]::ReadAllBytes($baseExe)
$markerBytes = [System.IO.File]::ReadAllBytes($markerBin)

$outStream = [System.IO.File]::Create($finalSetup)
$outStream.Write($baseBytes, 0, $baseBytes.Length)
$outStream.Write($markerBytes, 0, $markerBytes.Length)

$zipStream = [System.IO.File]::OpenRead($tempZip)
$zipStream.CopyTo($outStream)
$zipStream.Close()
$outStream.Close()

# Clean up temporary zip
Remove-Item $tempZip -Force -ErrorAction SilentlyContinue

$finalSizeMb = [math]::Round((Get-Item $finalSetup).Length / 1MB, 2)
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  Build Complete Successfully!" -ForegroundColor Green
Write-Host "  File: dist\FormaLux-Setup.exe ($finalSizeMb MB)" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
