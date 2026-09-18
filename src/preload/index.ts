import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import type { AppApi } from '../shared/app';
import { IPC_CHANNELS } from '../shared/channels';

const api: AppApi = {
  getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.getAppInfo),
  openExternal: (url) => ipcRenderer.invoke(IPC_CHANNELS.openExternal, url),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  Object.assign(globalThis, { electron: electronAPI, api });
}
