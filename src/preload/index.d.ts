import type { AppApi } from '@shared/app';

declare global {
  interface Window {
    api: AppApi;
  }
}
