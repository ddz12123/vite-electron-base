import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const prodDrop: Array<'console' | 'debugger'> = ['console', 'debugger'];

export default defineConfig(({ command, mode }) => {
  const drop = command === 'build' ? prodDrop : [];
  const env = loadEnv(mode);

  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      define: {
        'import.meta.env.VITE_APP_ID': JSON.stringify(env.VITE_APP_ID || 'com.electron.app'),
        'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'ViteElectronBase'),
      },
      esbuild: {
        drop,
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
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
            autoprefixer(),
            pxtorem({
              rootValue: 16,
              propList: ['*', '!font-size'],
              selectorBlackList: ['.no-rem'],
              unitPrecision: 1,
              replace: true,
              mediaQuery: false,
              minPixelValue: 1,
              exclude: /node_modules/i,
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
