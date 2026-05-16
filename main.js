import { app, BrowserWindow, ipcMain, protocol, net, Menu, dialog } from 'electron';
import nodeCrypto from 'node:crypto';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

// 1. Setup & Polyfills
if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}

app.name = "NoteMaker";

// Register protocol at the very top
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    }
  }
]);

app.disableHardwareAcceleration();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.join(app.getPath('userData'), 'Media');
let db;

async function initDb() {
  const file = path.join(app.getPath('userData'), 'db.json');
  const adapter = new JSONFile(file);
  
  // Define the default data directly inside the Lowdb instantiation
  db = new Low(adapter, {
    folders: [
      { id: '1', name: 'Personal', color: '#a43b2f' },
      { id: '2', name: 'Work', color: '#006b5a' },
      { id: '3', name: 'Ideas', color: '#ff7f6e' },
      { id: '4', name: 'Travel', color: '#fcd664' }
    ],
    notes: []
  });
  
  await db.read();
  
  // Physically commit the default structure to disk immediately if it's a brand new file
  if (!fs.existsSync(file)) {
    await db.write();
  }
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173');
    //win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// 2. App Lifecycle
app.whenReady().then(async () => {
  protocol.handle('media', (request) => {
    try {
      const fileName = decodeURIComponent(request.url.replace('media://', '').replace(/\/$/, ''));
      const filePath = path.join(mediaDir, fileName);
      if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(fs.createReadStream(filePath));
    } catch (error) {
      return new Response('Error', { status: 500 });
    }
  });

  await initDb();
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }

  const template = [
    { label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'services' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }] },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', accelerator: 'CmdOrCtrl+Z' },
        { role: 'redo', accelerator: 'Shift+CmdOrCtrl+Z' },
        { type: 'separator' },
        { role: 'cut', accelerator: 'CmdOrCtrl+X' },
        { role: 'copy', accelerator: 'CmdOrCtrl+C' },
        { role: 'paste', accelerator: 'CmdOrCtrl+V' },
        { role: 'selectAll', accelerator: 'CmdOrCtrl+A' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Note',
      submenu: [
        { label: 'New Note', accelerator: 'CmdOrCtrl+N', click: () => { win.webContents.send('shortcut:new-note') } },
        { label: 'Delete Note', accelerator: 'CmdOrCtrl+Backspace', click: () => { win.webContents.send('shortcut:delete-note') } },
        { type: 'separator' },
        { label: 'Search Notes', accelerator: 'CmdOrCtrl+F', click: () => { win.webContents.send('shortcut:search-notes') } },
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+K', click: () => { win.webContents.send('shortcut:command-palette') } }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 3. IPC Handlers (SINGLE INSTANCES ONLY)
ipcMain.handle('db:read', async () => {
  await db.read();
  return db.data;
});

ipcMain.handle('db:save-note', async (event, updatedNote) => {
  const index = db.data.notes.findIndex(n => n.id === updatedNote.id);
  if (index !== -1) {
    db.data.notes[index] = { ...db.data.notes[index], ...updatedNote };
  } else {
    db.data.notes.push(updatedNote);
  }
  await db.write();
  return db.data;
});

ipcMain.handle('media:upload', async (event, filePath) => {
  const fileName = path.basename(filePath);
  const destPath = path.join(mediaDir, fileName);
  fs.copyFileSync(filePath, destPath);
  return `media://${fileName}`;
});

ipcMain.handle('media:delete', async (event, mediaUrl) => {
  try {
    const fileName = decodeURIComponent(mediaUrl.replace('media://', ''));
    const filePath = path.join(mediaDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('media:choose', async (event, type) => {
  let filters = [];
  if (type === 'image') filters = [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }];
  else if (type === 'audio') filters = [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }];
  else if (type === 'video') filters = [{ name: 'Video', extensions: ['mp4', 'webm', 'mov'] }];
  
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: `Select ${type}`,
    filters: filters,
    properties: ['openFile']
  });
  
  if (canceled || filePaths.length === 0) return null;
  
  const filePath = filePaths[0];
  const fileName = path.basename(filePath);
  if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
  const destPath = path.join(mediaDir, fileName);
  fs.copyFileSync(filePath, destPath);
  return `media://${fileName}`;
});

ipcMain.handle('db:trash-note', async (event, noteId) => {
  const index = db.data.notes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    db.data.notes[index].isTrash = true;
    db.data.notes[index].deletedAt = new Date().toISOString();
    await db.write();
  }
  return db.data;
});

ipcMain.handle('db:restore-note', async (event, noteId) => {
  const index = db.data.notes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    db.data.notes[index].isTrash = false;
    delete db.data.notes[index].deletedAt;
    await db.write();
  }
  return db.data;
});

ipcMain.handle('db:hard-delete-note', async (event, noteId) => {
  db.data.notes = db.data.notes.filter(n => n.id !== noteId);
  await db.write();
  return db.data;
});

ipcMain.handle('db:save-folders', async (event, folders) => {
  db.data.folders = folders;
  await db.write();
  return db.data;
});

ipcMain.handle('db:trash-folder', async (event, folderId) => {
  const index = db.data.folders.findIndex(f => f.id === folderId);
  if (index !== -1) {
    db.data.folders[index].isTrash = true;
    db.data.folders[index].deletedAt = new Date().toISOString();
    await db.write();
  }
  return db.data;
});

ipcMain.handle('db:restore-folder', async (event, folderId) => {
  const index = db.data.folders.findIndex(f => f.id === folderId);
  if (index !== -1) {
    db.data.folders[index].isTrash = false;
    delete db.data.folders[index].deletedAt;
    await db.write();
  }
  return db.data;
});

ipcMain.handle('db:hard-delete-folder', async (event, folderId) => {
  db.data.folders = db.data.folders.filter(f => f.id !== folderId);
  db.data.notes = db.data.notes.filter(n => n.folderId !== folderId);
  await db.write();
  return db.data;
});

ipcMain.handle('db:export-data', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Select Export Destination',
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (canceled || filePaths.length === 0) return { success: false, message: 'Export canceled.' };
  
  const exportDir = path.join(filePaths[0], `NoteMaker_Export_${new Date().toISOString().split('T')[0]}`);
  
  try {
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);
    
    await db.read();
    const { folders, notes } = db.data;
    
    // Create directories for each active folder
    const folderMap = { 'trash': 'Trash', 'unassigned': 'Uncategorized' };
    folders.forEach(f => {
      if (!f.isTrash) {
        folderMap[f.id] = f.name.replace(/[^a-z0-9]/gi, '_'); 
        const folderPath = path.join(exportDir, folderMap[f.id]);
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
      }
    });
    
    // Ensure Trash and Uncategorized exist if needed
    ['Trash', 'Uncategorized'].forEach(name => {
      const p = path.join(exportDir, name);
      if (!fs.existsSync(p)) fs.mkdirSync(p);
    });
    
    // Write notes to files
    notes.forEach(note => {
      const folderName = folderMap[note.folderId] || (note.isTrash ? 'Trash' : 'Uncategorized');
      const safeTitle = (note.title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
      const fileName = `${safeTitle}_${note.id.substring(0,4)}.md`;
      const filePath = path.join(exportDir, folderName, fileName);
      
      // Basic HTML to Text cleanup for the markdown file
      const contentText = note.content_html ? note.content_html.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n') : '';
      
      const fileContent = `# ${note.title}\nCreated: ${new Date(note.createdAt).toLocaleString()}\n\n${contentText}`;
      fs.writeFileSync(filePath, fileContent, 'utf-8');
    });
    
    return { success: true, message: `Successfully exported to ${exportDir}` };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, message: 'Export failed due to an error.' };
  }
});
