import { ElectronAPI } from '@electron-toolkit/preload';
import type { AppApi } from '../shared/app';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: AppApi;
  }
}
