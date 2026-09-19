# vite-electron-base

基于 Electron + Vue 3 + TypeScript 的桌面应用模板。

## 技术栈

- **Electron** — 跨平台桌面应用框架
- **Vue 3** — 前端框架（Composition API）
- **TypeScript** — 类型安全
- **Vite** — 构建工具
- **Element Plus** — UI 组件库
- **Pinia** — 状态管理（支持持久化）
- **Vue Router** — 路由管理
- **Tailwind CSS** — 原子化 CSS
- **postcss-pxtorem** — 基于 rem 的尺寸适配方案

## 推荐开发环境

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 项目结构

```text
├── src/
│   ├── main/              # 主进程
│   │   ├── index.ts        # 应用生命周期与窗口
│   │   ├── ipc.ts          # IPC handler 注册
│   │   ├── security.ts     # 导航与外链安全规则
│   │   └── updater.ts      # 自动更新
│   ├── preload/           # 预加载脚本
│   │   ├── index.ts        # 类型化 renderer API
│   │   └── index.d.ts
│   ├── shared/             # 主进程、preload、renderer 共享类型
│   │   ├── app.ts
│   │   └── channels.ts
│   └── renderer/          # 渲染进程
│       └── src/
│           ├── components/# 公共组件
│           ├── composables# 组合式函数
│           ├── constant/  # 常量（路由名、存储键）
│           ├── router/    # 路由
│           ├── store/     # Pinia 状态管理
│           ├── styles/    # 全局样式
│           ├── types/     # 类型定义（自动生成，不入库）
│           ├── utils/     # 工具函数
│           ├── views/     # 页面组件
│           ├── App.vue
│           └── main.ts
├── resources/             # 应用资源（图标等）
├── build/                 # 构建资源
├── electron.vite.config.ts
├── electron-builder.config.mjs
└── package.json
```

## 架构约定

- 主进程能力集中在 `main/`，窗口入口只负责生命周期和窗口创建。
- renderer 不直接导入 Electron，只通过 preload 暴露的类型化 `window.api` 调用原生能力。
- IPC channel 和跨进程数据类型统一放在 `src/shared/`，三个环境都用 `@shared/` 别名引用，避免字符串和接口重复维护。
- 业务组件一律显式 `import`（`components/` 不参与自动注册），只有 Element Plus 组件由解析器按需引入。
- 可复用的 renderer 逻辑放在 `composables/`，页面组件只负责组合业务和展示。
- 路由使用 `meta.title` 管理窗口标题；需要登录的页面标 `meta.requiresAuth`，路由守卫会校验本地 token，未注册登录路由时重定向回首页而不是放行。
- 路由名统一从 `constant/route.ts` 的 `ROUTE_NAMES` 引用，避免注册处与守卫、401 跳转处大小写不一致。

## 环境变量配置

| 变量                        | 说明                    | 示例                           |
| --------------------------- | ----------------------- | ------------------------------ |
| `VITE_APP_ID`               | 应用唯一标识            | `com.electron.app`             |
| `VITE_APP_TITLE`            | 应用显示名称（可中文）  | `ViteElectronBase`             |
| `VITE_APP_EXECUTABLE_NAME`  | 可执行文件名（英文）    | `vite-electron-base`           |
| `VITE_API_BASE_URL`         | API 接口地址            | `http://localhost:3000/api`    |
| `VITE_CSP_CONNECT_SRC`      | CSP 允许请求的来源      | `https://api.example.com`      |
| `VITE_AUTO_UPDATE_ENABLED`  | 是否启用自动更新        | `false`                        |
| `VITE_AUTO_UPDATE_DEV`      | 开发环境调试自动更新    | `false`                        |
| `VITE_AUTO_UPDATE_PROVIDER` | 更新发布方式            | `github` / `generic`           |
| `VITE_UPDATE_URL`           | Generic 更新地址        | `https://updates.example.com/` |
| `VITE_UPDATE_GITHUB_OWNER`  | GitHub 仓库所有者       | `your-org`                     |
| `VITE_UPDATE_GITHUB_REPO`   | GitHub 仓库名           | `your-app`                     |
| `VITE_NSIS_GUID`            | 固定安装包 GUID（可选） | `f8941786-...`                 |

