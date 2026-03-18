const { app, BrowserWindow, shell, ipcMain } = require('electron')
const { exec } = require('child_process')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Metro Dashboard',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

// Handle .exe launch requests from the dashboard
ipcMain.handle('launch-exe', (event, exePath) => {
  exec(`"${exePath}"`, (error) => {
    if (error) {
      console.error('Failed to launch:', error)
    }
  })
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
