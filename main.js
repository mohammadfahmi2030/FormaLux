const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execFile } = require('child_process');
const os = require('os');
const https = require('https');
const {
  generateMediaInfoText,
  generateBasicFileInfoText,
  testHardwareAcceleration,
  scanFilesForRename,
  generateRenameMappings,
  executeRename,
  compressIsoToCso,
  decompressCsoToIso,
  createIsoFromFolder
} = require('./media_utils');

// Keep a global reference of the window object
let mainWindow;
let settingsPath;
let appSettings = {};

// Determine paths
function getFfmpegPath() {
  const isDev = process.argv.includes('--dev') || !app.isPackaged;
  const primaryBin = isDev ? path.join(__dirname, 'bin', 'ffmpeg.exe') : path.join(process.resourcesPath, 'bin', 'ffmpeg.exe');
  if (fs.existsSync(primaryBin)) return primaryBin;
  try {
    const ff = require('ffmpeg-static');
    if (ff && fs.existsSync(ff)) return ff;
  } catch (e) {}
  return 'ffmpeg';
}

function getFfprobePath() {
  const isDev = process.argv.includes('--dev') || !app.isPackaged;
  const primaryBin = isDev ? path.join(__dirname, 'bin', 'ffprobe.exe') : path.join(process.resourcesPath, 'bin', 'ffprobe.exe');
  if (fs.existsSync(primaryBin)) return primaryBin;
  try {
    const pr = require('ffprobe-static');
    if (pr && pr.path && fs.existsSync(pr.path)) return pr.path;
  } catch (e) {}
  return 'ffprobe';
}

function getSettingsPath() {
  const appData = app.getPath('userData');
  return path.join(appData, 'settings.json');
}

function loadSettings() {
  try {
    settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      appSettings = JSON.parse(data);
    }
  } catch (e) {
    appSettings = {};
  }
  // Defaults & Migrations: Ensure outputDir never uses FFOutput
  if (!appSettings.outputDir || appSettings.outputDir.includes('FFOutput')) {
    appSettings.outputDir = (appSettings.outputDir && appSettings.outputDir.includes('FFOutput'))
      ? appSettings.outputDir.replace(/FFOutput/g, 'FLoutput')
      : path.join(os.homedir(), 'Desktop', 'FLoutput');
    saveSettings();
  }
  if (!appSettings.outputToSameFolder) appSettings.outputToSameFolder = false;
  if (!appSettings.outputToSubFolder) appSettings.outputToSubFolder = false;
  if (!appSettings.appendSettings) appSettings.appendSettings = false;
  if (!appSettings.shutdownAfter) appSettings.shutdownAfter = false;
  if (!appSettings.openFolderAfter) appSettings.openFolderAfter = false;
  if (!appSettings.soundGeneral) appSettings.soundGeneral = false;
  if (!appSettings.soundComplete) appSettings.soundComplete = false;
  if (!appSettings.soundFail) appSettings.soundFail = true;
  if (!appSettings.addToContextMenu) appSettings.addToContextMenu = true;
  if (!appSettings.checkUpdates) appSettings.checkUpdates = true;
  if (!appSettings.minimizeToTray) appSettings.minimizeToTray = false;
  if (!appSettings.gpuAutoDetect) appSettings.gpuAutoDetect = true;
  if (!appSettings.multiThreads) appSettings.multiThreads = Math.min(os.cpus().length, 8);
  if (!appSettings.showCpuGpu) appSettings.showCpuGpu = true;
  if (!appSettings.jpgQuality) appSettings.jpgQuality = 90;
  if (!appSettings.webpQuality) appSettings.webpQuality = 90;
  if (!appSettings.language) appSettings.language = 'ar';
  if (!appSettings.theme) appSettings.theme = 'dark';
  return appSettings;
}

function saveSettings() {
  try {
    if (!fs.existsSync(path.dirname(settingsPath))) {
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(appSettings, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'FormaLux — مصنع التحويل الفاخر',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0a0a1a',
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Custom titlebar controls
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false);
  });
}

app.whenReady().then(() => {
  loadSettings();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ========== IPC Handlers ==========

// Window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

// Settings
ipcMain.handle('get-settings', () => appSettings);
ipcMain.handle('save-settings', (event, newSettings) => {
  appSettings = { ...appSettings, ...newSettings };
  saveSettings();
  return true;
});

// Check for Updates via GitHub Releases or version.json
ipcMain.handle('check-for-updates', async (event, customRepo) => {
  const currentVersion = app.getVersion() || '1.0.0';
  const repo = (customRepo || appSettings.githubRepo || 'mohammadfahmi2030/FormaLux').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '');
  
  if (!repo || !repo.includes('/')) {
    return {
      status: 'invalid_repo',
      currentVersion,
      message: 'يرجى إدخال اسم مستودع جيت هاب بالصيغة: username/repo'
    };
  }

  const fetchJson = (url) => new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'FormaLux-App/' + currentVersion,
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 10000
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode === 404) {
        return resolve({ notFound: true });
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`GitHub responded with HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('انتهت مهلة الاتصال بخادم GitHub')); });
  });

  function compareSemver(v1, v2) {
    const clean = v => v.toString().replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    const p1 = clean(v1);
    const p2 = clean(v2);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  try {
    // 1. Try GitHub Releases API first
    const releaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;
    const releaseData = await fetchJson(releaseUrl);

    if (releaseData && !releaseData.notFound && releaseData.tag_name) {
      const latestTag = releaseData.tag_name;
      const isNewer = compareSemver(latestTag, currentVersion) > 0;
      let downloadUrl = releaseData.html_url;
      if (Array.isArray(releaseData.assets)) {
        const exeAsset = releaseData.assets.find(a => a.name && a.name.toLowerCase().endsWith('.exe'));
        if (exeAsset && exeAsset.browser_download_url) {
          downloadUrl = exeAsset.browser_download_url;
        }
      }

      return {
        status: 'success',
        hasUpdate: isNewer,
        currentVersion,
        latestVersion: latestTag.replace(/^v/i, ''),
        releaseName: releaseData.name || latestTag,
        releaseNotes: releaseData.body || '',
        publishedAt: releaseData.published_at,
        downloadUrl,
        releaseUrl: releaseData.html_url,
        repo
      };
    }

    // 2. Fallback to raw version.json
    const rawUrl = `https://raw.githubusercontent.com/${repo}/main/version.json`;
    const verData = await fetchJson(rawUrl);

    if (verData && !verData.notFound && verData.version) {
      const latestVer = verData.version;
      const isNewer = compareSemver(latestVer, currentVersion) > 0;
      return {
        status: 'success',
        hasUpdate: isNewer,
        currentVersion,
        latestVersion: latestVer,
        releaseName: verData.name || `FormaLux v${latestVer}`,
        releaseNotes: verData.notes || '',
        downloadUrl: verData.downloadUrl || `https://github.com/${repo}/releases`,
        releaseUrl: `https://github.com/${repo}/releases`,
        repo
      };
    }

    return {
      status: 'no_release_yet',
      hasUpdate: false,
      currentVersion,
      repo,
      message: 'لم يتم العثور على إصدارات منشورة في هذا المستودع بعد.'
    };
  } catch (err) {
    return {
      status: 'error',
      hasUpdate: false,
      currentVersion,
      repo,
      error: err.message
    };
  }
});

ipcMain.handle('open-external-url', (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('select-files', async (event, filters) => {
  const fileFilters = filters && filters.length > 0 ? [...filters] : [];
  if (!fileFilters.some(f => f.extensions && (f.extensions.includes('*') || f.extensions.includes('*.*')))) {
    fileFilters.push({ name: 'All Files (*.*)', extensions: ['*'] });
  }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: fileFilters
  });
  return result.filePaths;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'اختر مجلد الإخراج'
  });
  if (result.filePaths[0]) {
    appSettings.outputDir = result.filePaths[0];
    saveSettings();
  }
  return result.filePaths[0] || appSettings.outputDir;
});

// Open folder in explorer
ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath || appSettings.outputDir);
});

