import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { app, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';

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

// 生产构建会 drop 掉所有 console.* 调用，打包后的 Windows 又没有 stderr，
// 失败痕迹只能落到系统日志目录，否则更新挂了完全查不到
const writeLog = (detail: string): void => {
  process.stderr.write(`[updater] ${detail}\n`);
  try {
    const logDir = app.getPath('logs');
    mkdirSync(logDir, { recursive: true });
    appendFileSync(
      join(logDir, 'updater.log'),
      `[${new Date().toISOString()}] ${detail}\n`,
      'utf8',
    );
  } catch {
    // 日志落地失败不能反过来影响更新流程
  }
};

const logError = (cause: unknown): void => {
  writeLog(cause instanceof Error ? (cause.stack ?? cause.message) : String(cause));
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
    writeLog(`update ${info.version} downloaded`);
    if (!Notification.isSupported()) return;
    new Notification({
      title: '更新已下载',
      body: `${app.getName()} ${info.version} 已就绪，退出应用时自动完成安装。`,
    }).show();
  });

  void autoUpdater.checkForUpdates().catch(logError);
}
