/// <reference types="vite/client" />

// 仅声明主进程通过 electron.vite.config.ts 的 define 注入的变量
interface ImportMetaEnv {
  readonly VITE_APP_ID: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
