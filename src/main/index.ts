import { app, shell, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { registerIpcHandlers } from './ipc';
import { isAllowedExternalUrl, isAllowedNavigation } from './security';
import { setupAutoUpdater } from './updater';
import icon from '../../resources/icon.png?asset';

const APP_ID = import.meta.env.VITE_APP_ID?.trim() || 'com.electron.app';
const APP_TITLE = import.meta.env.VITE_APP_TITLE?.trim();
const AUTO_UPDATE_ENABLED =
  import.meta.env.VITE_AUTO_UPDATE_ENABLED?.trim().toLowerCase() === 'true';
const UPDATE_URL = import.meta.env.VITE_UPDATE_URL?.trim();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    title: APP_TITLE || app.getName(),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: is.dev,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (isAllowedExternalUrl(details.url)) {
      void shell.openExternal(details.url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (
      !isAllowedNavigation(url, {
        isDev: is.dev,
        devUrl: process.env['ELECTRON_RENDERER_URL'],
        appEntryPath: join(__dirname, '../renderer/index.html'),
      })
    ) {
      event.preventDefault();
    }
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;

    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    electronApp.setAppUserModelId(APP_ID);

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    registerIpcHandlers();
    setupAutoUpdater({ enabled: AUTO_UPDATE_ENABLED, feedUrl: UPDATE_URL });
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
