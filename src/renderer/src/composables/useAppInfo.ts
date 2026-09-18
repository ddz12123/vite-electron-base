import { onMounted, ref } from 'vue';
import type { AppInfo } from '@shared/app';

export const useAppInfo = () => {
  const info = ref<AppInfo | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const load = async (): Promise<void> => {
    if (loading.value || info.value) return;

    loading.value = true;
    error.value = null;

    try {
      info.value = await window.api.getInfo();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('Failed to load app info');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    void load();
  });

  return {
    info,
    loading,
    error,
    load,
  };
};
