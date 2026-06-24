import { watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

const DESIGN_WIDTH = 1920;
const BASE_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;

const updateRootFontSize = (viewportWidth: number): void => {
  const nextFontSize = Math.max((viewportWidth / DESIGN_WIDTH) * BASE_FONT_SIZE, MIN_FONT_SIZE);
  document.documentElement.style.fontSize = `${nextFontSize}px`;
};

export const useRootFontSize = (): void => {
  const { width } = useWindowSize();

  watch(width, updateRootFontSize, { immediate: true });
};
