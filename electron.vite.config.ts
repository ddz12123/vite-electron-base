import { resolve } from 'path';
import { defineConfig, loadEnv } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import pxtoviewport from 'postcss-px-to-viewport-8-plugin';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const prodDrop: Array<'console' | 'debugger'> = ['console', 'debugger'];
export default defineConfig(({ command }) => {
  const drop = command === 'build' ? prodDrop : [];
  const mode = command === 'serve' ? 'development' : 'production';
  const env = loadEnv(mode);

  return {
    main: {
      define: {
        'import.meta.env.VITE_APP_ID': JSON.stringify(env.VITE_APP_ID || 'com.electron.app'),
        'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'ViteElectronBase'),
      },
      esbuild: {
        drop,
      },
    },
    preload: {
      esbuild: {
        drop,
      },
    },
    renderer: {
      resolve: {
        alias: {
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
          dts: './src/types/components.d.ts',
          resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        }),
      ],
      css: {
        postcss: {
          plugins: [
            pxtoviewport({
              unitToConvert: 'px', // 需要转换的单位
              viewportWidth: 1920, // 设计稿视口宽度
              unitPrecision: 6, // vw 值保留的小数位数
              propList: ['*', '!font-size'], // 所有属性转换，排除 font-size
              viewportUnit: 'vw', // 视口单位
              selectorBlackList: [], // 选择器黑名单
              minPixelValue: 2, // 小于 2px 不转换，保留 1px 边框
              mediaQuery: false, // 不转换媒体查询中的 px
              replace: true, // 直接替换，不保留 px fallback
              include: [/[/\\]src[/\\]/i, /[/\\]element-plus[/\\]/i], // 只处理 src 和 element-plus 的样式
              landscape: false, // 不添加横屏媒体查询
            }),
          ],
        },
        preprocessorOptions: {
          scss: {
            additionalData: `@use "@renderer/styles/_variables.scss" as *; @use "@renderer/styles/main.scss" as *; @use "@renderer/styles/element/index.scss" as *;`,
          },
        },
      },
    },
  };
});
