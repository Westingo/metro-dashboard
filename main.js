const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const { exec } = require('child_process')
const { autoUpdater } = require('electron-updater')
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

app.whenReady().then(() => {
  createWindow()

  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', () => {
    console.log('Update available')
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of Metro Dashboard is downloading...'
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No update available')
  })

  autoUpdater.on('error', (err) => {
    console.log('Update error: ' + err)
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded')
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Metro Dashboard will restart to install the update.',
      buttons: ['Restart Now']
    }).then(() => {
      autoUpdater.quitAndInstall()
    })
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Handle .exe launch requests from the dashboard
ipcMain.handle('launch-exe', (event, exePath) => {
  exec(`"${exePath}"`, (error) => {
    if (error) {
      console.error('Failed to launch:', error)
    }
  })
})
