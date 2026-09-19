import { resolve } from 'path';
import { defineConfig, loadEnv } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import pxtorem from 'postcss-pxtorem';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const prodDrop: Array<'console' | 'debugger'> = ['console', 'debugger'];
const sharedAlias = { '@shared': resolve('src/shared') };

export default defineConfig(({ command, mode }) => {
  const drop = command === 'build' ? prodDrop : [];
  const env = {
    ...loadEnv(mode),
    ...process.env,
  };

  return {
    main: {
      resolve: {
        alias: sharedAlias,
      },
      build: {
        externalizeDeps: true,
      },
      define: {
        'import.meta.env.VITE_APP_ID': JSON.stringify(env.VITE_APP_ID || 'com.electron.app'),
        'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'ViteElectronBase'),
        'import.meta.env.VITE_AUTO_UPDATE_ENABLED': JSON.stringify(
          env.VITE_AUTO_UPDATE_ENABLED || 'false',
        ),
        'import.meta.env.VITE_AUTO_UPDATE_DEV': JSON.stringify(env.VITE_AUTO_UPDATE_DEV || 'false'),
        'import.meta.env.VITE_UPDATE_URL': JSON.stringify(env.VITE_UPDATE_URL || ''),
      },
      esbuild: {
        drop,
      },
    },
    preload: {
      resolve: {
        alias: sharedAlias,
      },
      build: {
        // Bundle preload dependencies so it can run with Electron's sandbox enabled.
        externalizeDeps: false,
      },
      esbuild: {
        drop,
      },
    },
    renderer: {
      resolve: {
        alias: {
          ...sharedAlias,
          '@renderer': resolve('src/renderer/src'),
        },
      },
      plugins: [
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
