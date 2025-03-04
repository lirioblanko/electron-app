import { app, screen, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs/promises'
import { watch } from 'fs'

const menuTemplate = [
  {
    label: 'MyApp',
    submenu: [
      { role: 'about' },
      new MenuItem({
        label: 'О программе',
        click: () => {}
      }),
      new MenuItem({
        type: 'separator'
      }),
      new MenuItem({
        label: 'Закрыть',
        click: () => {
          app.quit()
        }
      })
    ]
  }
]

function createMenu() {
  const menu = new Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  let mainWindow = new BrowserWindow({
    width: 800,
    height: 670,
    minWidth: 400,
    maxWidth: width,
    maxHeight: height,
    show: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // mainWindow.webContents.setWindowOpenHandler((details) => {
  //   shell.openExternal(details.url)
  //   return { action: 'deny' }
  // })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createMenu()
  ipcMain.on('ping', () => console.log('pong'))

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

function scan(dir) {
  return fs
    .readdir(dir, { withFileTypes: true })
    .then((files) => files.filter((file) => file.isFile()).map((file) => file.name))
}

ipcMain.on('scan', (event, dir) => {
  function rescan(dir) {
    scan(dir).then((files) => event.reply('files', files))
  }
  rescan(dir)
  watch(dir, rescan)
})

ipcMain.on('get-status', (event, status) => {
  event.reply('get-status', status)
})
