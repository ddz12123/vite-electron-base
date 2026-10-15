import { app, session, shell } from 'electron';
import { pathToFileURL } from 'node:url';

// 渲染进程默认不授予任何权限，只放行无副作用的少数几项；
// 业务需要摄像头、通知等能力时在这里显式加，而不是整体放开
const ALLOWED_PERMISSIONS = new Set(['clipboard-sanitized-write', 'fullscreen']);

export interface NavigationOptions {
  isDev: boolean;
  devUrl?: string;
  appEntryPath: string;
}

export const isAllowedExternalUrl = (url: string): boolean => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

export const isAllowedNavigation = (url: string, options: NavigationOptions): boolean => {
  try {
    const target = new URL(url);

    if (options.isDev && options.devUrl) {
      return target.origin === new URL(options.devUrl).origin;
    }

    const appEntry = new URL(pathToFileURL(options.appEntryPath).toString());
    return target.protocol === 'file:' && target.pathname === appEntry.pathname;
  } catch {
    return false;
  }
};

/**
 * 全局安全加固，须在 app ready 后、创建任何窗口前调用。
 * 挂在 web-contents-created 上，之后新建的每个窗口都自动继承，不依赖业务记得逐个设置
 */
export const registerSecurityHandlers = (options: NavigationOptions): void => {
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (isAllowedExternalUrl(url)) {
        void shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    contents.on('will-navigate', (event, url) => {
      if (!isAllowedNavigation(url, options)) event.preventDefault();
    });

    contents.on('will-redirect', (event, url) => {
      if (!isAllowedNavigation(url, options)) event.preventDefault();
    });

    // 模板不使用 <webview>，一律阻止挂载，避免被注入的页面借此拿到新的渲染上下文
    contents.on('will-attach-webview', (event) => {
      event.preventDefault();
    });
  });

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(ALLOWED_PERMISSIONS.has(permission));
  });

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) =>
    ALLOWED_PERMISSIONS.has(permission),
  );
};
