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

// Check if a file exists on the machine
ipcMain.handle('check-exe-exists', (event, exePath) => {
  const fs = require('fs')
  return fs.existsSync(exePath)
})

// Expand Windows environment variables in a path string
function expandEnvVars(str) {
  return str.replace(/%([^%]+)%/g, (_, key) => process.env[key] || '')
}

// Search multiple directories for an exe by name across subdirectories
ipcMain.handle('find-exe', (event, searchDirs, exeName) => {
  const fs = require('fs')
  const dirs = Array.isArray(searchDirs) ? searchDirs : [searchDirs]
  try {
    for (const rawDir of dirs) {
      const searchDir = expandEnvVars(rawDir)
      if (!fs.existsSync(searchDir)) continue
      // Check the directory itself first
      const direct = path.join(searchDir, exeName)
      if (fs.existsSync(direct)) return direct
      // Then check one level of subdirectories (for versioned folders)
      const entries = fs.readdirSync(searchDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const candidate = path.join(searchDir, entry.name, exeName)
          if (fs.existsSync(candidate)) return candidate
        }
      }
    }
    return null
  } catch (e) {
    return null
  }
})

// Open a URL in the system default browser
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url)
})

// Open an internal page in a new window
ipcMain.handle('open-page', (event, page) => {
  const pageWin = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Metro Dashboard',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  pageWin.loadFile(page)
})
