import { readFileSync } from 'node:fs';
import { loadAppEnv } from './build/env.mjs';

// 与 electron-vite build 读同一套 .env（含 .env.local / .env.production.local），默认值见 build/env.mjs
const env = loadAppEnv('production');

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const packageVersion = String(packageJson.version ?? '').trim();

const appTitle = env.VITE_APP_TITLE;
const appId = env.VITE_APP_ID;
const executableName = env.VITE_APP_EXECUTABLE_NAME;
const autoUpdateEnabled = env.VITE_AUTO_UPDATE_ENABLED.toLowerCase() === 'true';
const updateProvider = env.VITE_AUTO_UPDATE_PROVIDER.toLowerCase();
const updateUrl = env.VITE_UPDATE_URL;
const githubOwner = env.VITE_UPDATE_GITHUB_OWNER;
const githubRepo = env.VITE_UPDATE_GITHUB_REPO;
const nsisGuid = env.VITE_NSIS_GUID;

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
  // 白名单：只收构建产物和运行时资源；package.json 与生产依赖由 electron-builder 自动加入。
  // 不用排除项写法，否则每新增一个配置文件（.husky、.editorconfig…）都会被悄悄打进 app.asar
  files: ['out/**', 'resources/**'],
  asarUnpack: ['resources/**'],
  // 仅保留中英文语言包（Electron 默认保留全部 55 个语言 ≈ 47MB，裁剪后约 2MB）
  electronLanguages: ['en-US', 'zh-CN'],
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
    notarize: false,
  },
  dmg: {
    artifactName: `${executableName}-${packageVersion}.\${ext}`,
  },
  // 目前没有原生模块，跳过 rebuild 以加快打包；引入原生模块（如 better-sqlite3）后必须删掉此项，
  // 否则 .node 文件仍是按本机 Node ABI 编译的，打包后运行才报错
  npmRebuild: false,
  ...(publish ? { publish } : {}),
  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/',
  },
};
