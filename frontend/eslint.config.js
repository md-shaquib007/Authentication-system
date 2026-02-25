import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist']),

    {
        files: ['**/*.{js,jsx}'],

        extends: [
            js.configs.recommended,
            react.configs.flat.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        rules: {
            'react/prop-types': 'off', // not needed with TS or modern React
            'react-refresh/only-export-components': 'off',
            'react/jsx-no-target-blank': 'off',

            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
]);
