// @ts-check
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config([
  {
    ignores: ['backend/**', 'frontend/**'],
  },
  {
    languageOptions: { globals: globals.node },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
]);
