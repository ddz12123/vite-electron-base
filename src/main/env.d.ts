/// <reference types="vite/client" />

// 仅声明主进程通过 electron.vite.config.ts 的 define 注入的变量
interface ImportMetaEnv {
  readonly VITE_APP_ID: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_AUTO_UPDATE_ENABLED: string;
  readonly VITE_AUTO_UPDATE_DEV: string;
  readonly VITE_UPDATE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
