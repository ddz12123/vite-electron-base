import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import tseslint from '@electron-toolkit/eslint-config-ts';
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const autoImportsDtsPath = fileURLToPath(
  new URL('./src/renderer/src/types/auto-imports.d.ts', import.meta.url),
);
// Only expose runtime auto-imports to ESLint; type-only exports stay checked.
const autoImportRuntimeNames = existsSync(autoImportsDtsPath)
  ? [
      ...readFileSync(autoImportsDtsPath, 'utf8').matchAll(/^\s*const\s+([A-Za-z_$][\w$]*)\s*:/gm),
    ].map(([, name]) => name)
  : [];
const autoImportGlobals = Object.fromEntries(
  autoImportRuntimeNames.map((name) => [name, 'readonly']),
);

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      globals: autoImportGlobals,
    },
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
    },
  },
  eslintConfigPrettier,
);
