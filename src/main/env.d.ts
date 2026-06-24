/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ID: string;
  readonly VITE_APP_EXECUTABLE_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
