import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Node-specific overrides (config/build files)
  {
    files: ['vite.config.js', '**/*.config.js', '**/scripts/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {},
  },
  // Component file exporting helpers: relax react-refresh constraint for this file
  {
    files: ['src/components/ToolCard.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