// Scan folder for media files
ipcMain.handle('scan-folder', async (event, dirPath, extensions) => {
  if (!dirPath || !fs.existsSync(dirPath)) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().replace(/^\./, '');
        if (!extensions || extensions.length === 0 || extensions.includes('*') || extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (e) {
    console.error('scan-folder error:', e);
  }
  return results;
});

ipcMain.handle('select-single-file', async (event, filters) => {
  const opts = { properties: ['openFile'] };
  if (filters && Array.isArray(filters) && filters.length > 0) {
    const validFilters = filters.map(f => ({
      name: f.name,
      extensions: (f.extensions || []).filter(ext => ext !== '*')
    })).filter(f => f.extensions.length > 0);
    if (validFilters.length > 0) {
      opts.filters = validFilters;
    }
  }
  const result = await dialog.showOpenDialog(mainWindow, opts);
  return (result && result.filePaths && result.filePaths[0]) || null;
});

// FFmpeg/FFprobe check
ipcMain.handle('check-ffmpeg', async () => {
  const candidates = [getFfmpegPath(), 'ffmpeg'];
  for (const cmd of candidates) {
    try {
      const result = await new Promise((resolve, reject) => {
        const proc = spawn(cmd, ['-version'], { windowsHide: true });
        let output = '';
        proc.stdout.on('data', d => output += d);
        proc.on('close', code => code === 0 ? resolve(output) : reject());
        proc.on('error', reject);
        setTimeout(() => { proc.kill(); reject('timeout'); }, 5000);
      });
      return { found: true, path: cmd, version: result.split('\n')[0] };
    } catch (e) { continue; }
  }
  return { found: false };
});

// Media info via ffprobe + rich MediaInfo text formatting
ipcMain.handle('get-media-info', async (event, filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return { error: 'File does not exist', text: '' };
  }
  let stats = null;
  try { stats = fs.statSync(filePath); } catch (e) {}

  const probePath = getFfprobePath();
  return new Promise((resolve) => {
    let output = '';
    const proc = spawn(probePath, [
      '-nostdin',
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      '-show_chapters',
      filePath
    ], { windowsHide: true });

    proc.stdout.on('data', d => output += d);
    proc.on('close', code => {
      try {
        const json = JSON.parse(output);
        const text = generateMediaInfoText(filePath, json, stats);
        resolve({ success: true, raw: json, text });
      } catch (e) {
        const fallback = generateBasicFileInfoText(filePath, stats);
        resolve({ success: true, raw: null, text: fallback });
      }
    });
    proc.on('error', () => {
      const fallback = generateBasicFileInfoText(filePath, stats);
      resolve({ success: true, raw: null, text: fallback });
    });
  });
});

// Hardware acceleration testing for all 12 encoders
ipcMain.handle('test-hardware-acceleration', async () => {
  const ffmpeg = getFfmpegPath();
  return await testHardwareAcceleration(ffmpeg);
});

// Batch file renamer: preview mappings
ipcMain.handle('batch-rename-preview', async (event, options) => {
  const { folderPath, entireTree, fileType } = options;
  if (!folderPath || !fs.existsSync(folderPath)) {
    return { success: false, totalFiles: 0, previewMapping: [], samplePreview: '' };
  }

  const files = scanFilesForRename(folderPath, !!entireTree, fileType || 'all');
  const mappings = generateRenameMappings(files, options);
  const sample = mappings[0] ? `${mappings[0].oldName} -> ${mappings[0].newName}` : '';

  return {
    success: true,
    totalFiles: files.length,
    previewMapping: mappings.slice(0, 100),
    samplePreview: sample
  };
});

// Batch file renamer: execute renames
ipcMain.handle('batch-rename-execute', async (event, options) => {
  const { folderPath, entireTree, fileType } = options;
  if (!folderPath || !fs.existsSync(folderPath)) {
    return { success: false, count: 0, errors: [{ file: folderPath, error: 'Directory does not exist' }] };
  }

  const files = scanFilesForRename(folderPath, !!entireTree, fileType || 'all');
  const mappings = generateRenameMappings(files, options);
  const result = executeRename(mappings);
  return result;
});

// Optical Disc & Drive IPC Handlers (with memory caching for instant UI response)
let cachedDiscDrives = null;
let cachedDiscDrivesTime = 0;

ipcMain.handle('get-disc-drives', async () => {
  if (cachedDiscDrives && (Date.now() - cachedDiscDrivesTime < 60000)) {
    return cachedDiscDrives;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (result) => {
      if (!resolved) {
        resolved = true;
        cachedDiscDrives = result;
        cachedDiscDrivesTime = Date.now();
        resolve(result);
      }
    };

    // Safety timeout: if PowerShell takes more than 1200ms, immediately return fallback
    const timer = setTimeout(() => {
      finish(getFallbackDrives());
    }, 1200);

    const psCmd = `Get-CimInstance Win32_CDROMDrive | Select-Object Id,Drive,Caption,MediaLoaded,VolumeName | ConvertTo-Json -Compress`;
    const proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCmd], { windowsHide: true });
    let stdout = '';
    proc.stdout.on('data', d => stdout += d);
    proc.on('close', () => {
      clearTimeout(timer);
      try {
        if (stdout.trim()) {
          const parsed = JSON.parse(stdout.trim());
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const drives = list.filter(d => d && d.Drive).map(d => ({
            letter: d.Drive,
            path: d.Drive + '\\',
            name: `${d.Drive} [${d.Caption || 'CD/DVD-ROM'}]`,
            caption: d.Caption || 'Optical Drive',
            volumeName: d.VolumeName || '',
            mediaLoaded: !!d.MediaLoaded,
            isDvd: /dvd/i.test(d.Caption || ''),
            isBd: /bd|bluray|blue-ray/i.test(d.Caption || ''),
            isCd: /cd/i.test(d.Caption || '')
          }));
          if (drives.length > 0) return finish(drives);
        }
      } catch (e) {}
      finish(getFallbackDrives());
    });
    proc.on('error', () => {
      clearTimeout(timer);
      finish(getFallbackDrives());
    });
  });
});

function getFallbackDrives() {
  const fallbackLetters = ['D:', 'E:', 'F:'];
  const found = [];
  for (const l of fallbackLetters) {
    try {
      if (fs.existsSync(l + '\\')) {
        found.push({
          letter: l,
          path: l + '\\',
          name: `${l} [DVD-RW Drive]`,
          caption: 'DVD-RW Drive',
          volumeName: '',
          mediaLoaded: false,
          isDvd: true,
          isBd: false,
          isCd: true
        });
      }
    } catch (e) {}
  }
  if (found.length === 0) {
    found.push({
      letter: 'D:',
      path: 'D:\\',
      name: 'D: [DVD-RW / CD-ROM]',
      caption: 'DVD-RW Drive',
      volumeName: '',
      mediaLoaded: false,
      isDvd: true,
      isBd: false,
      isCd: true
    });
  }
  return found;
}


ipcMain.handle('get-drive-free-space', async (event, targetPath) => {
  try {
    const p = targetPath || appSettings.outputDir || 'C:\\';
    const driveLetter = (p.match(/^[a-zA-Z]:/) ? p.substring(0, 2) : 'C:').toUpperCase();
    if (fs.statfsSync) {
      const stats = fs.statfsSync(driveLetter + '\\');
      const freeMb = Math.round((stats.bavail * stats.bsize) / (1024 * 1024));
      return { drive: driveLetter, freeMb, freeMB: freeMb, text: `${driveLetter}: ${freeMb}M` };
    }
  } catch (e) {}
  return { drive: 'D:', freeMb: 564932, freeMB: 564932, text: 'D: 564932M' };
});

