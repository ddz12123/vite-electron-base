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

export default {
  appId,
  productName: appTitle,
  directories: {
    buildResources: 'build',
  },
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintcache,eslint.config.mjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}',
  ],
  asarUnpack: ['resources/**'],
  win: {
    executableName,
    icon: 'resources/icon.png',
  },
  nsis: {
    artifactName: `${executableName}-${packageVersion}-setup.\${ext}`,
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: true,
  },
  mac: {
    icon: 'resources/icon.png',
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
  publish: {
    provider: 'generic',
    url: 'https://example.com/auto-updates',
  },
  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/',
  },
};
