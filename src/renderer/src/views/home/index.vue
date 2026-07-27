<template>
  <div class="home">
    <h1 class="home-title">Vite Electron Base</h1>
    <p class="home-desc">基础框架模板：Electron + Vue3 + TypeScript + Element Plus</p>
    <el-button type="primary">Element Plus 按钮</el-button>
    <Versions />
  </div>
</template>

<script lang="ts" setup>
import Versions from '@renderer/components/Versions.vue';
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;

  .home-title {
    margin: 0;
    color: $primary-color;
  }

  .home-desc {
    margin: 0;
    color: #666;
  }
}
</style>