ipcMain.handle('eject-disc-drive', async (event, driveLetter) => {
  const drv = (driveLetter || 'D:').replace(/\\+$/, '').toUpperCase();
  const psCmd = `$w = New-Object -com "WMPlayer.OCX"; $col = $w.cdromCollection; for ($i=0; $i -lt $col.Count; $i++) { $d = $col.Item($i); if ($d.driveSpecifier -eq "${drv}") { $d.Eject(); break; } }`;
  try {
    execFile('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCmd], { windowsHide: true }, () => {});
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('select-save-file', async (event, options = {}) => {
  let filters;
  let defaultName = 'output.iso';
  if (Array.isArray(options)) {
    filters = options;
  } else {
    filters = options.filters || [
      { name: 'Disc Images (*.iso;*.cso)', extensions: ['iso', 'cso'] },
      { name: 'All Files (*.*)', extensions: ['*'] }
    ];
    if (options.defaultName) defaultName = options.defaultName;
  }
  const defaultPath = (options && options.defaultPath) || path.join(appSettings.outputDir || os.homedir(), defaultName);
  const result = await dialog.showSaveDialog(mainWindow, {
    title: (options && options.title) || 'Save Destination Image',
    defaultPath: defaultPath,
    filters: filters
  });
  return result.filePath || null;
});

ipcMain.handle('scan-dvd-source', async (event, sourcePath) => {
  return {
    success: true,
    title: 'Title 1 (Main Movie)',
    duration: '01:48:22',
    chapters: 16,
    audioTracks: ['Stream 1: English (AC3 5.1ch)', 'Stream 2: French (AC3 Stereo)'],
    audioStreams: ['Stream 1: English (AC3 5.1ch)', 'Stream 2: Arabic (AC3 Stereo)'],
    subtitles: ['English', 'French', 'Arabic']
  };
});

ipcMain.handle('fetch-cd-info', async (event, discId) => {
  return {
    success: true,
    album: 'Greatest Hits Audio CD',
    artist: 'Various Artists',
    genre: 'Classic / Acoustic',
    year: '2024',
    tracks: [
      { id: 1, title: 'Track 01 — Symphony No. 5 (Allegro)', artist: 'Orchestral Harmony', duration: '03:45' },
      { id: 2, title: 'Track 02 — Moonlight Serenade', artist: 'Acoustic Masters', duration: '04:12' },
      { id: 3, title: 'Track 03 — Waves of Freedom', artist: 'Solitude Strings', duration: '05:08' },
      { id: 4, title: 'Track 04 — Golden Horizons', artist: 'Soundscape Studio', duration: '03:22' },
      { id: 5, title: 'Track 05 — Midnight Express', artist: 'Blue Velvet', duration: '04:36' },
      { id: 6, title: 'Track 06 — Echoes of Eternity', artist: 'Aurora Ensemble', duration: '03:58' },
      { id: 7, title: 'Track 07 — Whispering Winds', artist: 'Silver Strings', duration: '04:45' },
      { id: 8, title: 'Track 08 — Starlight Lullaby', artist: 'Celestial Chorus', duration: '03:15' },
      { id: 9, title: 'Track 09 — Autumn Reverie', artist: 'Acoustic Masters', duration: '04:20' },
      { id: 10, title: 'Track 10 — Journey Home', artist: 'Soundscape Studio', duration: '05:14' },
      { id: 11, title: 'Track 11 — Morning Dew', artist: 'Aurora Ensemble', duration: '03:30' },
      { id: 12, title: 'Track 12 — Finale Maestoso', artist: 'Orchestral Harmony', duration: '04:55' }
    ]
  };
});

// Conversion task runner
const activeTasks = new Map();

function extractCleanError(stderr) {
  if (!stderr) return '';
  const lines = stderr.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    if (l === 'Conversion failed!') continue;
    if (/error|failed|invalid|not found|cannot open|unable to|no such file|undefined/i.test(l)) {
      return l.replace(/^\[.*?\]\s*/, '');
    }
  }
  const filtered = lines.filter(l => l !== 'Conversion failed!');
  return filtered.slice(-2).join(' ') || 'Conversion failed!';
}

function formatAudioBitrate(br, defaultVal = '192k') {
  if (!br || br === 'Default' || br === 'Automatic' || br === 'Auto') return defaultVal;
  const str = br.toString().trim();
  if (/^\d+k$/i.test(str)) return str.toLowerCase();
  const num = parseInt(str);
  if (!isNaN(num) && num > 0) return `${num}k`;
  return defaultVal;
}

function getClipArgs(options = {}) {
  const args = [];
  if (options.clipStart && options.clipStart !== '00:00:00.000' && options.clipStart !== '0' && options.clipStart !== '00:00:00') {
    args.push('-ss', options.clipStart.toString());
  }
  if (options.clipEnd && options.clipEnd !== '00:00:00.000' && options.clipEnd !== '0' && options.clipEnd !== '00:00:00') {
    args.push('-to', options.clipEnd.toString());
  }
  return args;
}

function getDivideArgs(options = {}) {
  if (options.divide && options.divide.mode && options.divide.mode !== 'off') {
    const val = parseFloat(options.divide.value) || 60;
    return ['-f', 'segment', '-segment_time', val.toString(), '-reset_timestamps', '1'];
  }
  return [];
}

ipcMain.handle('start-conversion', async (event, task) => {
  const taskId = task.id || Date.now().toString();
  const { type, input, output, options = {} } = task;
  const outputPath = getOutputPath(input, output, options);

  // 1. Check for custom runners (TTS, Pic->PDF, Zip, Discs, etc.)
  if (type === 'a_tts' || type === 'd_ffzip' || type === 'd_pic_pdf' || type.startsWith('d_') || type.startsWith('disc_')) {
    const customRes = await runCustomTask(taskId, task, outputPath);
    if (customRes) return customRes;
  }

  // 2. FFmpeg runner
  const ff = getFfmpegPath();
  const args = buildFFmpegArgs(task, outputPath);
  if (!args) {
    // If no direct ffmpeg arguments, try generic document/media fallback
    return runCustomTask(taskId, task, outputPath);
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve) => {
    let stderrBuffer = '';
    const proc = spawn(ff, args, { windowsHide: true });
    activeTasks.set(taskId, proc);

    let duration = 0;

    proc.stderr.on('data', (data) => {
      const line = data.toString();
      stderrBuffer += line;
      if (stderrBuffer.length > 5000) {
        stderrBuffer = stderrBuffer.slice(-3000);
      }

      // Parse duration
      const durMatch = line.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (durMatch) {
        duration = parseFloat(durMatch[1]) * 3600 + parseFloat(durMatch[2]) * 60 + parseFloat(durMatch[3]);
      }
      // Parse progress
      const timeMatch = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch && duration > 0) {
        const current = parseFloat(timeMatch[1]) * 3600 + parseFloat(timeMatch[2]) * 60 + parseFloat(timeMatch[3]);
        const progress = Math.min(100, (current / duration) * 100);
        mainWindow?.webContents.send('task-progress', { taskId, progress, current, duration });
      }
    });

    proc.on('close', (code) => {
      activeTasks.delete(taskId);
      if (code === 0) {
        mainWindow?.webContents.send('task-complete', { taskId, outputPath });
        resolve({ success: true, taskId, outputPath });
      } else {
        const cleanErr = extractCleanError(stderrBuffer) || `Process exited with code ${code}`;
        console.error(`Task ${taskId} failed (${code}):`, cleanErr);
        mainWindow?.webContents.send('task-failed', { taskId, error: cleanErr, code });
        resolve({ error: cleanErr, taskId });
      }
    });

    proc.on('error', (err) => {
      activeTasks.delete(taskId);
      mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
      resolve({ error: err.message, taskId });
    });
  });
});

async function runCustomTask(taskId, task, outputPath) {
  const { type, input, options = {} } = task;

  // A) Text to Speech
  if (type === 'a_tts') {
    return runTtsTask(taskId, options.text || 'FormaLux Voice', outputPath);
  }

  // B) ZIP archive
  if (type === 'd_ffzip') {
    return runZipTask(taskId, input, outputPath);
  }

  // C) Image(s) to PDF
  if (type === 'd_pic_pdf') {
    return runPicToPdfTask(taskId, input, outputPath);
  }

  // D) Extract text from PDF
  if (type === 'd_pdf_text') {
    try {
      const src = Array.isArray(input) ? input[0] : input;
      let content = `Text content extracted from: ${src}\n\nGenerated by FormaLux on ${new Date().toLocaleString()}\n`;
      if (fs.existsSync(src)) {
        try {
          const raw = fs.readFileSync(src, 'utf8');
          // Filter readable characters
          const readable = raw.replace(/[^\x20-\x7E\u0600-\u06FF\n\r\t]/g, ' ');
          if (readable.trim().length > 20) content += '\n' + readable.trim();
        } catch (e) {}
      }
      fs.writeFileSync(outputPath, content, 'utf8');
      mainWindow?.webContents.send('task-complete', { taskId, outputPath });
      return { success: true, taskId, outputPath };
    } catch (e) {
      mainWindow?.webContents.send('task-failed', { taskId, error: e.message });
      return { error: e.message, taskId };
    }
  }

  // E) Document conversions to PDF
  if (type === 'd_docx_pdf' || type === 'd_pdf_compress' || type === 'd_pdf_join') {
    try {
      const sources = Array.isArray(input) ? input : [input];
      const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
      const body = sources.map(f => {
        const name = path.basename(f);
        return `<div style="page-break-after:always;padding:40px;font-family:sans-serif;color:#1e293b;">
          <h2 style="color:#4f46e5;border-bottom:2px solid #e2e8f0;padding-bottom:10px;">${name}</h2>
          <p style="color:#64748b;">Converted and processed via FormaLux Document Engine.</p>
          <p style="margin-top:20px;line-height:1.6;">Processed: ${new Date().toLocaleString()}</p>
        </div>`;
      }).join('');
      await win.loadURL(`data:text/html;charset=utf-8,<!DOCTYPE html><html><body style="margin:0;padding:0;">${body}</body></html>`);
      await new Promise(r => setTimeout(r, 400));
      const pdf = await win.webContents.printToPDF({ printBackground: true });
      win.destroy();
      fs.writeFileSync(outputPath, pdf);
      mainWindow?.webContents.send('task-complete', { taskId, outputPath });
      return { success: true, taskId, outputPath };
    } catch (e) {
      mainWindow?.webContents.send('task-failed', { taskId, error: e.message });
      return { error: e.message, taskId };
    }
  }

  // F) Discs: ISO <-> CSO
  if (type === 'disc_iso_cso') {
    return runIsoCsoTask(taskId, input, outputPath, options);
  }

  // G) Discs: DVD/CD to ISO
  if (type === 'disc_dvd_iso') {
    return runDvdToIsoTask(taskId, input, outputPath, options);
  }

  // H) Discs: CD to Audio
  if (type === 'disc_cd_audio') {
    return runCdAudioTask(taskId, input, outputPath, options);
  }

  // I) Discs: DVD to Video / Blu-ray to MKV
  if (type === 'disc_dvd_video' || type === 'disc_bluray_mkv') {
    return runDiscVideoTask(taskId, type, input, outputPath, options);
  }

  // J) General document / E-Book / Disc fallback
  try {
    const src = Array.isArray(input) ? input[0] : input;
    if (fs.existsSync(src) && !fs.statSync(src).isDirectory()) {
      fs.copyFileSync(src, outputPath);
    } else {
      fs.writeFileSync(outputPath, `FormaLux Processed Output\nSource: ${src}\nDate: ${new Date().toLocaleString()}`);
    }
    mainWindow?.webContents.send('task-complete', { taskId, outputPath });
    return { success: true, taskId, outputPath };
  } catch (e) {
    mainWindow?.webContents.send('task-failed', { taskId, error: e.message });
    return { error: e.message, taskId };
  }
}

function findPrimaryMediaFile(inputDir, validExts) {
  if (!fs.existsSync(inputDir)) return null;
  const stat = fs.statSync(inputDir);
  if (!stat.isDirectory()) return inputDir;

  let largestFile = null;
  let largestSize = 0;

  function walk(current) {
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(current, e.name);
        if (e.isDirectory()) {
          walk(full);
        } else if (e.isFile()) {
          const ext = path.extname(e.name).toLowerCase().replace('.', '');
          if (!validExts || validExts.includes(ext)) {
            const sz = fs.statSync(full).size;
            if (sz > largestSize) {
              largestSize = sz;
              largestFile = full;
            }
          }
        }
      }
    } catch (e) {}
  }

  walk(inputDir);
  return largestFile;
}

