import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'electron-vite';
import type { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import pxtorem from 'postcss-pxtorem';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { loadAppEnv } from './build/env.mjs';

// Vite 8（Rolldown/Oxc）起旧的 esbuild 配置已被 Oxc 取代，且 esbuild.drop 不会再被转换；
// 生产构建改用 Oxc minify 的 compress.drop* 达到同样效果：移除 console 与 debugger。
// mangle/codegen 关闭：不混淆标识符、不压掉换行，生产产物保持可读（与旧行为对齐）
const prodMinify = {
  compress: { dropConsole: true, dropDebugger: true },
  mangle: false,
  codegen: false,
};
const sharedAlias = { '@shared': resolve('src/shared') };

type AppEnv = ReturnType<typeof loadAppEnv>;

// 把补齐默认值后的变量注入 import.meta.env；各进程只注入自己用到的，避免无关配置进产物
const defineEnv = (env: AppEnv, keys: (keyof AppEnv)[]): Record<string, string> =>
  Object.fromEntries(keys.map((key) => [`import.meta.env.${key}`, JSON.stringify(env[key])]));

// index.html 的 %VITE_*% 只认 .env 文件里真实存在的变量，缺省时会原样留在 HTML 里；
// 先于 Vite 内置替换执行，用补齐默认值后的变量替换
const htmlEnvPlugin = (env: AppEnv): Plugin => ({
  name: 'app:html-env',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/%(VITE_[A-Z0-9_]+)%/g, (match, key: string) =>
        key in env ? env[key as keyof AppEnv] : match,
      ),
  },
});

// ElementPlusResolver 在 transform 阶段才注入 element-plus 的 import（依赖扫描器看不到），
// 不预置进 optimizeDeps.include 的话，首次使用（或新加）组件时 Vite 会中途发现“新依赖”，
// 触发 "optimized dependencies changed. reloading" 整页重载；这里启动时就把全部组件
// 样式入口一并预置，之后新增组件也自动覆盖，dev 期间不再因自动导入而整页重载
const epComponentsDir = resolve('node_modules/element-plus/es/components');
const elementPlusDeps = [
  'element-plus/es',
  ...(existsSync(epComponentsDir)
    ? readdirSync(epComponentsDir)
        .filter((name) => existsSync(resolve(epComponentsDir, name, 'style', 'index.mjs')))
        .map((name) => `element-plus/es/components/${name}/style/index`)
    : []),
];

export default defineConfig(({ command, mode }) => {
  // 仅生产构建启用去除，dev 不做处理（与原 esbuild.drop 的生效范围一致）
  const buildMinify =
    command === 'build' ? { rolldownOptions: { output: { minify: prodMinify } } } : {};
  const env = loadAppEnv(mode);

  return {
    main: {
      resolve: {
        alias: sharedAlias,
      },
      build: {
        externalizeDeps: true,
        ...buildMinify,
      },
      define: defineEnv(env, [
        'VITE_APP_ID',
        'VITE_APP_TITLE',
        'VITE_AUTO_UPDATE_ENABLED',
        'VITE_AUTO_UPDATE_DEV',
        'VITE_UPDATE_URL',
      ]),
    },
    preload: {
      resolve: {
        alias: sharedAlias,
      },
      build: {
        // Bundle preload dependencies so it can run with Electron's sandbox enabled.
        externalizeDeps: false,
        ...buildMinify,
      },
    },
    renderer: {
      resolve: {
        alias: {
          ...sharedAlias,
          '@renderer': resolve('src/renderer/src'),
        },
      },
      define: defineEnv(env, ['VITE_APP_TITLE', 'VITE_API_BASE_URL']),
      build: {
        // 生产构建压缩 renderer 产物（JS 走 Oxc minify，CSS 由 lightningcss 默认接管），dev 不压缩
        minify: command === 'build' ? 'oxc' : false,
      },
      optimizeDeps: {
        // 预置注入型依赖，避免运行中才发现新依赖触发整页重载（详见文件顶部注释）
        include: elementPlusDeps,
      },
      server: {
        watch: {
          // unplugin 生成的 dts 是纯类型产物，写入不应参与热更新，避免无效的整页重载
          ignored: ['**/types/auto-imports.d.ts', '**/types/components.d.ts'],
        },
      },
      plugins: [
        htmlEnvPlugin(env),
        vue(),
        tailwindcss(),
        AutoImport({
          imports: ['vue', 'pinia', 'vue-router'],
          dts: './src/types/auto-imports.d.ts',
          resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        }),
        Components({
          // 业务组件一律显式 import，只让解析器自动注册 Element Plus 组件
          dirs: [],
          dts: './src/types/components.d.ts',
          resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        }),
      ],
      css: {
        postcss: {
          plugins: [
            pxtorem({
              rootValue: 16,
              // font-size 和 Element Plus 的样式都必须一起转：漏掉任何一类，
              // 根字号缩放时就会有一部分尺寸跟着缩、一部分不动，布局直接错位
              propList: ['*'],
              selectorBlackList: ['.no-rem'],
              unitPrecision: 3,
              replace: true,
              mediaQuery: false,
              // 1px 必须留在 px：Element Plus 也参与转换后，1px 描边会变成
              // 0.0625rem，窄窗口缩到 0.75 倍就不足 1 物理像素、直接发虚
              minPixelValue: 2,
            }),
          ],
        },
        preprocessorOptions: {
          scss: {
            // element/index.scss 必须注入：它是 EP 主色覆盖唯一的生效入口
            // （Vite 会把它前置到 Element Plus 自身的 .scss，EP 组件样式才能读到配置过的 common/var）
            additionalData: `@use "@renderer/styles/_variables.scss" as *; @use "@renderer/styles/element/index.scss" as *;`,
          },
        },
      },
    },
  };
});
