import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

/**
 * 自动更新（electron-updater）
 * - 更新源由 electron-builder.config.mjs 的 publish 配置决定
 * - 开发调试可在 dev-app-update.yml 中配置，并将 forceDevUpdateConfig 置为 true
 */
export function setupAutoUpdater(): void {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (error) => {
    console.error('[updater] check update failed:', error);
  });

  void autoUpdater.checkForUpdatesAndNotify();
}
