import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, 'utf8');
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
};

// Priority: process.env > .env.production > .env
const env = {
  ...parseEnvFile(resolve(rootDir, '.env')),
  ...parseEnvFile(resolve(rootDir, '.env.production')),
  ...process.env,
};

const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
const packageVersion = String(packageJson.version ?? '').trim();

const appTitle = env.VITE_APP_TITLE?.trim() || 'ViteElectronBase';
const appId = env.VITE_APP_ID?.trim() || 'com.electron.app';
const executableName = env.VITE_APP_EXECUTABLE_NAME?.trim() || 'vite-electron-base';
const autoUpdateEnabled = env.VITE_AUTO_UPDATE_ENABLED?.trim().toLowerCase() === 'true';
const updateProvider = env.VITE_AUTO_UPDATE_PROVIDER?.trim().toLowerCase() || 'generic';
const updateUrl = env.VITE_UPDATE_URL?.trim();
const githubOwner = env.VITE_UPDATE_GITHUB_OWNER?.trim();
const githubRepo = env.VITE_UPDATE_GITHUB_REPO?.trim();
const nsisGuid = env.VITE_NSIS_GUID?.trim();

const publish = (() => {
  if (!autoUpdateEnabled) return undefined;

  if (updateProvider === 'github') {
    if (!githubOwner || !githubRepo) {
      throw new Error(
        'GitHub auto-update requires VITE_UPDATE_GITHUB_OWNER and VITE_UPDATE_GITHUB_REPO',
      );
    }

    return {
      provider: 'github',
      owner: githubOwner,
      repo: githubRepo,
      releaseType: 'release',
    };
  }

  if (updateProvider === 'generic') {
    if (!updateUrl) {
      throw new Error('Generic auto-update requires VITE_UPDATE_URL');
    }

    return {
      provider: 'generic',
      url: updateUrl.endsWith('/') ? updateUrl : `${updateUrl}/`,
    };
  }

  throw new Error(`Unsupported VITE_AUTO_UPDATE_PROVIDER: ${updateProvider}`);
})();

export default {
  appId,
  productName: appTitle,
  directories: {
    buildResources: 'build',
  },
  // 只写排除项等于"其余全收"：本地 pnpm store、文档、构建配置都会被塞进 app.asar
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!docs/*',
    '!.pnpm-store/*',
    '!pnpm-workspace.yaml',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!electron-builder.config.mjs',
    '!{.eslintcache,eslint.config.mjs,.prettierignore,.prettierrc,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}',
  ],
  asarUnpack: ['resources/**'],
  win: {
    executableName,
    icon: 'build/icon.ico',
  },
  nsis: {
    artifactName: `${executableName}-${packageVersion}-setup.\${ext}`,
    // 向导式安装：可选安装目录 + 附加选项页（定义见 build/installer.nsh）
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    // 默认当前用户安装（自动更新无需 UAC），用户可在向导里选择"所有用户"
    perMachine: false,
    allowElevation: true,
    runAfterFinish: true,
    // true = 仅全新安装创建；是否创建由向导复选框决定（"always" 会每次覆盖重建）
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    // 卸载时由 installer.nsh 弹窗询问，避免 deleteAppDataOnUninstall 无条件删除
    deleteAppDataOnUninstall: false,
    include: 'build/installer.nsh',
    installerLanguages: ['zh_CN', 'en_US'],
    displayLanguageSelector: true,
    // 升级时只下载差异包，需要发布时保留上一版 installer 的 .nsis7z
    differentialPackage: true,
    ...(nsisGuid ? { guid: nsisGuid } : {}),
  },
  mac: {
    icon: 'build/icon.icns',
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: {
      NSCameraUsageDescription: "Application requests access to the device's camera.",
      NSMicrophoneUsageDescription: "Application requests access to the device's microphone.",
      NSDocumentsFolderUsageDescription:
        "Application requests access to the user's Documents folder.",
      NSDownloadsFolderUsageDescription:
        "Application requests access to the user's Downloads folder.",
    },
    notarize: false,
  },
  dmg: {
    artifactName: `${executableName}-${packageVersion}.\${ext}`,
  },
  linux: {
    icon: 'resources/icon.png',
    target: ['AppImage', 'snap', 'deb'],
    maintainer: 'electronjs.org',
    category: 'Utility',
  },
  appImage: {
    artifactName: `${executableName}-${packageVersion}.\${ext}`,
  },
  npmRebuild: false,
  ...(publish ? { publish } : {}),
  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/',
  },
};
