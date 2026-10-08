import babelParser from '@babel/eslint-parser';

// Only formatting rules: blank lines around ifs, returns and const/let blocks.
// Babel parses TS/JSX here because typescript-eslint doesn't support TypeScript 7 yet.
export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: { plugins: ['typescript', 'jsx'] },
        },
      },
    },
    rules: {
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['if', 'return'] },
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'always', prev: '*', next: ['const', 'let'] },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        // A run of ifs or of declarations stays together as one block
        { blankLine: 'any', prev: 'if', next: 'if' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
      ],
      'no-trailing-spaces': 'error',
    },
  },
];
