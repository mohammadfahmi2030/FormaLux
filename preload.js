const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onMaximized: (callback) => ipcRenderer.on('window-maximized', (_, val) => callback(val)),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // File operations
  selectFiles: (filters) => ipcRenderer.invoke('select-files', filters),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),
  scanFolder: (dirPath, extensions) => ipcRenderer.invoke('scan-folder', dirPath, extensions),
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  getPathForFile: (file) => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file);
      }
    } catch (e) {}
    return file?.path || '';
  },

  // FFmpeg & Hardware
  checkFFmpeg: () => ipcRenderer.invoke('check-ffmpeg'),
  getMediaInfo: (filePath) => ipcRenderer.invoke('get-media-info', filePath),
  testHardwareAcceleration: () => ipcRenderer.invoke('test-hardware-acceleration'),

  // Utilities / Batch Renamer
  selectSingleFile: (filters) => ipcRenderer.invoke('select-single-file', filters),
  batchRenamePreview: (options) => ipcRenderer.invoke('batch-rename-preview', options),
  batchRenameExecute: (options) => ipcRenderer.invoke('batch-rename-execute', options),

  // Conversion
  startConversion: (task) => ipcRenderer.invoke('start-conversion', task),
  cancelTask: (taskId) => ipcRenderer.invoke('cancel-task', taskId),
  onTaskProgress: (callback) => ipcRenderer.on('task-progress', (_, data) => callback(data)),
  onTaskComplete: (callback) => ipcRenderer.on('task-complete', (_, data) => callback(data)),
  onTaskFailed: (callback) => ipcRenderer.on('task-failed', (_, data) => callback(data)),
  onTaskCancelled: (callback) => ipcRenderer.on('task-cancelled', (_, data) => callback(data)),

  // System & Optical Discs
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  shutdownSystem: (delaySec) => ipcRenderer.invoke('shutdown-system', delaySec),
  cancelShutdown: () => ipcRenderer.invoke('cancel-shutdown'),
  getDiscDrives: () => ipcRenderer.invoke('get-disc-drives'),
  getDriveFreeSpace: (path) => ipcRenderer.invoke('get-drive-free-space', path),
  ejectDiscDrive: (drive) => ipcRenderer.invoke('eject-disc-drive', drive),
  selectSaveFile: (options) => ipcRenderer.invoke('select-save-file', options),
  scanDvdSource: (sourcePath) => ipcRenderer.invoke('scan-dvd-source', sourcePath),
  fetchCdInfo: (discId) => ipcRenderer.invoke('fetch-cd-info', discId),

  // Updates & External Links
  checkForUpdates: (repo) => ipcRenderer.invoke('check-for-updates', repo),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),

  // Clipboard
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  writeClipboard: (text) => ipcRenderer.invoke('write-clipboard', text),
});

