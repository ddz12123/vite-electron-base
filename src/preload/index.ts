import { contextBridge, ipcRenderer } from 'electron';
import type { AppApi } from '@shared/app';
import { IPC_CHANNELS } from '@shared/channels';

// 只暴露白名单方法，不把 ipcRenderer 交给渲染进程：
// 否则渲染进程可以调用任意通道，主进程侧的 IPC 设计就形同虚设
const api: AppApi = {
  getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.getAppInfo),
  openExternal: (url) => ipcRenderer.invoke(IPC_CHANNELS.openExternal, url),
};

// 主窗口固定开启 contextIsolation，不保留挂到 globalThis 的降级分支
contextBridge.exposeInMainWorld('api', api);
