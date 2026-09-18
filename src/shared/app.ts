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
}
