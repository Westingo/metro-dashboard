const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  launchExe: (exePath) => ipcRenderer.invoke('launch-exe', exePath),
  checkExeExists: (exePath) => ipcRenderer.invoke('check-exe-exists', exePath),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
})
