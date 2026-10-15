/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 由 electron.vite.config.ts 注入（已补齐 build/env.mjs 中的默认值）
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
