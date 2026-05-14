const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  dbRead: () => ipcRenderer.invoke('db:read'),
  dbSaveNote: (note) => ipcRenderer.invoke('db:save-note', note),
  dbTrashNote: (id) => ipcRenderer.invoke('db:trash-note', id),
  dbRestoreNote: (id) => ipcRenderer.invoke('db:restore-note', id),
  dbHardDeleteNote: (id) => ipcRenderer.invoke('db:hard-delete-note', id),
  dbSaveFolders: (folders) => ipcRenderer.invoke('db:save-folders', folders),
  dbTrashFolder: (id) => ipcRenderer.invoke('db:trash-folder', id),
  dbRestoreFolder: (id) => ipcRenderer.invoke('db:restore-folder', id),
  dbHardDeleteFolder: (id) => ipcRenderer.invoke('db:hard-delete-folder', id),
  mediaUpload: (filePath) => ipcRenderer.invoke('media:upload', filePath),
  mediaDelete: (url) => ipcRenderer.invoke('media:delete', url),
});