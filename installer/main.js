const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, execFile, exec } = require('child_process');

function runPsScript(script) {
  return new Promise((resolve) => {
    const tempPs = path.join(os.tmpdir(), `formalux_op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.ps1`);
    fs.writeFileSync(tempPs, script, 'utf8');
    execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempPs], () => {
      try { fs.unlinkSync(tempPs); } catch (_) {}
      resolve();
    });
  });
}

let mainWindow = null;

function createWindow() {
  const iconPath = fs.existsSync(path.join(__dirname, 'icon.ico'))
    ? path.join(__dirname, 'icon.ico')
    : path.join(__dirname, '..', 'build', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 780,
    height: 490,
    frame: false,
    resizable: false,
    maximizable: false,
    center: true,
    backgroundColor: '#121215',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
    },
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.key === 'F12' ||
      (input.control && input.shift && ['i', 'j', 'c'].includes(input.key.toLowerCase())) ||
      (input.control && input.key.toLowerCase() === 'u')
    ) {
      event.preventDefault();
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

// Window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Default install directory
ipcMain.handle('get-default-path', () => {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  return path.join(localAppData, 'Programs', 'FormaLux');
});

// Folder selector
ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select FormaLux Installation Directory',
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// Send progress helper
function sendProgress(percent, status, step) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('install-progress', { percent, status, step });
  }
}

// Check if FormaLux is installed
ipcMain.handle('check-installed', async () => {
  return new Promise((resolve) => {
    const regCmd = 'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\FormaLux"';
    exec(regCmd, (err, stdout) => {
      let installLocation = null;
      let displayVersion = '1.0.0';
      if (!err && stdout) {
        const locMatch = stdout.match(/InstallLocation\s+REG_SZ\s+(.+)/i);
        if (locMatch && locMatch[1]) {
          installLocation = path.normalize(locMatch[1].trim().replace(/\\\\+/g, '\\'));
        }
        const verMatch = stdout.match(/DisplayVersion\s+REG_SZ\s+(.+)/i);
        if (verMatch && verMatch[1]) {
          displayVersion = verMatch[1].trim();
        }
      }

      const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      const defaultDir = path.join(localAppData, 'Programs', 'FormaLux');
      const targetDir = installLocation || defaultDir;
      const exePath = path.join(targetDir, 'FormaLux.exe');

      const isInstalled = fs.existsSync(exePath);

      resolve({
        isInstalled,
        installLocation: targetDir,
        displayVersion: displayVersion || '1.0.0',
        exePath,
      });
    });
  });
});

