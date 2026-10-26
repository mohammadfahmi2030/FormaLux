using System;
using System.IO;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("FormaLux Uninstaller")]
[assembly: AssemblyDescription("FormaLux Desktop Complete Uninstaller")]
[assembly: AssemblyCompany("Mohammad Fahmi")]
[assembly: AssemblyProduct("FormaLux")]
[assembly: AssemblyCopyright("Copyright © 2026 Mohammad Fahmi. All rights reserved.")]
[assembly: AssemblyTrademark("FormaLux")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace FormaLux
{
    public class CrispImageControl : Control
    {
        public Image Image { get; set; }

        public CrispImageControl()
        {
            this.SetStyle(ControlStyles.AllPaintingInWmPaint |
                          ControlStyles.UserPaint |
                          ControlStyles.OptimizedDoubleBuffer |
                          ControlStyles.SupportsTransparentBackColor, true);
            this.BackColor = Color.Transparent;
        }

        protected override void OnPaint(PaintEventArgs pe)
        {
            base.OnPaint(pe);
            if (this.Image == null) return;

            pe.Graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            pe.Graphics.SmoothingMode = SmoothingMode.HighQuality;
            pe.Graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            pe.Graphics.CompositingQuality = CompositingQuality.HighQuality;

            float scale = Math.Min((float)this.Width / this.Image.Width, (float)this.Height / this.Image.Height);
            int drawW = Math.Max(1, (int)(this.Image.Width * scale));
            int drawH = Math.Max(1, (int)(this.Image.Height * scale));
            int drawX = (this.Width - drawW) / 2;
            int drawY = (this.Height - drawH) / 2;

            pe.Graphics.DrawImage(this.Image, new Rectangle(drawX, drawY, drawW, drawH), 0, 0, this.Image.Width, this.Image.Height, GraphicsUnit.Pixel);
        }
    }

    public class UninstallerForm : Form
    {
        private enum ScreenState { Confirm, Progress, Finished }
        private ScreenState _state = ScreenState.Confirm;

        private readonly string _targetInstallDir;
        private readonly bool _isSpawnedFromTemp;
        private static Bitmap _masterLogo = null;

        // UI Header Controls
        private Panel _titleBar;
        private Label _lblWinTitle;
        private Button _btnMin;
        private Button _btnClose;
        private CrispImageControl _titleIcon;

        // Main Icon & Banner
        private CrispImageControl _picMainLogo;

        // Confirm screen controls
        private Label _lblMainTitle;
        private Label _lblSubtitle1;
        private Label _lblSubtitle2;
        private Panel _cardOptions;
        private CheckBox _chkDeleteUserData;
        private Button _btnCancel;
        private Button _btnUninstall;

        // Progress screen controls
        private Label _lblProgressStatus;
        private Label _lblProgressPercent;
        private ProgressBar _progressBar;

        // Finished screen controls
        private Label _lblFinishIcon;
        private Label _lblFinishTitle;
        private Label _lblFinishDesc1;
        private Label _lblFinishDesc2;
        private Button _btnFinish;

        // Window dragging
        private bool _isDragging = false;
        private Point _dragStartPoint;

        public UninstallerForm(string targetDir, bool isSpawnedFromTemp)
        {
            _targetInstallDir = targetDir;
            _isSpawnedFromTemp = isSpawnedFromTemp;

            EnsureMasterLogo();
            InitWindow();
            InitControls();
            SetScreenState(ScreenState.Confirm);
        }

        private static void EnsureMasterLogo()
        {
            if (_masterLogo != null) return;

            // 1. Check embedded resource (FormaLuxLogo)
            try
            {
                Assembly asm = Assembly.GetExecutingAssembly();
                foreach (string name in asm.GetManifestResourceNames())
                {
                    if (name.IndexOf("FormaLuxLogo", StringComparison.OrdinalIgnoreCase) >= 0 ||
                        name.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                    {
                        using (Stream s = asm.GetManifestResourceStream(name))
                        {
                            if (s != null)
                            {
                                using (Bitmap b = new Bitmap(s))
                                {
                                    _masterLogo = new Bitmap(b);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            catch { }

            // 2. Check icon.png on disk in adjacent folders
            try
            {
                string exePath = Process.GetCurrentProcess().MainModule.FileName;
                string exeDir = Path.GetDirectoryName(exePath);
                string[] candidates = new string[]
                {
                    Path.Combine(exeDir, "icon.png"),
                    Path.Combine(exeDir, "..", "icon.png"),
                    Path.Combine(exeDir, "installer", "icon.png"),
                    Path.Combine(exeDir, "..", "installer", "icon.png")
                };

                foreach (string c in candidates)
                {
                    if (File.Exists(c))
                    {
                        using (Bitmap b = new Bitmap(c))
                        {
                            _masterLogo = new Bitmap(b);
                            return;
                        }
                    }
                }
            }
            catch { }

            // 3. Fallback: extract associated icon
            try
            {
                string exePath = Process.GetCurrentProcess().MainModule.FileName;
                Icon appIcon = Icon.ExtractAssociatedIcon(exePath);
                if (appIcon != null)
                {
                    _masterLogo = appIcon.ToBitmap();
                }
            }
            catch { }
        }

        private void InitWindow()
        {
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(560, 390);
            this.BackColor = Color.FromArgb(17, 17, 22); // #111116
            this.ForeColor = Color.White;
            this.ShowInTaskbar = true;
            this.Text = "FormaLux Uninstaller";
            this.DoubleBuffered = true;

            try
            {
                string exePath = Process.GetCurrentProcess().MainModule.FileName;
                Icon appIcon = Icon.ExtractAssociatedIcon(exePath);
                if (appIcon != null) this.Icon = appIcon;
            }
            catch { }
        }

        private void InitControls()
        {
            // Top Titlebar
            _titleBar = new Panel();
            _titleBar.Location = new Point(0, 0);
            _titleBar.Size = new Size(this.Width, 44);
            _titleBar.BackColor = Color.FromArgb(22, 22, 29);
            _titleBar.MouseDown += (s, e) => { if (e.Button == MouseButtons.Left) { _isDragging = true; _dragStartPoint = e.Location; } };
            _titleBar.MouseMove += (s, e) => {
                if (_isDragging) {
                    Point diff = new Point(e.X - _dragStartPoint.X, e.Y - _dragStartPoint.Y);
                    this.Location = new Point(this.Location.X + diff.X, this.Location.Y + diff.Y);
                }
            };
            _titleBar.MouseUp += (s, e) => { _isDragging = false; };
            this.Controls.Add(_titleBar);

            _titleIcon = new CrispImageControl();
            _titleIcon.Size = new Size(22, 22);
            _titleIcon.Location = new Point(16, 11);
            _titleIcon.Image = _masterLogo;
            _titleBar.Controls.Add(_titleIcon);

            _lblWinTitle = new Label();
            _lblWinTitle.Text = "FormaLux Uninstaller";
            _lblWinTitle.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            _lblWinTitle.ForeColor = Color.FromArgb(203, 213, 225);
            _lblWinTitle.Location = new Point(46, 13);
            _lblWinTitle.AutoSize = true;
            _titleBar.Controls.Add(_lblWinTitle);

            _btnMin = new Button();
            _btnMin.Text = "—";
            _btnMin.FlatStyle = FlatStyle.Flat;
            _btnMin.FlatAppearance.BorderSize = 0;
            _btnMin.ForeColor = Color.FromArgb(148, 163, 184);
            _btnMin.Font = new Font("Segoe UI", 9f);
            _btnMin.Size = new Size(44, 44);
            _btnMin.Location = new Point(this.Width - 88, 0);
            _btnMin.Cursor = Cursors.Hand;
            _btnMin.Click += (s, e) => this.WindowState = FormWindowState.Minimized;
            _titleBar.Controls.Add(_btnMin);

            _btnClose = new Button();
            _btnClose.Text = "✕";
            _btnClose.FlatStyle = FlatStyle.Flat;
            _btnClose.FlatAppearance.BorderSize = 0;
            _btnClose.ForeColor = Color.FromArgb(148, 163, 184);
            _btnClose.Font = new Font("Segoe UI", 10.5f);
            _btnClose.Size = new Size(44, 44);
            _btnClose.Location = new Point(this.Width - 44, 0);
            _btnClose.Cursor = Cursors.Hand;
            _btnClose.MouseEnter += (s, e) => { _btnClose.BackColor = Color.FromArgb(225, 29, 72); _btnClose.ForeColor = Color.White; };
            _btnClose.MouseLeave += (s, e) => { _btnClose.BackColor = Color.Transparent; _btnClose.ForeColor = Color.FromArgb(148, 163, 184); };
            _btnClose.Click += (s, e) => this.Close();
            _titleBar.Controls.Add(_btnClose);

            // Large Crisp Program Logo (High resolution, anti-aliased bicubic rendering)
            _picMainLogo = new CrispImageControl();
            _picMainLogo.Size = new Size(80, 80);
            _picMainLogo.Location = new Point((this.Width - 80) / 2, 58);
            _picMainLogo.Image = _masterLogo;
            this.Controls.Add(_picMainLogo);

            // ================= CONFIRM VIEW =================
            _lblMainTitle = new Label();
            _lblMainTitle.Text = "Uninstall FormaLux";
            _lblMainTitle.Font = new Font("Segoe UI", 16f, FontStyle.Bold);
            _lblMainTitle.ForeColor = Color.White;
            _lblMainTitle.TextAlign = ContentAlignment.MiddleCenter;
            _lblMainTitle.Size = new Size(520, 32);
            _lblMainTitle.Location = new Point(20, 146);
            this.Controls.Add(_lblMainTitle);

            _lblSubtitle1 = new Label();
            _lblSubtitle1.Text = "Are you sure you want to completely uninstall FormaLux Media Suite?";
            _lblSubtitle1.Font = new Font("Segoe UI", 10f, FontStyle.Regular);
            _lblSubtitle1.ForeColor = Color.FromArgb(203, 213, 225);
            _lblSubtitle1.TextAlign = ContentAlignment.MiddleCenter;
            _lblSubtitle1.Size = new Size(520, 24);
            _lblSubtitle1.Location = new Point(20, 180);
            this.Controls.Add(_lblSubtitle1);

            _lblSubtitle2 = new Label();
            _lblSubtitle2.Text = "All conversion tools, audio/video engines, and presets will be removed from your PC.";
            _lblSubtitle2.Font = new Font("Segoe UI", 8.75f, FontStyle.Regular);
            _lblSubtitle2.ForeColor = Color.FromArgb(148, 163, 184);
            _lblSubtitle2.TextAlign = ContentAlignment.MiddleCenter;
            _lblSubtitle2.Size = new Size(520, 20);
            _lblSubtitle2.Location = new Point(20, 205);
            this.Controls.Add(_lblSubtitle2);

            // Options Card
            _cardOptions = new Panel();
            _cardOptions.Size = new Size(480, 44);
            _cardOptions.Location = new Point(40, 236);
            _cardOptions.BackColor = Color.FromArgb(24, 24, 32);
            _cardOptions.Paint += (s, e) => {
                using (Pen p = new Pen(Color.FromArgb(45, 45, 60), 1))
                {
                    e.Graphics.DrawRectangle(p, 0, 0, _cardOptions.Width - 1, _cardOptions.Height - 1);
                }
            };
            this.Controls.Add(_cardOptions);

            _chkDeleteUserData = new CheckBox();
            _chkDeleteUserData.Text = "Remove user preferences, saved presets, and temporary cache";
            _chkDeleteUserData.Font = new Font("Segoe UI", 9f);
            _chkDeleteUserData.ForeColor = Color.FromArgb(203, 213, 225);
            _chkDeleteUserData.Checked = true;
            _chkDeleteUserData.AutoSize = true;
            _chkDeleteUserData.Location = new Point(14, 12);
            _cardOptions.Controls.Add(_chkDeleteUserData);

            // Buttons
            _btnCancel = new Button();
            _btnCancel.Text = "Cancel";
            _btnCancel.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            _btnCancel.Size = new Size(130, 40);
            _btnCancel.Location = new Point(135, 305);
            _btnCancel.FlatStyle = FlatStyle.Flat;
            _btnCancel.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            _btnCancel.ForeColor = Color.FromArgb(226, 232, 240);
            _btnCancel.BackColor = Color.FromArgb(30, 30, 42);
            _btnCancel.Cursor = Cursors.Hand;
            _btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(_btnCancel);

            _btnUninstall = new Button();
            _btnUninstall.Text = "Uninstall";
            _btnUninstall.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            _btnUninstall.Size = new Size(150, 40);
            _btnUninstall.Location = new Point(275, 305);
            _btnUninstall.FlatStyle = FlatStyle.Flat;
            _btnUninstall.FlatAppearance.BorderSize = 0;
            _btnUninstall.ForeColor = Color.White;
            _btnUninstall.BackColor = Color.FromArgb(225, 29, 72); // Rose/red danger
            _btnUninstall.Cursor = Cursors.Hand;
            _btnUninstall.Click += (s, e) => StartUninstallProcess();
            this.Controls.Add(_btnUninstall);

            // ================= PROGRESS VIEW =================
            _lblProgressStatus = new Label();
            _lblProgressStatus.Text = "Preparing uninstallation...";
            _lblProgressStatus.Font = new Font("Segoe UI", 10.5f, FontStyle.Bold);
            _lblProgressStatus.ForeColor = Color.FromArgb(56, 189, 248); // Cyan
            _lblProgressStatus.TextAlign = ContentAlignment.MiddleCenter;
            _lblProgressStatus.Size = new Size(520, 28);
            _lblProgressStatus.Location = new Point(20, 180);
            _lblProgressStatus.Visible = false;
            this.Controls.Add(_lblProgressStatus);

            _lblProgressPercent = new Label();
            _lblProgressPercent.Text = "0%";
            _lblProgressPercent.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
            _lblProgressPercent.ForeColor = Color.FromArgb(148, 163, 184);
            _lblProgressPercent.TextAlign = ContentAlignment.MiddleCenter;
            _lblProgressPercent.Size = new Size(520, 20);
            _lblProgressPercent.Location = new Point(20, 212);
            _lblProgressPercent.Visible = false;
            this.Controls.Add(_lblProgressPercent);

            _progressBar = new ProgressBar();
            _progressBar.Size = new Size(460, 14);
            _progressBar.Location = new Point(50, 240);
            _progressBar.Style = ProgressBarStyle.Continuous;
            _progressBar.Minimum = 0;
            _progressBar.Maximum = 100;
            _progressBar.Value = 0;
            _progressBar.Visible = false;
            this.Controls.Add(_progressBar);

            // ================= FINISHED VIEW =================
            _lblFinishIcon = new Label();
            _lblFinishIcon.Text = "✓";
            _lblFinishIcon.Font = new Font("Segoe UI", 42f, FontStyle.Bold);
            _lblFinishIcon.ForeColor = Color.FromArgb(16, 185, 129); // Green
            _lblFinishIcon.TextAlign = ContentAlignment.MiddleCenter;
            _lblFinishIcon.Size = new Size(80, 70);
            _lblFinishIcon.Location = new Point((this.Width - 80) / 2, 70);
            _lblFinishIcon.Visible = false;
            this.Controls.Add(_lblFinishIcon);

            _lblFinishTitle = new Label();
            _lblFinishTitle.Text = "Uninstallation Complete";
            _lblFinishTitle.Font = new Font("Segoe UI", 16.5f, FontStyle.Bold);
            _lblFinishTitle.ForeColor = Color.FromArgb(52, 211, 153);
            _lblFinishTitle.TextAlign = ContentAlignment.MiddleCenter;
            _lblFinishTitle.Size = new Size(520, 36);
            _lblFinishTitle.Location = new Point(20, 150);
            _lblFinishTitle.Visible = false;
            this.Controls.Add(_lblFinishTitle);

            _lblFinishDesc1 = new Label();
            _lblFinishDesc1.Text = "FormaLux has been successfully removed from your computer.";
            _lblFinishDesc1.Font = new Font("Segoe UI", 10f);
            _lblFinishDesc1.ForeColor = Color.FromArgb(203, 213, 225);
            _lblFinishDesc1.TextAlign = ContentAlignment.MiddleCenter;
            _lblFinishDesc1.Size = new Size(520, 26);
            _lblFinishDesc1.Location = new Point(20, 192);
            _lblFinishDesc1.Visible = false;
            this.Controls.Add(_lblFinishDesc1);

            _lblFinishDesc2 = new Label();
            _lblFinishDesc2.Text = "All application files, components, and shortcuts were cleaned up.";
            _lblFinishDesc2.Font = new Font("Segoe UI", 8.75f);
            _lblFinishDesc2.ForeColor = Color.FromArgb(148, 163, 184);
            _lblFinishDesc2.TextAlign = ContentAlignment.MiddleCenter;
            _lblFinishDesc2.Size = new Size(520, 20);
            _lblFinishDesc2.Location = new Point(20, 220);
            _lblFinishDesc2.Visible = false;
            this.Controls.Add(_lblFinishDesc2);

            _btnFinish = new Button();
            _btnFinish.Text = "Finish";
            _btnFinish.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            _btnFinish.Size = new Size(160, 42);
            _btnFinish.Location = new Point((this.Width - 160) / 2, 275);
            _btnFinish.FlatStyle = FlatStyle.Flat;
            _btnFinish.FlatAppearance.BorderSize = 0;
            _btnFinish.ForeColor = Color.White;
            _btnFinish.BackColor = Color.FromArgb(16, 185, 129); // Green primary
            _btnFinish.Cursor = Cursors.Hand;
            _btnFinish.Visible = false;
            _btnFinish.Click += (s, e) => this.Close();
            this.Controls.Add(_btnFinish);
        }

        private void SetScreenState(ScreenState state)
        {
            _state = state;
            bool isConfirm = state == ScreenState.Confirm;
            bool isProgress = state == ScreenState.Progress;
            bool isFinish = state == ScreenState.Finished;

            // Logo & headers
            _picMainLogo.Visible = !isFinish;
            _lblMainTitle.Visible = isConfirm;
            _lblSubtitle1.Visible = isConfirm;
            _lblSubtitle2.Visible = isConfirm;
            _cardOptions.Visible = isConfirm;
            _btnCancel.Visible = isConfirm;
            _btnUninstall.Visible = isConfirm;

            // Progress
            _lblProgressStatus.Visible = isProgress;
            _lblProgressPercent.Visible = isProgress;
            _progressBar.Visible = isProgress;

            // Finish
            _lblFinishIcon.Visible = isFinish;
            _lblFinishTitle.Visible = isFinish;
            _lblFinishDesc1.Visible = isFinish;
            _lblFinishDesc2.Visible = isFinish;
            _btnFinish.Visible = isFinish;

            this.Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;

            // 1px Border around window
            using (Pen borderPen = new Pen(Color.FromArgb(45, 45, 58), 1))
            {
                e.Graphics.DrawRectangle(borderPen, 0, 0, this.Width - 1, this.Height - 1);
            }

            // Glowing top accent banner
            Color leftColor = _state == ScreenState.Finished ? Color.FromArgb(16, 185, 129) : Color.FromArgb(225, 29, 72);
            Color rightColor = _state == ScreenState.Finished ? Color.FromArgb(6, 182, 212) : Color.FromArgb(99, 102, 241);

            using (LinearGradientBrush topGlow = new LinearGradientBrush(new Rectangle(0, 0, this.Width, 3), leftColor, rightColor, 0f))
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
            if (percent >= 0 && percent <= 100)
            {
                _progressBar.Value = percent;
                _lblProgressPercent.Text = percent + "%";
            }
            if (!string.IsNullOrEmpty(status))
            {
                _lblProgressStatus.Text = status;
            }
        }

        private void StartUninstallProcess()
        {
            SetScreenState(ScreenState.Progress);
            bool cleanUserData = _chkDeleteUserData.Checked;

            Thread worker = new Thread(() =>
            {
                try
                {
                    // Step 1: Kill running instances
                    UpdateProgress(15, "Stopping active FormaLux processes...");
                    Thread.Sleep(300);
                    KillRunningProcesses();

                    // Step 2: Remove shortcuts
                    UpdateProgress(35, "Removing desktop and Start menu shortcuts...");
                    Thread.Sleep(300);
                    RemoveShortcuts();

                    // Step 3: Remove Registry entries
                    UpdateProgress(55, "Cleaning Windows registry entries...");
                    Thread.Sleep(300);
                    RemoveRegistryEntries();

                    // Step 4: Delete user cache if requested
                    if (cleanUserData)
                    {
                        UpdateProgress(70, "Deleting user cache and preferences...");
                        RemoveUserData();
                    }

                    // Step 5: Delete installation folder files
                    UpdateProgress(85, "Removing application files and libraries...");
                    Thread.Sleep(300);
                    DeleteInstallationDirectory();

                    UpdateProgress(100, "Uninstallation completed successfully!");
                    Thread.Sleep(400);

                    this.BeginInvoke(new Action(() => SetScreenState(ScreenState.Finished)));
                }
                catch (Exception ex)
                {
                    MessageBox.Show("An error occurred during uninstallation:\n" + ex.Message, "FormaLux Uninstaller", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    this.BeginInvoke(new Action(() => SetScreenState(ScreenState.Finished)));
                }
            });

            worker.IsBackground = true;
            worker.Start();
        }

        private void KillRunningProcesses()
        {
            try
            {
                Process[] procs = Process.GetProcessesByName("FormaLux");
                foreach (Process p in procs)
                {
                    try { p.Kill(); p.WaitForExit(1500); } catch { }
                }
            }
            catch { }
        }

        private void RemoveShortcuts()
        {
            try
            {
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string desktopLnk = Path.Combine(desktop, "FormaLux.lnk");
                if (File.Exists(desktopLnk)) File.Delete(desktopLnk);

                string programs = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                string progLnk = Path.Combine(programs, "FormaLux.lnk");
                if (File.Exists(progLnk)) File.Delete(progLnk);

                string uninstLnk = Path.Combine(programs, "Uninstall FormaLux.lnk");
                if (File.Exists(uninstLnk)) File.Delete(uninstLnk);
            }
            catch { }
        }

        private void RemoveRegistryEntries()
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall", true))
                {
                    if (key != null)
                    {
                        key.DeleteSubKeyTree("FormaLux", false);
                    }
                }
            }
            catch { }
        }

        private void RemoveUserData()
        {
            try
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string dir1 = Path.Combine(localApp, "FormaLux");
                if (Directory.Exists(dir1)) Directory.Delete(dir1, true);

                string roamApp = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string dir2 = Path.Combine(roamApp, "FormaLux");
                if (Directory.Exists(dir2)) Directory.Delete(dir2, true);
            }
            catch { }
        }

        private void DeleteInstallationDirectory()
        {
            if (string.IsNullOrEmpty(_targetInstallDir) || !Directory.Exists(_targetInstallDir)) return;

            string currentExePath = Process.GetCurrentProcess().MainModule.FileName;

            // Delete all files inside target directory
            foreach (string file in Directory.GetFiles(_targetInstallDir, "*.*", SearchOption.AllDirectories))
            {
                try
                {
                    if (string.Equals(file, currentExePath, StringComparison.OrdinalIgnoreCase)) continue;
                    File.SetAttributes(file, FileAttributes.Normal);
                    File.Delete(file);
                }
                catch { }
            }

            // Delete subdirectories
            foreach (string subDir in Directory.GetDirectories(_targetInstallDir))
            {
                try
                {
                    Directory.Delete(subDir, true);
                }
                catch { }
            }

            // If we are running from Temp, delete the target root directory itself
            if (_isSpawnedFromTemp)
            {
                try
                {
                    Directory.Delete(_targetInstallDir, true);
                }
                catch { }
            }
        }
    }

    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string currentExe = Process.GetCurrentProcess().MainModule.FileName;
            string currentDir = Path.GetDirectoryName(currentExe);

            string targetInstallDir = currentDir;
            bool isFromTemp = false;
            bool isSilent = false;

            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "--target" && i + 1 < args.Length)
                {
                    targetInstallDir = args[i + 1];
                    isFromTemp = true;
                }
                else if (args[i] == "--from-temp")
                {
                    isFromTemp = true;
                }
                else if (args[i] == "/silent" || args[i] == "--silent" || args[i] == "/S")
                {
                    isSilent = true;
                }
            }

            // Silent uninstallation support for Windows / automated scripts
            if (isSilent)
            {
                PerformSilentUninstall(targetInstallDir);
                return;
            }

            // If launched from install dir, copy self to TEMP and run from there
            // so install directory has no locked files!
            if (!isFromTemp)
            {
                try
                {
                    string tempDir = Path.Combine(Path.GetTempPath(), "FormaLux_Uninstaller_" + Guid.NewGuid().ToString("N").Substring(0, 8));
                    Directory.CreateDirectory(tempDir);
                    string tempExe = Path.Combine(tempDir, "Uninstall.exe");
                    File.Copy(currentExe, tempExe, true);

                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = tempExe,
                        Arguments = "--target \"" + targetInstallDir + "\" --from-temp",
                        UseShellExecute = true
                    };
                    Process.Start(psi);
                    return; // Exit in-place process immediately
                }
                catch
                {
                    // Fallback to running in-place
                }
            }

            UninstallerForm form = new UninstallerForm(targetInstallDir, isFromTemp);
            Application.Run(form);

            // Cleanup temp uninstaller folder upon exit
            if (isFromTemp)
            {
                try
                {
                    string tempDir = Path.GetDirectoryName(currentExe);
                    ProcessStartInfo cleanup = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/c ping 127.0.0.1 -n 2 > nul & rmdir /s /q \"" + tempDir + "\"",
                        WindowStyle = ProcessWindowStyle.Hidden,
                        CreateNoWindow = true
                    };
                    Process.Start(cleanup);
                }
                catch { }
            }
        }

        private static void PerformSilentUninstall(string targetDir)
        {
            try
            {
                // Kill process
                foreach (Process p in Process.GetProcessesByName("FormaLux"))
                {
                    try { p.Kill(); p.WaitForExit(1000); } catch { }
                }

                // Remove shortcuts
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string desktopLnk = Path.Combine(desktop, "FormaLux.lnk");
                if (File.Exists(desktopLnk)) File.Delete(desktopLnk);

                string programs = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                string progLnk = Path.Combine(programs, "FormaLux.lnk");
                if (File.Exists(progLnk)) File.Delete(progLnk);

                string uninstLnk = Path.Combine(programs, "Uninstall FormaLux.lnk");
                if (File.Exists(uninstLnk)) File.Delete(uninstLnk);

                // Remove registry
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall", true))
                {
                    if (key != null) key.DeleteSubKeyTree("FormaLux", false);
                }

                // Remove directory
                if (Directory.Exists(targetDir))
                {
                    Directory.Delete(targetDir, true);
                }
            }
            catch { }
        }
    }
}
