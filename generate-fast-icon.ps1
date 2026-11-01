$csharp = @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class FastIconMaker {
    public static void Process(string srcPath, string outPngPath, string outIcoPath) {
        using (Bitmap src = new Bitmap(srcPath)) {
            int w = src.Width;
            int h = src.Height;
            Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(dest)) {
                g.DrawImage(src, 0, 0, w, h);
            }
            
            BitmapData bd = dest.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = bd.Stride;
            byte[] bytes = new byte[stride * h];
            Marshal.Copy(bd.Scan0, bytes, 0, bytes.Length);
            
            bool[] visited = new bool[w * h];
            Queue<int> q = new Queue<int>(w * h / 4);
            
            Action<int, int> enqueue = (x, y) => {
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    int id = y * w + x;
                    if (!visited[id]) {
                        visited[id] = true;
                        q.Enqueue(id);
                    }
                }
            };
            
            enqueue(0, 0);
            enqueue(w - 1, 0);
            enqueue(0, h - 1);
            enqueue(w - 1, h - 1);
            
            for (int i = 0; i < w; i += 4) { enqueue(i, 0); enqueue(i, h - 1); }
            for (int j = 0; j < h; j += 4) { enqueue(0, j); enqueue(w - 1, j); }
            
            while (q.Count > 0) {
                int id = q.Dequeue();
                int x = id % w;
                int y = id / w;
                int byteIdx = (y * stride) + (x * 4);
                int b = bytes[byteIdx];
                int gVal = bytes[byteIdx + 1];
                int r = bytes[byteIdx + 2];
                int max = Math.Max(r, Math.Max(gVal, b));
                
                if (max < 32) {
                    bytes[byteIdx + 3] = 0;
                    bytes[byteIdx] = 0;
                    bytes[byteIdx + 1] = 0;
                    bytes[byteIdx + 2] = 0;
                    enqueue(x + 1, y);
                    enqueue(x - 1, y);
                    enqueue(x, y + 1);
                    enqueue(x, y - 1);
                } else if (max < 58) {
                    float factor = (float)(max - 32) / 26f;
                    bytes[byteIdx + 3] = (byte)(factor * 255);
                }
            }
            
            Marshal.Copy(bytes, 0, bd.Scan0, bytes.Length);
            dest.UnlockBits(bd);
            
            // Save master 512x512 PNG
            using (Bitmap res512 = new Bitmap(512, 512, PixelFormat.Format32bppArgb)) {
                using (Graphics g512 = Graphics.FromImage(res512)) {
                    g512.SmoothingMode = SmoothingMode.AntiAlias;
                    g512.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g512.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g512.Clear(Color.Transparent);
                    g512.DrawImage(dest, 0, 0, 512, 512);
                }
                res512.Save(outPngPath, ImageFormat.Png);
            }
            
            // Build ICO with 256, 128, 64, 48, 32, 16
            int[] sizes = new int[] { 16, 32, 48, 64, 128, 256 };
            List<byte[]> pngs = new List<byte[]>();
            
            foreach (int sz in sizes) {
                using (Bitmap sb = new Bitmap(sz, sz, PixelFormat.Format32bppArgb)) {
                    using (Graphics sg = Graphics.FromImage(sb)) {
                        sg.SmoothingMode = SmoothingMode.AntiAlias;
                        sg.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        sg.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        sg.Clear(Color.Transparent);
                        sg.DrawImage(dest, 0, 0, sz, sz);
                    }
                    using (MemoryStream ms = new MemoryStream()) {
                        sb.Save(ms, ImageFormat.Png);
                        pngs.Add(ms.ToArray());
                    }
                }
            }
            
            using (FileStream fs = new FileStream(outIcoPath, FileMode.Create)) {
                using (BinaryWriter bw = new BinaryWriter(fs)) {
                    bw.Write((ushort)0);
                    bw.Write((ushort)1);
                    bw.Write((ushort)sizes.Length);
                    
                    int offset = 6 + (16 * sizes.Length);
                    for (int i = 0; i < sizes.Length; i++) {
                        int sz = sizes[i];
                        byte[] data = pngs[i];
                        bw.Write((byte)(sz >= 256 ? 0 : sz));
                        bw.Write((byte)(sz >= 256 ? 0 : sz));
                        bw.Write((byte)0);
                        bw.Write((byte)0);
                        bw.Write((ushort)1);
                        bw.Write((ushort)32);
                        bw.Write((uint)data.Length);
                        bw.Write((uint)offset);
                        offset += data.Length;
                    }
                    for (int i = 0; i < sizes.Length; i++) {
                        bw.Write(pngs[i]);
                    }
                }
            }
            dest.Dispose();
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$src = "C:\Users\Mohamed Fahmi\.gemini\antigravity-ide\brain\3f49f25b-7345-45f6-8bb8-a86dfb4deaef\video_converter_icon_1792854835086.jpg"
$outPng = "$PSScriptRoot\assets\icon.png"
$outIco = "$PSScriptRoot\build\icon.ico"

[FastIconMaker]::Process($src, $outPng, $outIco)
Write-Host "SUCCESS: FastIconMaker finished in milliseconds!"