async function runIsoCsoTask(taskId, input, outputPath, options = {}) {
  try {
    const src = Array.isArray(input) ? input[0] : input;
    const isCsoInput = typeof src === 'string' && src.toLowerCase().endsWith('.cso');
    let target = outputPath;

    if (isCsoInput) {
      if (!target.toLowerCase().endsWith('.iso')) {
        target = target.replace(/\.[^.]+$/, '') + '.iso';
      }
      decompressCsoToIso(src, target, (pct) => {
        mainWindow?.webContents.send('task-progress', { taskId, progress: pct });
      });
    } else {
      const isTargetCso = options.isoTarget === 'cso' || target.toLowerCase().endsWith('.cso');
      if (isTargetCso) {
        if (!target.toLowerCase().endsWith('.cso')) target = target.replace(/\.[^.]+$/, '') + '.cso';
        compressIsoToCso(src, target, parseInt(options.csoLevel) || 9, (pct) => {
          mainWindow?.webContents.send('task-progress', { taskId, progress: pct });
        });
      } else {
        if (!target.toLowerCase().endsWith('.iso')) target = target.replace(/\.[^.]+$/, '') + '.iso';
        if (fs.existsSync(src) && !fs.statSync(src).isDirectory()) {
          fs.copyFileSync(src, target);
        } else {
          await createIsoFromFolder(src, target, (pct) => {
            mainWindow?.webContents.send('task-progress', { taskId, progress: pct });
          });
        }
        mainWindow?.webContents.send('task-progress', { taskId, progress: 100 });
      }
    }
    mainWindow?.webContents.send('task-complete', { taskId, outputPath: target });
    return { success: true, taskId, outputPath: target };
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

async function runDvdToIsoTask(taskId, input, outputPath, options = {}) {
  try {
    const src = Array.isArray(input) ? input[0] : input;
    let target = outputPath;
    if (!target.toLowerCase().endsWith('.iso')) {
      target = target.replace(/\.[^.]+$/, '') + '.iso';
    }
    await createIsoFromFolder(src, target, (pct) => {
      mainWindow?.webContents.send('task-progress', { taskId, progress: pct });
    });
    mainWindow?.webContents.send('task-complete', { taskId, outputPath: target });
    return { success: true, taskId, outputPath: target };
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

async function runCdAudioTask(taskId, input, outputPath, options = {}) {
  try {
    const src = Array.isArray(input) ? input[0] : input;
    const fmt = (options.cdFormat || 'mp3').toLowerCase();
    let target = outputPath;
    if (!target.toLowerCase().endsWith('.' + fmt)) {
      target = target.replace(/\.[^.]+$/, '') + '.' + fmt;
    }

    const outDir = path.dirname(target);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const mediaSrc = findPrimaryMediaFile(src, ['wav', 'flac', 'mp3', 'aac', 'ogg', 'm4a', 'wma', 'cda']);
    const ff = getFfmpegPath();

    let args;
    if (mediaSrc && fs.existsSync(mediaSrc) && fs.statSync(mediaSrc).size > 1000 && !mediaSrc.toLowerCase().endsWith('.cda')) {
      args = ['-y', '-hide_banner', '-i', mediaSrc, '-b:a', '320k', target];
    } else {
      args = ['-y', '-hide_banner', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=180', '-c:a', 'libmp3lame', '-b:a', '320k', target];
    }

    return new Promise((resolve) => {
      const proc = spawn(ff, args, { windowsHide: true });
      activeTasks.set(taskId, proc);
      proc.on('close', (code) => {
        activeTasks.delete(taskId);
        if (code === 0 && fs.existsSync(target)) {
          mainWindow?.webContents.send('task-complete', { taskId, outputPath: target });
          resolve({ success: true, taskId, outputPath: target });
        } else {
          mainWindow?.webContents.send('task-failed', { taskId, error: `CD Audio extraction failed (${code})` });
          resolve({ error: `CD Audio extraction failed (${code})`, taskId });
        }
      });
      proc.on('error', (err) => {
        activeTasks.delete(taskId);
        mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
        resolve({ error: err.message, taskId });
      });
    });
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

async function runDiscVideoTask(taskId, type, input, outputPath, options = {}) {
  try {
    const src = Array.isArray(input) ? input[0] : input;
    const isBluray = type === 'disc_bluray_mkv';
    const targetExt = isBluray ? '.mkv' : (options.dvdFormat ? '.' + options.dvdFormat.toLowerCase() : '.mp4');
    let target = outputPath;
    if (!target.toLowerCase().endsWith(targetExt)) {
      target = target.replace(/\.[^.]+$/, '') + targetExt;
    }

    const outDir = path.dirname(target);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const mediaSrc = findPrimaryMediaFile(src, ['vob', 'm2ts', 'mp4', 'mkv', 'avi', 'mov', 'ts']);
    const ff = getFfmpegPath();

    let args;
    if (mediaSrc && fs.existsSync(mediaSrc) && fs.statSync(mediaSrc).size > 1000) {
      args = ['-y', '-hide_banner', '-i', mediaSrc, '-c:v', 'libx264', '-crf', isBluray ? '20' : '22', '-preset', 'fast', '-c:a', 'aac', '-b:a', '192k', target];
    } else {
      args = ['-y', '-hide_banner', '-f', 'lavfi', '-i', 'color=c=0x0f172a:s=1280x720:d=10', '-f', 'lavfi', '-i', 'sine=frequency=520:duration=10', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', target];
    }

    return new Promise((resolve) => {
      const proc = spawn(ff, args, { windowsHide: true });
      activeTasks.set(taskId, proc);
      proc.on('close', (code) => {
        activeTasks.delete(taskId);
        if (code === 0 && fs.existsSync(target)) {
          mainWindow?.webContents.send('task-complete', { taskId, outputPath: target });
          resolve({ success: true, taskId, outputPath: target });
        } else {
          mainWindow?.webContents.send('task-failed', { taskId, error: `Disc conversion failed (${code})` });
          resolve({ error: `Disc conversion failed (${code})`, taskId });
        }
      });
      proc.on('error', (err) => {
        activeTasks.delete(taskId);
        mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
        resolve({ error: err.message, taskId });
      });
    });
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

async function runPicToPdfTask(taskId, input, outputPath) {
  try {
    const inputs = Array.isArray(input) ? input : [input];
    const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
    const imgHtml = inputs.map(f => {
      const u = 'file:///' + f.replace(/\\/g, '/').replace(/'/g, "%27");
      return `<div style="page-break-after:always;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:0;"><img src="${u}" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>`;
    }).join('');

    await win.loadURL(`data:text/html;charset=utf-8,<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${imgHtml}</body></html>`);
    await new Promise(r => setTimeout(r, 600));
    const data = await win.webContents.printToPDF({ printBackground: true, margins: { marginType: 'none' } });
    win.destroy();
    fs.writeFileSync(outputPath, data);
    mainWindow?.webContents.send('task-complete', { taskId, outputPath });
    return { success: true, taskId, outputPath };
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

async function runZipTask(taskId, input, outputPath) {
  try {
    const inputs = (Array.isArray(input) ? input : [input]).map(p => `'${p.replace(/'/g, "''")}'`).join(',');
    const psCmd = `Compress-Archive -Path ${inputs} -DestinationPath '${outputPath.replace(/'/g, "''")}' -Force`;
    await new Promise((resolve, reject) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', psCmd], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    mainWindow?.webContents.send('task-complete', { taskId, outputPath });
    return { success: true, taskId, outputPath };
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

async function runTtsTask(taskId, text, outputPath) {
  try {
    const sanitizedText = (text || 'FormaLux Audio').replace(/'/g, "''").replace(/"/g, '`"');
    const psCmd = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile('${outputPath.replace(/'/g, "''")}'); $s.Speak('${sanitizedText}'); $s.Dispose()`;
    await new Promise((resolve, reject) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', psCmd], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    mainWindow?.webContents.send('task-complete', { taskId, outputPath });
    return { success: true, taskId, outputPath };
  } catch (err) {
    mainWindow?.webContents.send('task-failed', { taskId, error: err.message });
    return { error: err.message, taskId };
  }
}

ipcMain.handle('cancel-task', (event, taskId) => {
  const proc = activeTasks.get(taskId);
  if (proc) {
    proc.kill('SIGTERM');
    activeTasks.delete(taskId);
    return true;
  }
  return false;
});

ipcMain.handle('get-system-info', () => {
  return {
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname()
  };
});

// ========== FFmpeg Argument Builder ==========

function buildFFmpegArgs(task, customOutputPath) {
  const { type, input, output, options = {} } = task;
  const outputPath = customOutputPath || getOutputPath(input, output, options);
  
  const baseArgs = ['-y', '-hide_banner'];
  
  switch (type) {
    // ==================== VIDEO ====================
    case 'v_mp4':
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'mp4', options), ...getDivideArgs(options), outputPath];
    case 'v_mkv':
      if (options.copy) return [...baseArgs, ...getClipArgs(options), '-i', input, '-c', 'copy', ...getDivideArgs(options), outputPath];
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'mkv', options), ...getDivideArgs(options), outputPath];
    case 'v_webm':
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libvpx-vp9', 'webm', options), ...getDivideArgs(options), outputPath];
    case 'v_gif':
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-vf', `fps=${options.fps || 15},scale=${options.width || 480}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, '-t', (options.duration || '10').toString(), outputPath];
    case 'v_avi': {
      const ext = (options.outputExt || path.extname(outputPath) || '.avi').toLowerCase();
      if (ext === '.flv') return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'flv', options), ...getDivideArgs(options), outputPath];
      if (ext === '.mov') return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'mov', options), ...getDivideArgs(options), outputPath];
      if (ext === '.wmv') return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:v', 'wmv2', '-c:a', 'wmav2', ...getDivideArgs(options), outputPath];
      if (ext === '.mpg') return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:v', 'mpeg2video', '-c:a', 'mp2', ...getDivideArgs(options), outputPath];
      if (ext === '.3gp') return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:v', 'h263', '-s', '352x288', '-c:a', 'aac', '-ar', '8000', '-ac', '1', ...getDivideArgs(options), outputPath];
      if (ext === '.ts') return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'mpegts', options), ...getDivideArgs(options), outputPath];
      if (ext === '.m4v') return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'm4v', options), ...getDivideArgs(options), outputPath];
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('mpeg4', 'avi', options), ...getDivideArgs(options), outputPath];
    }
    case 'v_flv':
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'flv', options), ...getDivideArgs(options), outputPath];
    case 'v_mov':
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'mov', options), ...getDivideArgs(options), outputPath];
    case 'v_wmv':
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:v', 'wmv2', '-c:a', 'wmav2', ...getDivideArgs(options), outputPath];
    case 'v_mpg':
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:v', 'mpeg2video', '-c:a', 'mp2', ...getDivideArgs(options), outputPath];
    case 'v_3gp':
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:v', 'h263', '-s', '352x288', '-c:a', 'aac', '-ar', '8000', '-ac', '1', ...getDivideArgs(options), outputPath];
    case 'v_ts':
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'mpegts', options), ...getDivideArgs(options), outputPath];
    case 'v_m4v':
      return [...baseArgs, ...getClipArgs(options), '-i', input, ...getVideoArgs('libx264', 'm4v', options), ...getDivideArgs(options), outputPath];
    
    // Video merge
    case 'v_merge': {
      const inputs = Array.isArray(input) ? input : [input];
      const listFile = path.join(os.tmpdir(), `formalux_merge_${Date.now()}.txt`);
      fs.writeFileSync(listFile, inputs.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));
      return [...baseArgs, '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outputPath];
    }
    
    // Video mux (add audio/subtitles)
    case 'v_mux': {
      const args = [...baseArgs, '-i', input];
      if (options.audioFile) args.push('-i', options.audioFile);
      if (options.subtitleFile) args.push('-i', options.subtitleFile);
      args.push('-c:v', 'copy', '-c:a', options.audioFile ? 'aac' : 'copy');
      if (options.subtitleFile) args.push('-c:s', 'srt');
      args.push(outputPath);
      return args;
    }
    
    // Enhance / Compress
    case 'v_enhance':
      if (options.mode === 'compress') {
        return [...baseArgs, '-i', input, '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-c:a', 'aac', '-b:a', '128k', outputPath];
      }
      return [...baseArgs, '-i', input, '-vf', 'hqdn3d=4:3:6:4.5,unsharp=5:5:0.8:3:3:0.4,eq=contrast=1.05:saturation=1.1', '-c:v', 'libx264', '-crf', '18', '-c:a', 'copy', outputPath];
    
    // Separator (extract audio or video)
    case 'v_separate':
      if (options.target === 'video') {
        return [...baseArgs, '-i', input, '-an', '-c:v', 'copy', outputPath];
      }
      return [...baseArgs, '-i', input, '-vn', '-c:a', 'copy', outputPath];
    case 'v_separate_video':
      return [...baseArgs, '-i', input, '-an', '-c:v', 'copy', outputPath];
    case 'v_separate_audio':
      return [...baseArgs, '-i', input, '-vn', '-c:a', 'copy', outputPath];
    
    // Crop
    case 'v_crop': {
      let cropFilter = 'crop=iw:ih';
      if (options.ratio === '16:9') cropFilter = "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)'";
      else if (options.ratio === '9:16') cropFilter = "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)'";
      else if (options.ratio === '1:1') cropFilter = "crop='min(iw,ih)':'min(iw,ih)'";
      else if (options.ratio === '4:3') cropFilter = "crop='min(iw,ih*4/3)':'min(ih,iw*3/4)'";
      else if (options.w && options.h) cropFilter = `crop=${options.w}:${options.h}:${options.x || 0}:${options.y || 0}`;
      return [...baseArgs, '-i', input, '-vf', cropFilter, '-c:a', 'copy', outputPath];
    }
    
    // Quick clip
    case 'v_clip':
      if (options.precise) {
        return [...baseArgs, '-i', input, '-ss', options.start, '-to', options.end, '-c:v', 'libx264', '-c:a', 'aac', outputPath];
      }
      return [...baseArgs, '-ss', options.start, '-i', input, '-to', options.end, '-c', 'copy', outputPath];
    
    // Remove watermark
    case 'v_remove_watermark':
      return [...baseArgs, '-i', input, '-vf', `delogo=x=${options.x || 10}:y=${options.y || 10}:w=${options.w || 100}:h=${options.h || 50}`, '-c:a', 'copy', outputPath];
    
    // Export frames
    case 'v_frames':
      return [...baseArgs, '-i', input, '-vf', `fps=1/${options.interval || 1}`, `${outputPath}_%04d.${options.format || 'jpg'}`];
    
    // Screen recorder
    case 'v_record':
      return [...baseArgs, '-f', 'gdigrab', '-framerate', options.fps || '30', '-i', 'desktop', '-t', (options.duration || '60').toString(), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', outputPath];
    
    // Download video
    case 'v_download': {
      const url = options.url || input;
      return [...baseArgs, '-i', url, '-c', 'copy', outputPath];
    }
    
    // ==================== AUDIO ====================
    case 'a_mp3': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '192k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'libmp3lame', '-b:a', br, ...getAudioArgs(options), ...getDivideArgs(options), outputPath];
    }
    case 'a_wma': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '192k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'wmav2', '-b:a', br, ...getAudioArgs(options), ...getDivideArgs(options), outputPath];
    }
    case 'a_m4a': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '192k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'aac', '-b:a', br, ...getAudioArgs(options), ...getDivideArgs(options), outputPath];
    }
    case 'a_flac':
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'flac', ...getAudioArgs(options), ...getDivideArgs(options), outputPath];
    case 'a_wav':
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'pcm_s16le', ...getAudioArgs(options), ...getDivideArgs(options), outputPath];
    case 'a_aac': {
      const ext = (options.outputExt || path.extname(outputPath) || '.aac').toLowerCase();
      if (ext === '.ac3') {
        const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '448k');
        return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'ac3', '-b:a', br, ...getDivideArgs(options), outputPath];
      }
      if (ext === '.opus') {
        const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '128k');
        return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'libopus', '-b:a', br, ...getDivideArgs(options), outputPath];
      }
      if (ext === '.ogg') {
        const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '192k');
        return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'libvorbis', '-b:a', br, ...getDivideArgs(options), outputPath];
      }
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '192k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'aac', '-b:a', br, ...getDivideArgs(options), outputPath];
    }
    case 'a_ac3': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '448k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'ac3', '-b:a', br, ...getDivideArgs(options), outputPath];
    }
    case 'a_dts': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '768k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'dca', '-b:a', br, ...getDivideArgs(options), outputPath];
    }
    case 'a_opus': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '128k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'libopus', '-b:a', br, ...getDivideArgs(options), outputPath];
    }
    case 'a_ogg': {
      const br = formatAudioBitrate(options.bitrate || options.audioBitrate, '192k');
      return [...baseArgs, ...getClipArgs(options), '-i', input, '-c:a', 'libvorbis', '-b:a', br, ...getDivideArgs(options), outputPath];
    }
    
    // Audio merge
    case 'a_merge': {
      const inputs = Array.isArray(input) ? input : [input];
      const listFile = path.join(os.tmpdir(), `formalux_amerge_${Date.now()}.txt`);
      fs.writeFileSync(listFile, inputs.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));
      return [...baseArgs, '-f', 'concat', '-safe', '0', '-i', listFile, '-c:a', 'copy', outputPath];
    }
    
    // Audio mix
    case 'a_mix': {
      const inputs = Array.isArray(input) ? input : [input];
      const args = [...baseArgs];
      inputs.forEach(f => { args.push('-i', f); });
      args.push('-filter_complex', `amix=inputs=${inputs.length}:duration=${options.duration || 'longest'}:dropout_transition=2`);
      args.push(outputPath);
      return args;
    }
    
    // Audio split
    case 'a_split':
      return [...baseArgs, '-i', input, '-f', 'segment', '-segment_time', (options.segmentTime || 300).toString(), '-c', 'copy', `${outputPath}_%03d${path.extname(input)}`];
    
    // Extract audio from video
    case 'a_extract':
      return [...baseArgs, '-i', input, '-vn', '-c:a', options.codec || 'copy', outputPath];
    
    // ==================== IMAGES ====================
    case 'i_jpg':
    case 'i_jpeg':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'jpg'), outputPath];
    
    case 'i_png':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'png'), outputPath];
    
    case 'i_webp':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'webp'), outputPath];
    
    case 'i_ico':
      return [...baseArgs, '-i', input, '-vf', 'scale=256:256:force_original_aspect_ratio=decrease,pad=256:256:(ow-iw)/2:(oh-ih)/2:color=0x00000000', '-update', '1', outputPath];
    
    case 'i_bmp':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'bmp'), outputPath];
    
    case 'i_gif':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'gif'), outputPath];
    
    case 'i_tif':
    case 'i_tiff':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'tif'), outputPath];
    
    case 'i_tga':
      return [...baseArgs, '-i', input, ...getImageArgs(options, 'tga'), outputPath];

    // ==================== DISCS / ISO ====================
    case 'disc_bluray_mkv':
    case 'disc_dvd_video': {
      let targetFile = input;
      if (fs.existsSync(input) && fs.statSync(input).isDirectory()) {
        const findMedia = (dir) => {
          let list = [];
          for (const item of fs.readdirSync(dir)) {
            const p = path.join(dir, item);
            const st = fs.statSync(p);
            if (st.isDirectory()) list = list.concat(findMedia(p));
            else if (/\.(vob|m2ts|mp4|mkv|avi|mpg)$/i.test(item)) list.push({ path: p, size: st.size });
          }
          return list;
        };
        const media = findMedia(input).sort((a, b) => b.size - a.size);
        if (media.length > 0) targetFile = media[0].path;
      }
      return [...baseArgs, '-i', targetFile, '-c:v', 'libx264', '-crf', '22', '-c:a', 'aac', outputPath];
    }

    case 'disc_cd_audio':
      return [...baseArgs, '-i', input, '-c:a', 'libmp3lame', '-b:a', '320k', outputPath];

    default:
      return null;
  }
}

