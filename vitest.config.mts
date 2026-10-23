import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// 只覆盖纯逻辑的单元测试；测试文件与源码同目录（*.test.ts）。
// 组件测试需要时再自行引入 @vue/test-utils 与 jsdom/happy-dom 环境
export default defineConfig({
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@shared': resolve('src/shared'),
    },
  },
  test: {
    environment: 'node',
  },
});
