<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';

// 动态设置页面标题
const title = import.meta.env.VITE_APP_TITLE;
if (title) {
  document.title = title;
}
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