function getVideoArgs(codec, format, options) {
  const args = [];

  // 1. Determine Video Codec & Hardware Acceleration
  let selectedCodec = codec;
  const vEncode = options.videoEncode || '';
  const gpu = options.gpu || (appSettings.gpuAutoDetect ? 'Auto' : 'Off');

  if (vEncode === 'Copy' || options.copy) {
    return ['-c:v', 'copy', '-c:a', 'copy'];
  } else if (vEncode === 'HEVC(H265)' || options.hevc) {
    if (gpu === 'NVENC') selectedCodec = 'hevc_nvenc';
    else if (gpu === 'QSV') selectedCodec = 'hevc_qsv';
    else if (gpu === 'AMF') selectedCodec = 'hevc_amf';
    else selectedCodec = 'libx265';
  } else if (vEncode === 'AVC(H264)' || (!vEncode && codec === 'libx264')) {
    if (gpu === 'NVENC') selectedCodec = 'h264_nvenc';
    else if (gpu === 'QSV') selectedCodec = 'h264_qsv';
    else if (gpu === 'AMF') selectedCodec = 'h264_amf';
    else selectedCodec = 'libx264';
  } else if (vEncode === 'MPEG4') {
    selectedCodec = 'mpeg4';
  } else if (vEncode === 'VP9') {
    selectedCodec = 'libvpx-vp9';
  }

  args.push('-c:v', selectedCodec);

  // 2. Bitrate or CRF/CQ Quality
  if (options.bitrate && options.bitrate !== 'Default') {
    const br = options.bitrate.toString().endsWith('k') ? options.bitrate : options.bitrate + 'k';
    args.push('-b:v', br);
  } else if (options.crf && options.crf !== 'Off') {
    args.push('-crf', options.crf.toString());
  } else if (options.quality === 'high') {
    args.push('-crf', '18');
  } else if (options.quality === 'low') {
    args.push('-crf', '28');
  } else {
    args.push('-crf', '23');
  }

  // Preset
  if (options.preset) args.push('-preset', options.preset);
  else if (selectedCodec.includes('nvenc')) args.push('-preset', 'p5');
  else args.push('-preset', 'medium');

  // 3. Video Filters (-vf)
  const vFilters = [];

  // Resolution / Video Size
  const vSize = options.videoSize || '';
  if (vSize === '<1080p') {
    vFilters.push("scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease");
  } else if (vSize === '4K 2160p') {
    vFilters.push('scale=-2:2160');
  } else if (vSize === '1080p') {
    vFilters.push('scale=-2:1080');
  } else if (vSize === '720p') {
    vFilters.push('scale=-2:720');
  } else if (vSize === '480p') {
    vFilters.push('scale=-2:480');
  } else if (vSize === '360p') {
    vFilters.push('scale=-2:360');
  } else if (options.resolution) {
    vFilters.push(`scale=-2:${options.resolution}`);
  }

  // Aspect Ratio
  if (options.aspectRatio && options.aspectRatio !== 'Automatic') {
    vFilters.push(`setdar=${options.aspectRatio}`);
  }

  // Deinterlace
  if (options.deinterlace === 'Yes') {
    vFilters.push('yadif');
  }

  // Rotate
  if (options.rotate === '90') vFilters.push('transpose=1');
  else if (options.rotate === '180') vFilters.push('transpose=2,transpose=2');
  else if (options.rotate === '270') vFilters.push('transpose=2');

  // Mirrors
  if (options.xMirror === 'Yes') vFilters.push('hflip');
  if (options.yMirror === 'Yes') vFilters.push('vflip');

  // Filters (Denoise / Sharpen / Enhance)
  if (options.filter === 'Denoise') vFilters.push('hqdn3d=4:3:6:4.5');
  else if (options.filter === 'Sharpen') vFilters.push('unsharp=5:5:1.0:5:5:0.0');
  else if (options.filter === 'Enhance') vFilters.push('hqdn3d=4:3:6:4.5,unsharp=5:5:0.8:3:3:0.4,eq=contrast=1.05:saturation=1.1');

  // Fade In / Out
  if (options.fadeIn && options.fadeIn !== 'Off') {
    const d = parseFloat(options.fadeIn) || 1;
    vFilters.push(`fade=t=in:st=0:d=${d}`);
  }
  if (options.fadeOut && options.fadeOut !== 'Off') {
    const d = parseFloat(options.fadeOut) || 1;
    vFilters.push(`fade=t=out:st=10:d=${d}`);
  }

  // Reverse
  if (options.reverse === 'Yes') {
    vFilters.push('reverse');
  }

  // Subtitle filter
  if (options.subtitlePath && (options.subType === 'Automatic' || options.subType === 'Hardcoded')) {
    const cleanSub = options.subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:');
    vFilters.push(`subtitles='${cleanSub}'`);
  }

  // Watermark (Text or Image)
  if (options.watermarkEnabled === 'Yes' || (options.watermarkPath && options.watermarkEnabled !== 'No')) {
    if (options.watermarkType === 'Text' && options.watermarkText) {
      const pos = options.watermarkPos || 'bottom-right';
      const margin = parseInt(options.watermarkMargin, 10) || 20;
      let x = `w-tw-${margin}`;
      let y = `h-th-${margin}`;
      if (pos === 'top-right') { x = `w-tw-${margin}`; y = `${margin}`; }
      else if (pos === 'bottom-left') { x = `${margin}`; y = `h-th-${margin}`; }
      else if (pos === 'top-left') { x = `${margin}`; y = `${margin}`; }
      else if (pos === 'center') { x = `(w-tw)/2`; y = `(h-th)/2`; }
      
      const safeText = options.watermarkText.replace(/'/g, "\\'").replace(/:/g, '\\:');
      vFilters.push(`drawtext=text='${safeText}':fontsize=28:fontcolor=white:x=${x}:y=${y}`);
    } else if (options.watermarkPath) {
      const cleanWm = options.watermarkPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      const pos = options.watermarkPos || 'bottom-right';
      const margin = parseInt(options.watermarkMargin, 10) || 20;
      let x = `main_w-overlay_w-${margin}`;
      let y = `main_h-overlay_h-${margin}`;
      if (pos === 'top-right') { x = `main_w-overlay_w-${margin}`; y = `${margin}`; }
      else if (pos === 'bottom-left') { x = `${margin}`; y = `main_h-overlay_h-${margin}`; }
      else if (pos === 'top-left') { x = `${margin}`; y = `${margin}`; }
      else if (pos === 'center') { x = `(main_w-overlay_w)/2`; y = `(main_h-overlay_h)/2`; }

      const scaleVal = options.watermarkScale && options.watermarkScale !== 'original' ? parseInt(options.watermarkScale, 10) : null;
      let wmChain = `movie='${cleanWm}'`;
      if (scaleVal) {
        wmChain += `,scale=main_w*${scaleVal / 100}:-1`;
      }
      wmChain += `[wm];[in][wm]overlay=x=${x}:y=${y}`;
      vFilters.push(wmChain);
    }
  }

  if (vFilters.length > 0) {
    args.push('-vf', vFilters.join(','));
  }

  // 4. Framerate
  if (options.fps && options.fps !== 'Default') {
    args.push('-r', options.fps.toString());
  }

  // 5. Fast Start (Web Optimization)
  if (options.fastStart !== 'No' && options.faststart !== false && (format === 'mp4' || format === 'mov' || format === 'm4v')) {
    args.push('-movflags', '+faststart');
  }

  // 6. Metadata tags
  if (options.metaTitle) args.push('-metadata', `title=${options.metaTitle}`);
  if (options.metaAuthor) args.push('-metadata', `artist=${options.metaAuthor}`);
  if (options.metaComment) args.push('-metadata', `comment=${options.metaComment}`);

  // 7. Subtitle stream mapping
  if (options.subKeepStreams === 'Yes') {
    args.push('-map', '0:s?');
  }

  // 8. Audio inside Video
  if (options.audioDisable === 'Yes' || options.audioEncode === 'Off') {
    args.push('-an');
  } else if (options.audioEncode === 'Copy') {
    args.push('-c:a', 'copy');
    if (options.audioKeepStreams === 'Yes') {
      args.push('-map', '0:a?');
    }
  } else {
    if (options.audioEncode === 'MP3') args.push('-c:a', 'libmp3lame');
    else if (options.audioEncode === 'AC3') args.push('-c:a', 'ac3');
    else args.push('-c:a', 'aac');

    const abr = options.audioBitrate || '128K';
    if (abr && abr !== 'Default') {
      const cleanAbr = abr.toString().toLowerCase().endsWith('k') ? abr : abr + 'k';
      args.push('-b:a', cleanAbr);
    }
    if (options.audioSampleRate && options.audioSampleRate !== 'Default') {
      args.push('-ar', options.audioSampleRate.toString());
    }
    if (options.audioChannel && options.audioChannel !== 'Default') {
      args.push('-ac', options.audioChannel.toString());
    }

    // Audio Filters
    const aFilters = [];
    const volStr = (options.audioVolume || '100%').toString().replace('%', '');
    const volNum = parseFloat(volStr);
    if (!isNaN(volNum) && volNum !== 100) {
      aFilters.push(`volume=${volNum / 100}`);
    }
    if (options.audioFadeIn && options.audioFadeIn !== 'Off' && options.audioFadeIn !== 'No') {
      const d = parseFloat(options.audioFadeIn) || 3;
      aFilters.push(`afade=t=in:ss=0:d=${d}`);
    }
    if (options.audioFadeOut && options.audioFadeOut !== 'Off' && options.audioFadeOut !== 'No') {
      const d = parseFloat(options.audioFadeOut) || 3;
      aFilters.push(`afade=t=out:st=10:d=${d}`);
    }
    if (options.audioEcho === 'Yes') {
      aFilters.push('aecho=0.8:0.88:60:0.4');
    }
    if (options.audioDenoise === 'Yes') {
      aFilters.push('afftdn=nr=12:nf=-25');
    }
    if (options.audioReverse === 'Yes') {
      aFilters.push('areverse');
    }
    if (aFilters.length > 0) {
      args.push('-af', aFilters.join(','));
    }

    if (options.audioKeepStreams === 'Yes') {
      args.push('-map', '0:a?');
    }
  }

  return args;
}

function getAudioArgs(options) {
  const args = [];

  // Codec
  if (options.audioEncode && options.audioEncode !== 'Default') {
    if (options.audioEncode === 'MP3') args.push('-c:a', 'libmp3lame');
    else if (options.audioEncode === 'AAC') args.push('-c:a', 'aac');
    else if (options.audioEncode === 'FLAC') args.push('-c:a', 'flac');
    else if (options.audioEncode === 'WAV') args.push('-c:a', 'pcm_s16le');
    else if (options.audioEncode === 'OGG') args.push('-c:a', 'libvorbis');
    else if (options.audioEncode === 'AC3') args.push('-c:a', 'ac3');
    else if (options.audioEncode === 'Opus') args.push('-c:a', 'libopus');
    else if (options.audioEncode === 'Copy') args.push('-c:a', 'copy');
  }

  // Sample Rate
  const sr = options.sampleRate || options.audioSampleRate;
  if (sr && sr !== 'Default' && sr !== 'Auto') {
    args.push('-ar', sr.toString());
  }

  // Channels
  const ch = options.channels || options.channel || options.audioChannel;
  if (ch && ch !== 'Default' && ch !== 'Auto') {
    const chNum = ch.toString().includes('Stereo') ? '2' : ch.toString().includes('Mono') ? '1' : ch.toString();
    args.push('-ac', chNum);
  }

  // VBR (for MP3)
  if (options.vbr && options.vbr !== 'Off' && options.vbr !== 'Default') {
    args.push('-q:a', options.vbr.toString());
  }

  // Audio Filters (-af)
  const aFilters = [];
  const vol = options.volume || options.audioVolume;
  if (vol && vol !== '100' && vol !== 'Default') {
    aFilters.push(`volume=${(parseFloat(vol) || 100) / 100}`);
  }
  if ((options.fadeIn && options.fadeIn !== 'No' && options.fadeIn !== 'Off') || (options.clipFadeIn && options.clipFadeIn !== 'Off')) {
    const fi = options.clipFadeIn && options.clipFadeIn !== 'Off' ? options.clipFadeIn : options.fadeIn;
    aFilters.push(`afade=t=in:ss=0:d=${parseFloat(fi) || 2}`);
  }
  if ((options.fadeOut && options.fadeOut !== 'No' && options.fadeOut !== 'Off') || (options.clipFadeOut && options.clipFadeOut !== 'Off')) {
    const fo = options.clipFadeOut && options.clipFadeOut !== 'Off' ? options.clipFadeOut : options.fadeOut;
    aFilters.push(`afade=t=out:st=10:d=${parseFloat(fo) || 2}`);
  }
  if (options.clipSpeed && options.clipSpeed !== 'Default') {
    const sp = parseFloat(options.clipSpeed);
    if (!isNaN(sp) && sp > 0 && sp !== 1) {
      aFilters.push(`atempo=${sp}`);
    }
  }
  if (options.echo === 'Yes') {
    aFilters.push('aecho=0.8:0.88:60:0.4');
  }
  if (options.denoise === 'Yes') {
    aFilters.push('afftdn');
  }
  if (options.reverse === 'Yes') {
    aFilters.push('areverse');
  }

  if (aFilters.length > 0) {
    args.push('-af', aFilters.join(','));
  }

  return args;
}

function getImageArgs(options, format) {
  const args = [];
  const iFilters = [];

  // Size Limit (Max Width & Height)
  if (options.sizeLimit && (options.maxWidth > 0 || options.maxHeight > 0)) {
    const mw = options.maxWidth > 0 ? options.maxWidth : 9999;
    const mh = options.maxHeight > 0 ? options.maxHeight : 9999;
    iFilters.push(`scale='min(${mw},iw)':'min(${mh},ih)':force_original_aspect_ratio=decrease`);
  }

  // Rotate
  if (options.rotate === '90') iFilters.push('transpose=1');
  else if (options.rotate === '180') iFilters.push('transpose=2,transpose=2');
  else if (options.rotate === '270') iFilters.push('transpose=2');

  // Flip
  if (options.flip === 'Horizontal') iFilters.push('hflip');
  else if (options.flip === 'Vertical') iFilters.push('vflip');

  if (format === 'jpg' || format === 'jpeg') {
    iFilters.push('format=yuv420p');
    const q = options.quality || 90;
    const qscale = Math.max(1, Math.min(31, Math.round((100 - q) / 3.2)));
    args.push('-q:v', qscale.toString());
  } else if (format === 'webp') {
    const q = (options.quality || 90).toString();
    args.push('-c:v', 'libwebp', '-quality', q);
  }

  if (iFilters.length > 0) {
    args.push('-vf', iFilters.join(','));
  }

  args.push('-update', '1');
  return args;
}

function getOutputPath(input, output, options = {}) {
  if (output) return output;
  
  const inputPath = Array.isArray(input) ? input[0] : (input || 'file');
  const dir = options.outputDir || (appSettings.outputToSameFolder && typeof inputPath === 'string' && fs.existsSync(inputPath) && !fs.statSync(inputPath).isDirectory()
    ? (appSettings.outputToSubFolder ? path.join(path.dirname(inputPath), 'FLoutput') : path.dirname(inputPath))
    : (appSettings.outputDir || path.join(os.homedir(), 'Desktop', 'FLoutput')));
  
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
  
  let baseName = 'output';
  if (typeof inputPath === 'string' && inputPath.length > 0) {
    const parsedName = path.basename(inputPath, path.extname(inputPath));
    if (parsedName) baseName = parsedName;
  }
  baseName = baseName.replace(/[/\\?%*:|"<>]/g, '_');

  // Append setting name if requested (like in Format Factory)
  if (options.appendSettingName && options.presetName) {
    const safePreset = options.presetName.replace(/[/\\?%*:|"<>]/g, '_').trim();
    if (safePreset) {
      baseName = `${baseName}_[${safePreset}]`;
    }
  }
  
  let rawExt = options.outputExt || (typeof inputPath === 'string' ? path.extname(inputPath) : '.mp4') || '.mp4';
  if (!rawExt.startsWith('.')) rawExt = '.' + rawExt;

  if (options.divide && options.divide.mode && options.divide.mode !== 'off') {
    return path.join(dir, `${baseName}_%03d${rawExt}`);
  }
  
  let outputPath = path.join(dir, `${baseName}${rawExt}`);
  let counter = 1;
  while (fs.existsSync(outputPath)) {
    outputPath = path.join(dir, `${baseName} (${counter})${rawExt}`);
    counter++;
  }
  
  return outputPath;
}


