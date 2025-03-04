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

  // IPC test
  createWindow()
  createMenu()
  ipcMain.on('ping', () => console.log('pong'))

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