// Start installation / repair
ipcMain.handle('start-install', async (_event, options) => {
  const {
    installPath = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', 'FormaLux'),
    createDesktopShortcut = true,
    createStartMenuShortcut = true,
    isRepair = false,
  } = options || {};

  try {
    // Terminate any active FormaLux instance to prevent file locking
    await new Promise((res) => {
      exec('taskkill /F /IM FormaLux.exe /T', () => res());
    });

    sendProgress(5, isRepair ? 'Preparing repair & target directory...' : 'Preparing destination directory...', 'prepare');
    fs.mkdirSync(installPath, { recursive: true });

    // Locate payload archive or unpacked folder
    const possiblePayloads = [
      path.join(process.resourcesPath || '', 'payload.tar.gz'),
      path.join(__dirname, 'payload.tar.gz'),
      path.join(__dirname, '..', 'installer', 'payload.tar.gz'),
      path.join(__dirname, '..', 'payload.tar.gz'),
    ];

    let payloadPath = null;
    for (const p of possiblePayloads) {
      if (fs.existsSync(p)) {
        payloadPath = p;
        break;
      }
    }

    const unpackedDir = path.join(__dirname, '..', 'dist', 'win-unpacked');

    if (payloadPath) {
      sendProgress(15, isRepair ? 'Restoring core FormaLux engine & media binaries...' : 'Extracting core FormaLux engine & media binaries...', 'extract');

      // Use Windows built-in tar.exe to extract
      const tarExe = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');

      await new Promise((resolve, reject) => {
        let progressVal = 18;
        const interval = setInterval(() => {
          if (progressVal < 78) {
            progressVal += Math.floor(Math.random() * 6) + 3;
            sendProgress(progressVal, isRepair ? 'Refreshing FFmpeg 6.0, FFprobe & format libraries...' : 'Unpacking FFmpeg 6.0, FFprobe & format libraries...', 'extract');
          }
        }, 500);

        // Extract tar.gz into installPath
        const tarArgs = ['-xzf', payloadPath, '-C', installPath, '--strip-components=1'];
        const proc = spawn(tarExe, tarArgs, { windowsHide: true });

        proc.on('close', (code) => {
          clearInterval(interval);
          if (code === 0) {
            resolve();
          } else {
            // Retry without strip-components if archive had no parent folder
            const retryArgs = ['-xzf', payloadPath, '-C', installPath];
            const retryProc = spawn(tarExe, retryArgs, { windowsHide: true });
            retryProc.on('close', (retryCode) => {
              if (retryCode === 0) resolve();
              else reject(new Error(`Extraction failed with code ${retryCode}`));
            });
          }
        });

        proc.on('error', (err) => {
          clearInterval(interval);
          reject(err);
        });
      });
    } else if (fs.existsSync(unpackedDir)) {
      sendProgress(20, 'Copying files from package repository...', 'copy');
      fs.cpSync(unpackedDir, installPath, { recursive: true });
    } else {
      throw new Error('Application payload could not be located.');
    }

    // Step 3: Copy icon if needed
    const targetExe = path.join(installPath, 'FormaLux.exe');
    const targetIcon = path.join(installPath, 'icon.ico');
    const sourceIcon = fs.existsSync(path.join(__dirname, 'icon.ico'))
      ? path.join(__dirname, 'icon.ico')
      : path.join(__dirname, '..', 'build', 'icon.ico');

    if (fs.existsSync(sourceIcon) && !fs.existsSync(targetIcon)) {
      fs.copyFileSync(sourceIcon, targetIcon);
    }

    sendProgress(82, 'Registering native GUI uninstaller & system hooks...', 'uninstall_script');

    // Ensure Uninstall.exe is present in install directory
    const targetUninstallExe = path.join(installPath, 'Uninstall.exe');
    const possibleUninstallSources = [
      path.join(installPath, 'Uninstall.exe'),
      path.join(__dirname, 'Uninstall.exe'),
      path.join(process.resourcesPath || '', 'Uninstall.exe'),
      path.join(__dirname, '..', 'installer', 'Uninstall.exe'),
      path.join(__dirname, '..', 'dist', 'win-unpacked', 'Uninstall.exe'),
    ];

    for (const src of possibleUninstallSources) {
      if (fs.existsSync(src) && src !== targetUninstallExe) {
        try {
          fs.copyFileSync(src, targetUninstallExe);
          break;
        } catch (_) {}
      }
    }

    // Clean up any legacy batch file if present
    const legacyBat = path.join(installPath, 'Uninstall-FormaLux.bat');
    if (fs.existsSync(legacyBat)) {
      try { fs.unlinkSync(legacyBat); } catch (_) {}
    }

    sendProgress(88, 'Registering Windows shortcuts & shell integrations...', 'shortcuts');

    // Create Windows Shortcuts using PowerShell
    const psScript = `
$wsh = New-Object -ComObject WScript.Shell

if ('${createDesktopShortcut}' -eq 'True') {
    $desktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
    $sc = $wsh.CreateShortcut("$desktopPath\\FormaLux.lnk")
    $sc.TargetPath = "${targetExe.replace(/\\/g, '\\\\')}"
    $sc.WorkingDirectory = "${installPath.replace(/\\/g, '\\\\')}"
    $sc.IconLocation = "${targetExe.replace(/\\/g, '\\\\')},0"
    $sc.Description = "FormaLux - Professional Media Converter Suite"
    $sc.Save()
}

if ('${createStartMenuShortcut}' -eq 'True') {
    $programsPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
    $sc = $wsh.CreateShortcut("$programsPath\\FormaLux.lnk")
    $sc.TargetPath = "${targetExe.replace(/\\/g, '\\\\')}"
    $sc.WorkingDirectory = "${installPath.replace(/\\/g, '\\\\')}"
    $sc.IconLocation = "${targetExe.replace(/\\/g, '\\\\')},0"
    $sc.Description = "FormaLux - Professional Media Converter Suite"
    $sc.Save()

    # Uninstall Shortcut in Start Menu
    $uninstSc = $wsh.CreateShortcut("$programsPath\\Uninstall FormaLux.lnk")
    $uninstSc.TargetPath = "${targetUninstallExe.replace(/\\/g, '\\\\')}"
    $uninstSc.WorkingDirectory = "${installPath.replace(/\\/g, '\\\\')}"
    $uninstSc.IconLocation = "${targetUninstallExe.replace(/\\/g, '\\\\')},0"
    $uninstSc.Description = "Uninstall FormaLux Complete Suite"
    $uninstSc.Save()
}

# Windows Uninstall Registry
$regKey = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\FormaLux"
if (-not (Test-Path $regKey)) { New-Item -Path $regKey -Force | Out-Null }
Set-ItemProperty -Path $regKey -Name "DisplayName" -Value "FormaLux"
Set-ItemProperty -Path $regKey -Name "DisplayVersion" -Value "1.0.0"
Set-ItemProperty -Path $regKey -Name "Publisher" -Value "Mohammad Fahmi"
Set-ItemProperty -Path $regKey -Name "DisplayIcon" -Value "${targetExe.replace(/\\/g, '\\\\')},0"
Set-ItemProperty -Path $regKey -Name "InstallLocation" -Value "${installPath.replace(/\\/g, '\\\\')}"
Set-ItemProperty -Path $regKey -Name "UninstallString" -Value ('"' + '${targetUninstallExe.replace(/\\/g, '\\\\')}' + '"')
Set-ItemProperty -Path $regKey -Name "QuietUninstallString" -Value ('"' + '${targetUninstallExe.replace(/\\/g, '\\\\')}' + '" --silent')
Set-ItemProperty -Path $regKey -Name "EstimatedSize" -Value 950000
`;

    await runPsScript(psScript);

    sendProgress(100, isRepair ? 'Repair completed successfully!' : 'Installation completed successfully!', 'done');
    return { success: true, installPath, exePath: targetExe };

  } catch (err) {
    console.error('Install/Repair error:', err);
    sendProgress(0, `Operation failed: ${err.message}`, 'error');
    throw err;
  }
});

