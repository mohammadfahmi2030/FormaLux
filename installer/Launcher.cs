using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("FormaLux Setup")]
[assembly: AssemblyDescription("FormaLux Desktop Installer")]
[assembly: AssemblyCompany("Mohammad Fahmi")]
[assembly: AssemblyProduct("FormaLux")]
[assembly: AssemblyCopyright("Copyright © 2026 Mohammad Fahmi. All rights reserved.")]
[assembly: AssemblyTrademark("FormaLux")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace FormaLux
{
    class OffsetStream : Stream
    {
        private readonly Stream _base;
        private readonly long _offset;

        public OffsetStream(Stream baseStream, long offset)
        {
            _base = baseStream;
            _offset = offset;
        }

        public override bool CanRead { get { return _base.CanRead; } }
        public override bool CanSeek { get { return _base.CanSeek; } }
        public override bool CanWrite { get { return false; } }
        public override long Length { get { return _base.Length - _offset; } }
        public override long Position
        {
            get { return _base.Position - _offset; }
            set { _base.Position = value + _offset; }
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            if (origin == SeekOrigin.Begin) return _base.Seek(offset + _offset, SeekOrigin.Begin) - _offset;
            if (origin == SeekOrigin.Current) return _base.Seek(offset, SeekOrigin.Current) - _offset;
            return _base.Seek(offset, SeekOrigin.End) - _offset;
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            return _base.Read(buffer, offset, count);
        }

        public override void Flush() { _base.Flush(); }
        public override void SetLength(long value) { throw new NotSupportedException(); }
        public override void Write(byte[] buffer, int offset, int count) { throw new NotSupportedException(); }
    }

    public class SplashForm : Form
    {
        private ProgressBar _progressBar;
        private Label _lblStatus;
        private Label _lblTitle;
        private Label _lblSubtitle;

        public SplashForm()
        {
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(460, 200);
            this.BackColor = Color.FromArgb(19, 19, 23); // #131317
            this.ShowInTaskbar = true;
            this.Text = "FormaLux Desktop Installer";

            // Title
            _lblTitle = new Label();
            _lblTitle.Text = "FormaLux Desktop Installer";
            _lblTitle.Font = new Font("Segoe UI", 15f, FontStyle.Bold);
            _lblTitle.ForeColor = Color.White;
            _lblTitle.Location = new Point(28, 26);
            _lblTitle.AutoSize = true;
            this.Controls.Add(_lblTitle);

            // Subtitle
            _lblSubtitle = new Label();
            _lblSubtitle.Text = "Next-Generation Media Converter Suite";
            _lblSubtitle.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            _lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184); // #94a3b8
            _lblSubtitle.Location = new Point(30, 58);
            _lblSubtitle.AutoSize = true;
            this.Controls.Add(_lblSubtitle);

            // Status label
            _lblStatus = new Label();
            _lblStatus.Text = "Starting installer engine...";
            _lblStatus.Font = new Font("Segoe UI", 9f, FontStyle.Regular);
            _lblStatus.ForeColor = Color.FromArgb(0, 242, 254); // cyan
            _lblStatus.Location = new Point(30, 114);
            _lblStatus.Size = new Size(400, 22);
            this.Controls.Add(_lblStatus);

            // Progress Bar
            _progressBar = new ProgressBar();
            _progressBar.Location = new Point(30, 140);
            _progressBar.Size = new Size(400, 14);
            _progressBar.Style = ProgressBarStyle.Continuous;
            _progressBar.Minimum = 0;
            _progressBar.Maximum = 100;
            _progressBar.Value = 5;
            this.Controls.Add(_progressBar);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            using (Pen borderPen = new Pen(Color.FromArgb(45, 45, 55), 1))
            {
                e.Graphics.DrawRectangle(borderPen, 0, 0, this.Width - 1, this.Height - 1);
            }
            using (LinearGradientBrush topGlow = new LinearGradientBrush(new Rectangle(0, 0, this.Width, 3), Color.FromArgb(0, 242, 254), Color.FromArgb(79, 70, 229), 0f))
            {
                e.Graphics.FillRectangle(topGlow, 0, 0, this.Width, 3);
            }
        }

        public void UpdateProgress(int percent, string status)
        {
            if (this.InvokeRequired)
            {
                this.BeginInvoke(new Action<int, string>(UpdateProgress), percent, status);
                return;
            }
            if (percent >= 0 && percent <= 100) _progressBar.Value = percent;
            if (!string.IsNullOrEmpty(status)) _lblStatus.Text = status;
        }
    }

    static class Program
    {
        private static readonly byte[] MagicMarker = System.Text.Encoding.ASCII.GetBytes("FORMALUX_PAYLOAD_V1");

        private static long FindPayloadOffset(Stream s)
        {
            byte[] buf = new byte[65536];
            s.Seek(0, SeekOrigin.Begin);
            long total = 0;
            int read;
            while ((read = s.Read(buf, 0, buf.Length)) > 0)
            {
                for (int i = 0; i <= read - MagicMarker.Length; i++)
                {
                    bool match = true;
                    for (int j = 0; j < MagicMarker.Length; j++)
                    {
                        if (buf[i + j] != MagicMarker[j])
                        {
                            match = false;
                            break;
                        }
                    }
                    if (match) return total + i + MagicMarker.Length;
                }
                total += read;
            }
            return -1;
        }

        private static string GetSafeTargetDirectory()
        {
            string uniqueName = "FormaLuxSetup_" + Guid.NewGuid().ToString("N").Substring(0, 8);
            
            // Try 1: LocalAppData\Temp
            try
            {
                string tempDir = Path.Combine(Path.GetTempPath(), uniqueName);
                Directory.CreateDirectory(tempDir);
                return tempDir;
            }
            catch { }

            // Try 2: LocalAppData
            try
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string appDir = Path.Combine(localApp, uniqueName);
                Directory.CreateDirectory(appDir);
                return appDir;
            }
            catch { }

            // Try 3: AppData Roaming
            try
            {
                string roaming = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string roamDir = Path.Combine(roaming, uniqueName);
                Directory.CreateDirectory(roamDir);
                return roamDir;
            }
            catch { }

            // Try 4: User Profile root
            string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string userDir = Path.Combine(userProfile, "." + uniqueName);
            Directory.CreateDirectory(userDir);
            return userDir;
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            SplashForm splash = new SplashForm();

            Thread worker = new Thread(() =>
            {
                string targetDir = null;
                Process setupProcess = null;

                try
                {
                    splash.UpdateProgress(10, "Verifying installer package...");

                    string currentExe = Process.GetCurrentProcess().MainModule.FileName;

                    using (FileStream fs = new FileStream(currentExe, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                    {
                        long offset = FindPayloadOffset(fs);
                        if (offset <= 0)
                        {
                            // If running next to unpacked dir in development
                            string devDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "setup-installer", "win-unpacked");
                            if (File.Exists(Path.Combine(devDir, "FormaLux Setup.exe")))
                            {
                                targetDir = devDir;
                            }
                            else
                            {
                                MessageBox.Show("Setup payload archive could not be located inside package.", "FormaLux Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                                splash.BeginInvoke(new Action(() => splash.Close()));
                                return;
                            }
                        }
                        else
                        {
                            splash.UpdateProgress(20, "Preparing setup environment...");
                            targetDir = GetSafeTargetDirectory();

                            using (OffsetStream os = new OffsetStream(fs, offset))
                            using (ZipArchive zip = new ZipArchive(os, ZipArchiveMode.Read))
                            {
                                int total = zip.Entries.Count;
                                int current = 0;

                                foreach (ZipArchiveEntry entry in zip.Entries)
                                {
                                    current++;
                                    if (string.IsNullOrEmpty(entry.Name))
                                    {
                                        continue;
                                    }

                                    string destPath = Path.Combine(targetDir, entry.FullName);
                                    string parent = Path.GetDirectoryName(destPath);
                                    if (!Directory.Exists(parent))
                                    {
                                        Directory.CreateDirectory(parent);
                                    }

                                    // Extract file safely
                                    using (Stream entryStream = entry.Open())
                                    using (FileStream destStream = new FileStream(destPath, FileMode.Create, FileAccess.Write, FileShare.None))
                                    {
                                        byte[] buffer = new byte[65536];
                                        int bytesRead;
                                        while ((bytesRead = entryStream.Read(buffer, 0, buffer.Length)) > 0)
                                        {
                                            destStream.Write(buffer, 0, bytesRead);
                                        }
                                    }

                                    int pct = 20 + (int)((float)current / total * 75f);
                                    if (current % 10 == 0 || current == total)
                                    {
                                        splash.UpdateProgress(pct, "Unpacking " + entry.Name + "...");
                                    }
                                }
                            }
                        }
                    }

                    string installerExe = Path.Combine(targetDir, "FormaLux Setup.exe");
                    if (!File.Exists(installerExe))
                    {
                        throw new FileNotFoundException("Could not find FormaLux Setup.exe in " + targetDir);
                    }

                    splash.UpdateProgress(100, "Opening FormaLux Desktop Installer...");
                    Thread.Sleep(300);

                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = installerExe,
                        WorkingDirectory = targetDir,
                        UseShellExecute = true
                    };

                    setupProcess = Process.Start(psi);

                    // Close splash screen now that installer window has launched
                    splash.BeginInvoke(new Action(() => splash.Close()));

                    // Keep launcher waiting in background to clean up temporary folder when installer finishes
                    if (setupProcess != null)
                    {
                        setupProcess.WaitForExit();
                        Thread.Sleep(1000);
                        try
                        {
                            if (Directory.Exists(targetDir) && targetDir.Contains("FormaLuxSetup_"))
                            {
                                Directory.Delete(targetDir, true);
                            }
                        }
                        catch { }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Failed to launch installer:\n" + ex.Message, "FormaLux Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    splash.BeginInvoke(new Action(() => splash.Close()));
                    try
                    {
                        if (targetDir != null && Directory.Exists(targetDir) && targetDir.Contains("FormaLuxSetup_"))
                        {
                            Directory.Delete(targetDir, true);
                        }
                    }
                    catch { }
                }
            });

            worker.IsBackground = false;
            worker.Start();

            Application.Run(splash);
        }
    }
}
