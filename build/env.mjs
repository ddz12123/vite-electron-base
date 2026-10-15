import { loadEnv } from 'vite';

/**
 * 应用级环境变量的唯一默认值来源。
 * electron.vite.config.ts（dev/build）与 electron-builder.config.mjs（打包）共用，
 * 业务代码直接读 import.meta.env，不再各自写兜底值
 */
export const ENV_DEFAULTS = {
  VITE_APP_ID: 'com.electron.app',
  VITE_APP_TITLE: 'ViteElectronBase',
  VITE_APP_EXECUTABLE_NAME: 'vite-electron-base',
  VITE_API_BASE_URL: '/api',
  VITE_CSP_CONNECT_SRC: '',
  VITE_AUTO_UPDATE_ENABLED: 'false',
  VITE_AUTO_UPDATE_DEV: 'false',
  VITE_AUTO_UPDATE_PROVIDER: 'generic',
  VITE_UPDATE_URL: '',
  VITE_UPDATE_GITHUB_OWNER: '',
  VITE_UPDATE_GITHUB_REPO: '',
  VITE_NSIS_GUID: '',
};

/**
 * 按 Vite 规则加载：.env < .env.local < .env.[mode] < .env.[mode].local < process.env，
 * 空值回落到 ENV_DEFAULTS
 * @param {string} mode
 * @returns {typeof ENV_DEFAULTS}
 */
export const loadAppEnv = (mode) => {
  const loaded = loadEnv(mode, process.cwd(), 'VITE_');
  return Object.fromEntries(
    Object.entries(ENV_DEFAULTS).map(([key, fallback]) => [key, loaded[key]?.trim() || fallback]),
  );
};
