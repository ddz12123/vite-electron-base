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
│           ├── assets/    # 静态资源
│           ├── components/# 公共组件
│           ├── composables# 组合式函数
│           ├── constant/  # 常量
│           ├── router/    # 路由
│           ├── store/     # Pinia 状态管理
│           ├── styles/    # 全局样式
│           ├── types/     # 类型定义
│           ├── utils/     # 工具函数
│           ├── views/     # 页面组件
│           ├── App.vue
│           └── main.ts
├── resources/             # 应用资源（图标等）
├── build/                 # 构建资源
├── scripts/               # 构建脚本
├── electron.vite.config.ts
├── electron-builder.config.mjs
└── package.json
```

## 架构约定

- 主进程能力集中在 `main/`，窗口入口只负责生命周期和窗口创建。
- renderer 不直接导入 Electron，只通过 preload 暴露的类型化 `window.api` 调用原生能力。
- IPC channel 和跨进程数据类型统一放在 `src/shared/`，避免字符串和接口重复维护。
- 可复用的 renderer 逻辑放在 `composables/`，页面组件只负责组合业务和展示。
- 路由使用 `meta.title` 管理窗口标题；需要登录的页面可使用 `meta.requiresAuth` 扩展路由守卫。

## 环境变量配置

| 变量                        | 说明                   | 示例                           |
| --------------------------- | ---------------------- | ------------------------------ |
| `VITE_APP_ID`               | 应用唯一标识           | `com.electron.app`             |
| `VITE_APP_TITLE`            | 应用显示名称（可中文） | `ViteElectronBase`             |
| `VITE_APP_EXECUTABLE_NAME`  | 可执行文件名（英文）   | `vite-electron-base`           |
| `VITE_API_BASE_URL`         | API 接口地址           | `http://localhost:3000/api`    |
| `VITE_AUTO_UPDATE_ENABLED`  | 是否启用自动更新       | `false`                        |
| `VITE_AUTO_UPDATE_PROVIDER` | 更新发布方式           | `github` / `generic`           |
| `VITE_UPDATE_URL`           | Generic 更新地址       | `https://updates.example.com/` |
| `VITE_UPDATE_GITHUB_OWNER`  | GitHub 仓库所有者      | `your-org`                     |
| `VITE_UPDATE_GITHUB_REPO`   | GitHub 仓库名          | `your-app`                     |

环境文件：

- `.env` — 默认配置
- `.env.development` — 开发环境
- `.env.production` — 生产环境

`VITE_UPDATE_URL` 未配置时不会启用自动更新，也不会在安装包中写入示例发布地址。

自动更新默认关闭。GitHub Releases 和自定义更新服务器的 CI 配置见 [`docs/ci.md`](docs/ci.md)。

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

## 主要功能

- ✅ Electron + Vue 3 + TypeScript 开发环境
- ✅ Vite 热更新
- ✅ Element Plus UI 组件库
- ✅ Pinia 状态管理（支持持久化）
- ✅ Vue Router 路由管理
- ✅ Tailwind CSS 原子化样式
- ✅ postcss-pxtorem 自适应方案
- ✅ ESLint + Prettier 代码规范
- ✅ Husky + lint-staged Git 提交规范
- ✅ 环境变量配置（dev/prod）
- ✅ 自动打包配置
- ✅ 自动更新配置（默认关闭，支持 GitHub / Generic）

## 许可证

MIT
