import type { App } from 'vue';
import { formatError, MAX_LOG_DETAIL_LENGTH } from '@shared/error';

// 上报条数上限：错误风暴（如渲染循环持续抛错）时防止把日志文件刷爆
const MAX_REPORTS = 100;

/**
 * 全局错误兜底：生产环境把 Vue 渲染错误与未处理的 Promise 拒绝经 IPC 送到主进程，
 * 追加写入系统日志目录下的 renderer.log（打包后没有终端和 devtools，不兜底就无从排查）。
 * dev 下不接管，保留浏览器控制台与 Vue 警告的默认行为
 */
export const setupErrorReporting = (app: App): void => {
  if (import.meta.env.DEV) return;

  let reported = 0;
  const report = (detail: string): void => {
    if (reported >= MAX_REPORTS) return;
    reported += 1;
    void window.api.appendLog(detail.slice(0, MAX_LOG_DETAIL_LENGTH));
  };

  // errorHandler 接管后 Vue 不再向控制台打印渲染错误，由这里统一上报
  app.config.errorHandler = (err, _instance, info) => {
    report(`[vue:${info}] ${formatError(err)}`);
  };

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    report(formatError(event.reason));
  });
};
