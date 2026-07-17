import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'snippets', 'test-country-map.js', 'test-country-map.mjs']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
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
      // Without these, no-unused-vars can't see that a variable used only
      // as a JSX tag (<Foo />) counts as "used" — was causing every
      // JSX-used import in the project to be falsely flagged as dead.
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'no-unused-vars': [
        'warn', 
        { 
          varsIgnorePattern: '^_',
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      'no-empty': 'warn',
    },
  },
])
