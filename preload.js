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
  mediaChoose: (type) => ipcRenderer.invoke('media:choose', type),
  exportData: () => ipcRenderer.invoke('db:export-data'),
  onNewNote: (callback) => {
    ipcRenderer.removeAllListeners('shortcut:new-note');
    ipcRenderer.on('shortcut:new-note', callback);
  },
  onDeleteNote: (callback) => {
    ipcRenderer.removeAllListeners('shortcut:delete-note');
    ipcRenderer.on('shortcut:delete-note', callback);
  },
  onSearchNotes: (callback) => {
    ipcRenderer.removeAllListeners('shortcut:search-notes');
    ipcRenderer.on('shortcut:search-notes', callback);
  },
  onCommandPalette: (callback) => {
    ipcRenderer.removeAllListeners('shortcut:command-palette');
    ipcRenderer.on('shortcut:command-palette', callback);
  },
});