// Start uninstallation
ipcMain.handle('start-uninstall', async (_event, options) => {
  const {
    installPath = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', 'FormaLux'),
    deleteUserData = true,
  } = options || {};

  try {
    sendProgress(10, 'Stopping active FormaLux processes...', 'kill');

    // Step 1: Kill running instances using taskkill
    await new Promise((res) => {
      exec('taskkill /F /IM FormaLux.exe /T', () => res());
    });

    await new Promise((r) => setTimeout(r, 350));
    sendProgress(35, 'Removing desktop and Start menu shortcuts...', 'shortcuts');

    // Step 2: Remove shortcuts using PowerShell script
    const psShortcuts = `
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$programs = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)

$files = @(
  "$desktop\\FormaLux.lnk",
  "$programs\\FormaLux.lnk",
  "$programs\\Uninstall FormaLux.lnk"
)

foreach ($f in $files) {
  if (Test-Path $f) { Remove-Item $f -Force -ErrorAction SilentlyContinue }
}
`;
    await runPsScript(psShortcuts);

    await new Promise((r) => setTimeout(r, 350));
    sendProgress(55, 'Cleaning Windows registry entries...', 'registry');

    // Step 3: Delete uninstall registry entry
    await new Promise((res) => {
      exec('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\FormaLux" /f', () => res());
    });

    // Step 4: Delete user data if requested
    if (deleteUserData) {
      sendProgress(75, 'Deleting user cache and preferences...', 'userdata');
      const localApp = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const pathsToClean = [
        path.join(localApp, 'FormaLux'),
        path.join(localApp, 'formalux-updater'),
        path.join(appData, 'FormaLux'),
      ];
      for (const p of pathsToClean) {
        if (fs.existsSync(p)) {
          try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
        }
      }
    }

    await new Promise((r) => setTimeout(r, 350));
    sendProgress(90, 'Removing application files and libraries...', 'files');

    // Step 5: Delete installation directory
    if (fs.existsSync(installPath)) {
      try {
        fs.rmSync(installPath, { recursive: true, force: true });
      } catch (e) {
        try {
          const items = fs.readdirSync(installPath);
          for (const item of items) {
            try {
              fs.rmSync(path.join(installPath, item), { recursive: true, force: true });
            } catch (_) {}
          }
        } catch (_) {}
      }
    }

    sendProgress(100, 'Uninstallation completed successfully!', 'done');
    return { success: true };

  } catch (err) {
    console.error('Uninstall error:', err);
    sendProgress(0, `Uninstallation failed: ${err.message}`, 'error');
    throw err;
  }
});

// Launch installed app
ipcMain.handle('launch-app', (_event, targetPath) => {
  const exe = targetPath || path.join(process.env.LOCALAPPDATA || '', 'Programs', 'FormaLux', 'FormaLux.exe');
  if (fs.existsSync(exe)) {
    // Instantly hide installer window to provide immediate visual response
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }

    // Clean environment to prevent inheriting internal electron debug flags
    const cleanEnv = { ...process.env };
    delete cleanEnv.ELECTRON_RUN_AS_NODE;
    delete cleanEnv.ELECTRON_NO_ASAR;

    const child = spawn(exe, [], {
      detached: true,
      stdio: 'ignore',
      cwd: path.dirname(exe),
      env: cleanEnv,
      windowsHide: false
    });
    child.unref();

    // Exit installer immediately so all file handles and memory are freed for the app
    setImmediate(() => {
      app.quit();
    });
    return true;
  }
  return false;
});
