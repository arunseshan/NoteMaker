const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  dbRead: () => ipcRenderer.invoke('db:read'),
  dbSaveNote: (note) => ipcRenderer.invoke('db:save-note', note),
  mediaUpload: (filePath) => ipcRenderer.invoke('media:upload', filePath),
  mediaDelete: (url) => ipcRenderer.invoke('media:delete', url),
});