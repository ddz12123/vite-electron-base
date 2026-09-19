import { watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

// 桌面端按窗口宽度等比缩放：>= DESIGN_WIDTH 一律 1:1，只向下缩
const DESIGN_WIDTH = 1280;
const BASE_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;

const updateRootFontSize = (viewportWidth: number): void => {
  const scaledFontSize = (viewportWidth / DESIGN_WIDTH) * BASE_FONT_SIZE;
  const nextFontSize = Math.min(Math.max(scaledFontSize, MIN_FONT_SIZE), BASE_FONT_SIZE);
  document.documentElement.style.fontSize = `${nextFontSize}px`;
};

export const useRootFontSize = (): void => {
  const { width } = useWindowSize();

  watch(width, updateRootFontSize, { immediate: true });
};
