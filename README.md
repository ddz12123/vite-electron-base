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
- **postcss-px-to-viewport** — 移动端适配方案

## 推荐开发环境

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 项目结构

```text
├── src/
│   ├── main/              # 主进程
│   │   └── index.ts
│   ├── preload/           # 预加载脚本
│   │   └── index.ts
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

## 环境变量配置

| 变量                       | 说明                   | 示例                        |
| -------------------------- | ---------------------- | --------------------------- |
| `VITE_APP_ID`              | 应用唯一标识           | `com.electron.app`          |
| `VITE_APP_TITLE`           | 应用显示名称（可中文） | `ViteElectronBase`          |
| `VITE_APP_EXECUTABLE_NAME` | 可执行文件名（英文）   | `vite-electron-base`        |
| `VITE_API_BASE_URL`        | API 接口地址           | `http://localhost:3000/api` |

环境文件：

- `.env` — 默认配置
- `.env.dev` — 开发环境
- `.env.prod` — 生产环境

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
- ✅ postcss-px-to-viewport 自适应方案
- ✅ ESLint + Prettier 代码规范
- ✅ Husky + lint-staged Git 提交规范
- ✅ 环境变量配置（dev/prod）
- ✅ 自动打包配置

## 许可证

MIT
