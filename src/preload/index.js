import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

document.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('offline', async () => ipcRenderer.send('get-status', 'offline'))
  window.addEventListener('online', async () => ipcRenderer.send('get-status', 'online'))

  const initialStatus = navigator.onLine ? 'online' : 'offline';
  ipcRenderer.send('get-status', initialStatus);
})



