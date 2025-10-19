import globals from 'globals';
import js from '@eslint/js';
import jsoncParser from 'jsonc-eslint-parser';
import yamlParser from 'yaml-eslint-parser';
import markdown from '@eslint/markdown';

export default [
  {
    files: ['**/*.js'],
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-process-exit': 'off',
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
        },
      ],
      'no-useless-escape': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['test/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ['**/*.json', '**/*.jsonc'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
  {
    files: ['**/*.yml', '**/*.yaml'],
    languageOptions: {
      parser: yamlParser,
    },
  },
  {
    files: ['**/*.md'],
    processor: markdown.processors.markdown,
  },
  {
    files: ['**/*.md/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
