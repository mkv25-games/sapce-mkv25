const path = require('path')
const url = require('url')
const { app, BrowserWindow } = require('electron')
const rpc = require('./src/rpc')

const { title, version } = require('./package.json')

const iconUrl = url.format({
  pathname: path.join(__dirname, 'icons/icon.icns'),
  protocol: 'file:',
  slashes: true
})

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js')
    },
    icon: iconUrl
  })

  const mode = selectApplicationMode(process)
  console.log('App Mode:', mode.name)
  mode.fn(mainWindow)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle(title)
    if (process.env.FORCE_OPEN_DEV_TOOLS) {
      mainWindow.webContents.openDevTools()
    }
  })

  return mainWindow
}

function selectApplicationMode ({ env }) {
  const config = env.APP_MODE || false
  const modes = {
    default: {
      name: `Build: ${version}`,
      fn: loadFromLocalFileSystem
    },
    'local-dist': {
      name: `Local Distribution Build (${version})`,
      fn: loadFromLocalFileSystem
    },
    'local-dev': {
      name: `Local Development Build (${version})`,
      fn: loadFromLocalServer
    }
  }
  return modes[config] || modes.default
}

function loadFromLocalServer (mainWindow) {
  const winUrl = 'http://localhost:8080/'
  mainWindow.loadURL(winUrl)
}

function loadFromLocalFileSystem (mainWindow) {
  const winFilepath = path.join(__dirname, 'mainui/dist/index.html')
  mainWindow.loadFile(winFilepath)
}

app.whenReady().then(() => {
  const mainWindow = createWindow()
  rpc.setupProcessRPC(mainWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      const mainWindow = createWindow()
      rpc.setupProcessRPC(mainWindow)
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
