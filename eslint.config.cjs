/* eslint-disable @typescript-eslint/no-require-imports */
/* global require, __dirname, module */

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const requireExtensions = require('eslint-plugin-require-extensions');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

module.exports = [
    {
        ignores: [
            '**/.changeset',
            '**/.github',
            '**/.next',
            '**/.parcel-cache',
            '**/docs',
            '**/lib',
            '**/build',
            '**/dist',
            '**/out',
        ],
    },
    ...fixupConfigRules(
        compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:prettier/recommended',
            'plugin:react/recommended',
            'plugin:react-hooks/recommended',
            'plugin:require-extensions/recommended'
        )
    ),
    {
        plugins: {
            '@typescript-eslint': fixupPluginRules(typescriptEslint),
            prettier: fixupPluginRules(prettier),
            react: fixupPluginRules(react),
            'react-hooks': fixupPluginRules(reactHooks),
            'require-extensions': fixupPluginRules(requireExtensions),
        },
        languageOptions: {
            parser: tsParser,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',
            'no-inner-declarations': 'off',
            'react/no-unescaped-entities': [
                'error',
                {
                    forbid: ['>'],
                },
            ],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
        },
    },
    {
        files: ['**/*.test.ts'],
        rules: {
            'require-extensions/require-extensions': 'off',
        },
    },
];
