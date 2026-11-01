$electronNode = Join-Path $PSScriptRoot "node_modules\electron\dist\electron.exe"
$cli = Join-Path $PSScriptRoot "node_modules\electron-builder\cli.js"
$certPath = Join-Path $PSScriptRoot "build\MohammadFahmi.pfx"
if (-not (Test-Path $certPath)) {
    Write-Host "Generating code signing certificate for Mohammad Fahmi..."
    & powershell.exe -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "build\generate-cert.ps1")
}

if (Test-Path $electronNode) {
    Write-Host "Building signed FormaLux Setup.exe using bundled Electron Node runtime..."
    $env:ELECTRON_RUN_AS_NODE = "1"
    & $electronNode $cli --win --x64
} else {
    $nodePath = "C:\nvm4w\nodejs\node.exe"
    if (-not (Test-Path $nodePath)) {
        $cmd = Get-Command node -ErrorAction SilentlyContinue
        if ($cmd) { $nodePath = $cmd.Source }
    }
    Write-Host "Building FormaLux Setup.exe using Node: $nodePath..."
    & $nodePath $cli --win --x64
}

Write-Host "Build finished with exit code: $LASTEXITCODE"
