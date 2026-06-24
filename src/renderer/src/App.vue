<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { useRootFontSize } from '@renderer/utils/rem';

useRootFontSize();
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
