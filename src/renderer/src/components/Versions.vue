<script setup lang="ts">
import { useAppInfo } from '@renderer/composables/useAppInfo';

const { info, loading, error } = useAppInfo();
</script>

<template>
  <ul class="versions">
    <template v-if="info">
      <li class="app-version">App v{{ info.version }}</li>
      <li class="electron-version">Electron v{{ info.electronVersion }}</li>
      <li class="chrome-version">Chromium v{{ info.chromeVersion }}</li>
      <li class="node-version">Node v{{ info.nodeVersion }}</li>
    </template>
    <li v-else-if="loading" class="loading">正在读取应用信息...</li>
    <li v-else-if="error" class="error">{{ error.message }}</li>
  </ul>
</template>
