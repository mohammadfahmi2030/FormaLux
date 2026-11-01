Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Mohamed Fahmi\.gemini\antigravity-ide\brain\3f49f25b-7345-45f6-8bb8-a86dfb4deaef\video_converter_icon_1792854835086.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

# Lock bits for fast pixel manipulation
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($src, 0, 0, $w, $h)
$g.Dispose()
$src.Dispose()

$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $bmpData.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bytes, 0, $bytes.Length)

# BFS flood fill from 4 corners for outer black background
$visited = New-Object bool[] ($w * $h)
$queue = New-Object System.Collections.Generic.Queue[int]

function Add-Pixel($x, $y) {
    if ($x -ge 0 -and $x -lt $w -and $y -ge 0 -and $y -lt $h) {
        $idx = $y * $w + $x
        if (-not $visited[$idx]) {
            $visited[$idx] = $true
            $queue.Enqueue($idx)
        }
    }
}

Add-Pixel 0 0
Add-Pixel ($w - 1) 0
Add-Pixel 0 ($h - 1)
Add-Pixel ($w - 1) ($h - 1)

# Flood fill outer background
$threshold = 28
while ($queue.Count -gt 0) {
    $idx = $queue.Dequeue()
    $px = $idx % $w
    $py = [math]::Floor($idx / $w)
    
    $byteIdx = ($py * $stride) + ($px * 4)
    $b = $bytes[$byteIdx]
    $gVal = $bytes[$byteIdx + 1]
    $r = $bytes[$byteIdx + 2]
    
    $maxVal = [math]::Max($r, [math]::Max($gVal, $b))
    
    if ($maxVal -lt $threshold) {
        # Outside background - transparent
        $bytes[$byteIdx + 3] = 0
        
        # Enqueue neighbors
        Add-Pixel ($px + 1) $py
        Add-Pixel ($px - 1) $py
        Add-Pixel $px ($py + 1)
        Add-Pixel $px ($py - 1)
    } elseif ($maxVal -lt ($threshold + 25)) {
        # Smooth edge transition
        $alphaRatio = ($maxVal - $threshold) / 25.0
        $bytes[$byteIdx + 3] = [byte]([math]::Round($alphaRatio * 255))
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $bmpData.Scan0, $bytes.Length)
$bmp.UnlockBits($bmpData)

# Save high-res master transparent PNG
$bmp.Save("assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created transparent assets\icon.png"

# Now build multi-resolution Windows ICO (256, 128, 64, 48, 32, 16)
$sizes = @(16, 32, 48, 64, 128, 256)
$pngBytesList = @()

foreach ($sz in $sizes) {
    $scaled = New-Object System.Drawing.Bitmap($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $sg = [System.Drawing.Graphics]::FromImage($scaled)
    $sg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $sg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $sg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $sg.Clear([System.Drawing.Color]::Transparent)
    $sg.DrawImage($bmp, 0, 0, $sz, $sz)
    $sg.Dispose()
    
    $ms = New-Object System.IO.MemoryStream
    $scaled.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytesList += ,$ms.ToArray()
    $ms.Dispose()
    $scaled.Dispose()
}

$icoStream = New-Object System.IO.FileStream("build\icon.ico", [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($icoStream)

$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$sizes.Count)

$offset = 6 + (16 * $sizes.Count)

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $sz = $sizes[$i]
    $data = $pngBytesList[$i]
    $wByte = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
    $hByte = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
    
    $writer.Write($wByte)
    $writer.Write($hByte)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]32)
    $writer.Write([uint32]$data.Length)
    $writer.Write([uint32]$offset)
    
    $offset += $data.Length
}

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $writer.Write($pngBytesList[$i])
}

$writer.Close()
$icoStream.Close()
$bmp.Dispose()
Write-Host "Created build\icon.ico successfully with transparent background!"
