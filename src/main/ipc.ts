import { app, ipcMain, shell } from 'electron';
import type { AppInfo } from '../shared/app';
import { IPC_CHANNELS } from '../shared/channels';
import { isAllowedExternalUrl } from './security';

const getAppInfo = (): AppInfo => ({
  name: app.getName(),
  version: app.getVersion(),
  electronVersion: process.versions.electron,
  chromeVersion: process.versions.chrome,
  nodeVersion: process.versions.node,
  platform: process.platform,
  arch: process.arch,
  isPackaged: app.isPackaged,
});

export const registerIpcHandlers = (): void => {
  ipcMain.handle(IPC_CHANNELS.getAppInfo, getAppInfo);

  ipcMain.handle(IPC_CHANNELS.openExternal, async (_event, url: string) => {
    if (!isAllowedExternalUrl(url)) {
      throw new Error('Only HTTP(S) URLs can be opened externally');
    }

    await shell.openExternal(url);
  });
};
