import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

/**
 * 自动更新（electron-updater）
 * - 更新源由 electron-builder.config.mjs 的 publish 配置决定
 * - 开发调试可在 dev-app-update.yml 中配置，并将 forceDevUpdateConfig 置为 true
 */
export interface AutoUpdaterOptions {
  enabled: boolean;
  feedUrl?: string;
}

export function setupAutoUpdater(options: AutoUpdaterOptions): void {
  if (!app.isPackaged || !options.enabled) return;

  if (options.feedUrl) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: options.feedUrl.endsWith('/') ? options.feedUrl : `${options.feedUrl}/`,
    });
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (error) => {
    console.error('[updater] check update failed:', error);
  });

  void autoUpdater.checkForUpdatesAndNotify();
}
