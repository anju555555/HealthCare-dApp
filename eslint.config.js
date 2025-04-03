import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/js/app.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        Web3: 'readonly',
        TruffleContract: 'readonly',
        App: 'writable', 
        alert: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      '**/*.min.js',
      'src/js/truffle-contract.js',
      'src/js/web3.min.js',
      'src/js/bootstrap.min.js',
    ],
  },
]; 