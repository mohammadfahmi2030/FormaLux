Add-Type -AssemblyName System.Drawing

function Create-AppIcon {
    param([int]$size = 256)
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = $size / 256.0
    
    # Background rounded rect (squircle)
    $pad = 12 * $scale
    $w = $size - (2 * $pad)
    $radius = 48 * $scale
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($pad, $pad, $radius, $radius, 180, 90)
    $path.AddArc($pad + $w - $radius, $pad, $radius, $radius, 270, 90)
    $path.AddArc($pad + $w - $radius, $pad + $w - $radius, $radius, $radius, 0, 90)
    $path.AddArc($pad, $pad + $w - $radius, $radius, $radius, 90, 90)
    $path.CloseFigure()

    # Dark background fill
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 15, 42))
    $g.FillPath($bgBrush, $path)

    # Gradient border
    $rect = New-Object System.Drawing.RectangleF($pad, $pad, $w, $w)
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 99, 102, 241),
        [System.Drawing.Color]::FromArgb(255, 6, 182, 212),
        45.0
    )
    $pen = New-Object System.Drawing.Pen($gradBrush, (6 * $scale))
    $g.DrawPath($pen, $path)

    # Conversion Arrows (Circle of arrows)
    $cx = $size / 2.0
    $cy = $size / 2.0
    $r = 58 * $scale
    $arcPen = New-Object System.Drawing.Pen($gradBrush, (14 * $scale))
    $arcPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arcPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Top-right arc
    $g.DrawArc($arcPen, ($cx - $r), ($cy - $r), (2 * $r), (2 * $r), -30, 110)
    # Bottom-left arc
    $g.DrawArc($arcPen, ($cx - $r), ($cy - $r), (2 * $r), (2 * $r), 150, 110)

    # Arrow head 1
    $arrowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
    $arrowPath1 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p1 = New-Object System.Drawing.PointF(($cx + $r * 0.8), ($cy + $r * 0.4))
    $p2 = New-Object System.Drawing.PointF(($cx + $r * 1.15), ($cy + $r * 0.95))
    $p3 = New-Object System.Drawing.PointF(($cx + $r * 0.5), ($cy + $r * 0.85))
    $arrowPath1.AddPolygon([System.Drawing.PointF[]]@($p1, $p2, $p3))
    $g.FillPath($arrowBrush, $arrowPath1)

    # Arrow head 2
    $arrowBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 99, 102, 241))
    $arrowPath2 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $q1 = New-Object System.Drawing.PointF(($cx - $r * 0.8), ($cy - $r * 0.4))
    $q2 = New-Object System.Drawing.PointF(($cx - $r * 1.15), ($cy - $r * 0.95))
    $q3 = New-Object System.Drawing.PointF(($cx - $r * 0.5), ($cy - $r * 0.85))
    $arrowPath2.AddPolygon([System.Drawing.PointF[]]@($q1, $q2, $q3))
    $g.FillPath($arrowBrush2, $arrowPath2)

    # Center glowing badge (diamond / play)
    $centerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 232, 232, 240))
    $badgePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $badgeW = 16 * $scale
    $badgePath.AddPolygon([System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF($cx, ($cy - $badgeW))),
        (New-Object System.Drawing.PointF(($cx + $badgeW), $cy)),
        (New-Object System.Drawing.PointF($cx, ($cy + $badgeW))),
        (New-Object System.Drawing.PointF(($cx - $badgeW), $cy))
    ))
    $g.FillPath($centerBrush, $badgePath)

    $g.Dispose()
    return $bmp
}

# Create assets and build dirs
New-Item -ItemType Directory -Force -Path "assets" | Out-Null
New-Item -ItemType Directory -Force -Path "build" | Out-Null

# Save PNG
$bmp256 = Create-AppIcon -size 256
$bmp256.Save("assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created assets\icon.png"

# Create proper multi-resolution ICO file
$sizes = @(16, 32, 48, 64, 128, 256)
$pngBytesList = @()

foreach ($sz in $sizes) {
    $b = Create-AppIcon -size $sz
    $ms = New-Object System.IO.MemoryStream
    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytesList += ,$ms.ToArray()
    $ms.Dispose()
    $b.Dispose()
}

$icoStream = New-Object System.IO.FileStream("build\icon.ico", [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($icoStream)

# ICONDIR
$writer.Write([uint16]0) # Reserved
$writer.Write([uint16]1) # Type 1 = ICO
$writer.Write([uint16]$sizes.Count) # Image count

# Calculate offsets
# Header = 6 bytes. Each entry = 16 bytes.
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
$bmp256.Dispose()
Write-Host "Created build\icon.ico with $($sizes.Count) resolutions"
