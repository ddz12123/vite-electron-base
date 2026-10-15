import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { registerIpcHandlers } from './ipc';
import { registerSecurityHandlers } from './security';
import { setupAutoUpdater } from './updater';
import icon from '../../resources/icon.png?asset';

// 取值与默认值统一在 .env 中维护，这里不再重复兜底
const env = import.meta.env;
const isTrue = (value: string | undefined): boolean => value?.trim().toLowerCase() === 'true';

const RENDERER_ENTRY = join(__dirname, '../renderer/index.html');
const DEV_URL = process.env['ELECTRON_RENDERER_URL'];

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    // width/height 默认算窗口外框，而 rem.ts 读的是 innerWidth，
    // 按内容尺寸设定才能保证 1280 宽时根字号真的是 16px
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    title: env.VITE_APP_TITLE,
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

  if (is.dev && DEV_URL) {
    mainWindow.loadURL(DEV_URL);
  } else {
    mainWindow.loadFile(RENDERER_ENTRY);
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
    electronApp.setAppUserModelId(env.VITE_APP_ID);

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    registerSecurityHandlers({ isDev: is.dev, devUrl: DEV_URL, appEntryPath: RENDERER_ENTRY });
    registerIpcHandlers();
    setupAutoUpdater({
      enabled: isTrue(env.VITE_AUTO_UPDATE_ENABLED),
      feedUrl: env.VITE_UPDATE_URL?.trim(),
      devEnabled: isTrue(env.VITE_AUTO_UPDATE_DEV),
    });
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
