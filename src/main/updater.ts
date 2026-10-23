import { app, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import { formatError } from '@shared/error';
import { writeLog } from './logger';

/**
 * 自动更新（electron-updater）
 * - 更新源由 electron-builder.config.mjs 的 publish 配置决定，VITE_UPDATE_URL 可覆盖
 * - 默认只在打包后启用；VITE_AUTO_UPDATE_DEV=true 时开发环境改用 dev-app-update.yml 调试
 */
export interface AutoUpdaterOptions {
  enabled: boolean;
  feedUrl?: string;
  devEnabled?: boolean;
}

const log = (detail: string): void => writeLog('updater', detail);

const logError = (cause: unknown): void => {
  log(formatError(cause));
};

export function setupAutoUpdater(options: AutoUpdaterOptions): void {
  if (!options.enabled) return;

  if (!app.isPackaged) {
    if (!options.devEnabled) return;
    autoUpdater.forceDevUpdateConfig = true;
  }

  if (options.feedUrl) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: options.feedUrl.endsWith('/') ? options.feedUrl : `${options.feedUrl}/`,
    });
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', logError);

  autoUpdater.on('update-downloaded', (info) => {
    log(`update ${info.version} downloaded`);
    if (!Notification.isSupported()) return;
    new Notification({
      title: '更新已下载',
      body: `${app.getName()} ${info.version} 已就绪，退出应用时自动完成安装。`,
    }).show();
  });

  void autoUpdater.checkForUpdates().catch(logError);
}