环境文件：

- `.env` — 默认配置
- `.env.development` — 开发环境
- `.env.production` — 生产环境

`VITE_UPDATE_URL` 未配置时不会启用自动更新，也不会在安装包中写入示例发布地址。

自动更新默认关闭。GitHub Releases 和自定义更新服务器的 CI 配置见 [`docs/ci.md`](docs/ci.md)。检查或下载失败会写入系统日志目录下的 `updater.log`（`app.getPath('logs')`），更新包下载完成后弹系统通知。

## 尺寸适配

`postcss-pxtorem` 把项目内与 Element Plus 的 px 统一转成 rem（`rootValue: 16`；`minPixelValue: 2`，`1px` 描边保持 px 不转换），`utils/rem.ts` 按窗口宽度改 `html` 根字号：内容宽度 ≥1280 一律 1:1（窗口用 `useContentSize` 按内容尺寸设定），更窄时等比缩小、最低 12px。

两侧必须一起转：任何一类样式漏掉（例如只排除 node_modules 或只排除 `font-size`），缩放时就会出现一部分尺寸跟着缩、一部分不动，直接错位。需要固定像素的元素加 `.no-rem` 前缀选择器。

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 类型检查

```bash
pnpm typecheck
```

### 代码检查

```bash
pnpm lint
```

### 代码格式化

```bash
pnpm format
```

## 打包构建

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

打包配置从环境变量读取应用名称，安装包文件名格式：`{executableName}-{version}-setup.{ext}`

## Windows 安装与卸载

`pnpm build:win` 产出向导式（非一键）安装包，配置在 `electron-builder.config.mjs` 的 `nsis` 段，交互逻辑在 `build/installer.nsh`：

1. 选择语言（中文 / 英文）
2. 选择安装范围（仅当前用户 / 所有用户）
3. 选择安装目录（会自动补上应用名子目录）
4. 附加选项：创建桌面图标、开机后自动启动
5. 完成页可勾选立即运行

- 开机自启写注册表 `Run` 项：当前用户安装写 `HKCU`，所有用户安装写 `HKLM`。
- 卸载时弹窗询问是否删除用户数据（`%APPDATA%\<应用名>`），默认保留；静默卸载不弹窗。
- 脚本化安装/卸载参数：`setup.exe /S`（静默，沿用注册表里的原目录）、`--no-desktop-shortcut`、`--delete-app-data`、`/D=目录`（须为最后一个参数）；`Uninstall.exe /S --delete-app-data` 为静默删除数据。
- 选项会记录在 `HKCU\Software\<安装包 GUID>`，重装时复选框默认值沿用上次选择。

## 升级与覆盖安装

- 自动更新以 `--updated` 静默运行安装器：跳过选项页、保持原目录、不重建快捷方式、不删用户数据。
- 注册表与"应用和功能"里的记录由安装包 GUID 标识，默认从 `VITE_APP_ID` 派生。发布后不要改 `VITE_APP_ID`，否则 Windows 会当成两个应用而不是覆盖升级；确实要改时用 `VITE_NSIS_GUID` 固定成原来的 GUID。
- `uninstallDisplayName` 不带版本号，控制面板始终只有一条记录。
- 开启了差量更新（`differentialPackage`），发布时保留上一版的 `*.nsis.7z` 才能只下载差异部分。
- 默认按当前用户安装到 `%LOCALAPPDATA%\Programs`，自动更新不需要管理员权限。

## 主要功能

- ✅ Electron + Vue 3 + TypeScript 开发环境
- ✅ Vite 热更新
- ✅ Element Plus UI 组件库
- ✅ Pinia 状态管理（支持持久化）
- ✅ Vue Router 路由管理
- ✅ Tailwind CSS 原子化样式
- ✅ postcss-pxtorem 自适应方案（≥1280 宽 1:1，窄窗口等比缩小）
- ✅ ESLint + Prettier 代码规范
- ✅ Husky + lint-staged Git 提交规范
- ✅ 环境变量配置（dev/prod）
- ✅ 自动打包配置
- ✅ 自动更新配置（默认关闭，支持 GitHub / Generic，下载完成后系统通知）

## 许可证

MIT
