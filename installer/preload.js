const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('installerApi', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  getDefaultPath: () => ipcRenderer.invoke('get-default-path'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  checkInstalled: () => ipcRenderer.invoke('check-installed'),
  startInstall: (options) => ipcRenderer.invoke('start-install', options),
  startUninstall: (options) => ipcRenderer.invoke('start-uninstall', options),
  onProgress: (callback) => {
    ipcRenderer.on('install-progress', (_event, data) => callback(data));
  },
  launchApp: (installPath) => ipcRenderer.invoke('launch-app', installPath),
});
