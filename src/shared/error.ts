// 渲染进程错误上报与主进程日志落盘共用的契约：
// 主进程侧是最终执行点（渲染端可能被绕过），两侧必须用同一份常量避免漂移
export const MAX_LOG_DETAIL_LENGTH = 8000;

export const formatError = (cause: unknown): string =>
  cause instanceof Error ? (cause.stack ?? cause.message) : String(cause);
