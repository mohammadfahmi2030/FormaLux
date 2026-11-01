Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Mohamed Fahmi\.gemini\antigravity-ide\brain\3f49f25b-7345-45f6-8bb8-a86dfb4deaef\formalux_app_icon_1792854699295.jpg"
$master = [System.Drawing.Bitmap]::FromFile($srcPath)

function Get-CroppedSquircleIcon {
    param([int]$targetSize = 256)
    
    # We crop the central 864x864 where the squircle is centered
    $cropX = 80
    $cropY = 80
    $cropSize = 864
    
    $dest = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Rounded squircle clipping path
    $radius = $targetSize * 0.22
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pad = $targetSize * 0.02
    $w = $targetSize - (2 * $pad)
    $path.AddArc($pad, $pad, $radius, $radius, 180, 90)
    $path.AddArc($pad + $w - $radius, $pad, $radius, $radius, 270, 90)
    $path.AddArc($pad + $w - $radius, $pad + $w - $radius, $radius, $radius, 0, 90)
    $path.AddArc($pad, $pad + $w - $radius, $radius, $radius, 90, 90)
    $path.CloseFigure()
    
    $g.SetClip($path)
    
    # Draw cropped image scaled into destination
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetSize, $targetSize)
    $g.DrawImage($master, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $g.ResetClip()
    $g.Dispose()
    return $dest
}

# 1. Save assets\icon.png at 512x512
$icon512 = Get-CroppedSquircleIcon -targetSize 512
$icon512.Save("assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created assets\icon.png (512x512)"
$icon512.Dispose()

# 2. Build multi-resolution ICO (256, 128, 64, 48, 32, 16)
$sizes = @(16, 32, 48, 64, 128, 256)
$pngBytesList = @()

foreach ($sz in $sizes) {
    $bmp = Get-CroppedSquircleIcon -targetSize $sz
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytesList += ,$ms.ToArray()
    $ms.Dispose()
    $bmp.Dispose()
}

$icoStream = New-Object System.IO.FileStream("build\icon.ico", [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($icoStream)

# ICONDIR Header
$writer.Write([uint16]0) # Reserved
$writer.Write([uint16]1) # Type 1 = ICO
$writer.Write([uint16]$sizes.Count) # Count

# Entries: Header (6) + entries (16 * count)
$offset = 6 + (16 * $sizes.Count)

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $sz = $sizes[$i]
    $data = $pngBytesList[$i]
    
    $wByte = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
    $hByte = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
    
    $writer.Write($wByte) # Width
    $writer.Write($hByte) # Height
    $writer.Write([byte]0) # ColorCount
    $writer.Write([byte]0) # Reserved
    $writer.Write([uint16]1) # ColorPlanes
    $writer.Write([uint16]32) # BitsPerPixel
    $writer.Write([uint32]$data.Length) # ImageSize
    $writer.Write([uint32]$offset) # ImageOffset
    
    $offset += $data.Length
}

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $writer.Write($pngBytesList[$i])
}

$writer.Close()
$icoStream.Close()
$master.Dispose()
Write-Host "Created build\icon.ico successfully with $($sizes.Count) resolutions!"
