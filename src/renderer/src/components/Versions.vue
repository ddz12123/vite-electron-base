<script setup lang="ts">
import { computed } from 'vue';
import { useAppInfo } from '@renderer/composables/useAppInfo';

const { info, loading } = useAppInfo();
const versions = computed(() => ({
  app: info.value?.version || '开发环境',
  electron: info.value?.electronVersion || window.electron.process.versions.electron,
  chrome: info.value?.chromeVersion || window.electron.process.versions.chrome,
  node: info.value?.nodeVersion || window.electron.process.versions.node,
}));
</script>

<template>
  <ul class="versions">
    <li class="app-version">App v{{ versions.app }}</li>
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
    <li v-if="loading" class="loading">正在读取应用信息...</li>
  </ul>
</template>
