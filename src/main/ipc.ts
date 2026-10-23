import { app, ipcMain, shell } from 'electron';
import type { AppInfo } from '@shared/app';
import { IPC_CHANNELS } from '@shared/channels';
import { MAX_LOG_DETAIL_LENGTH } from '@shared/error';
import { writeLog } from './logger';
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

  // 渲染进程错误上报：只收字符串并截断（渲染端也有同样限制，但渲染端可能被绕过，
  // 这里是最终执行点）；条数上限防止被攻破的渲染进程把日志文件刷爆
  let acceptedLogCount = 0;
  ipcMain.handle(IPC_CHANNELS.appendLog, (_event, detail: unknown) => {
    if (typeof detail !== 'string' || !detail.trim()) return;
    if (acceptedLogCount >= 200) return;
    acceptedLogCount += 1;
    writeLog('renderer', detail.slice(0, MAX_LOG_DETAIL_LENGTH));
  });
};
