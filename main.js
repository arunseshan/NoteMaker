import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
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
  db = new Low(adapter, { folders: [], notes: [] });
  await db.read();
  if (!db.data) {
    db.data = {
      folders: [
        { id: '1', name: 'Personal', color: '#a43b2f' },
        { id: '2', name: 'Work', color: '#006b5a' },
        { id: '3', name: 'Ideas', color: '#ff7f6e' },
        { id: '4', name: 'Travel', color: '#fcd664' }
      ],
      notes: []
    };
    await db.write();
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
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