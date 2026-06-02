import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
	{
		ignores: ['dist', 'node_modules', '*.config.ts', '*.config.js', 'public', 'scripts'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	eslintPluginPrettier,
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				parser: {
					ts: '@typescript-eslint/parser',
					js: 'espree',
					'<template>': 'espree',
				},
				extraFileExtensions: ['.vue'],
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				performance: 'readonly',
				AudioContext: 'readonly',
				localStorage: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				HTMLElement: 'readonly',
				Element: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLTextAreaElement: 'readonly',
				HTMLSelectElement: 'readonly',
				KeyboardEvent: 'readonly',
				Event: 'readonly',
				MouseEvent: 'readonly',
			},
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				console: 'readonly',
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				performance: 'readonly',
				AudioContext: 'readonly',
				localStorage: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				HTMLElement: 'readonly',
				Element: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLTextAreaElement: 'readonly',
				HTMLSelectElement: 'readonly',
				KeyboardEvent: 'readonly',
				Event: 'readonly',
				MouseEvent: 'readonly',
			},
		},
	},
	{
		rules: {
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'preserve-caught-error': 'warn',
			'vue/multi-word-component-names': 'off',
			'vue/no-v-html': 'warn',
		},
	},
];
