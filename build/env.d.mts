export declare const ENV_DEFAULTS: {
  VITE_APP_ID: string;
  VITE_APP_TITLE: string;
  VITE_APP_EXECUTABLE_NAME: string;
  VITE_API_BASE_URL: string;
  VITE_CSP_CONNECT_SRC: string;
  VITE_AUTO_UPDATE_ENABLED: string;
  VITE_AUTO_UPDATE_DEV: string;
  VITE_AUTO_UPDATE_PROVIDER: string;
  VITE_UPDATE_URL: string;
  VITE_UPDATE_GITHUB_OWNER: string;
  VITE_UPDATE_GITHUB_REPO: string;
  VITE_NSIS_GUID: string;
};

export declare const loadAppEnv: (mode: string) => typeof ENV_DEFAULTS;
