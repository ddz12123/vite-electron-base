import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore(
  'app',
  () => {
    const appName = import.meta.env.VITE_APP_TITLE || 'ViteElectronBase';
    const sidebarCollapsed = ref(false);

    return {
      appName,
      sidebarCollapsed,
    };
  },
  {
    persist: {
      pick: ['sidebarCollapsed'],
    },
  },
);
