export interface AppInfo {
  name: string;
  version: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
}

export interface AppApi {
  getInfo(): Promise<AppInfo>;
  openExternal(url: string): Promise<void>;
  /** 生产环境渲染进程错误上报，主进程追加写入系统日志目录下的 renderer.log */
  appendLog(detail: string): Promise<void>;
}
