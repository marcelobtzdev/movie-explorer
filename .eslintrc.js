module.exports = {
  extends: '@react-native',
  ignorePatterns: ['.toolchain/', 'coverage/'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      },
    },
    {
      env: { jest: true },
      files: ['jest.setup.js'],
    },
  ],
  plugins: ['perfectionist', 'reactotron'],
  root: true,
  rules: {
    'no-console': 'warn',
    'perfectionist/sort-array-includes': 'error',
    'perfectionist/sort-interfaces': 'error',
    'perfectionist/sort-jsx-props': 'error',
    'perfectionist/sort-objects': 'error',
    'react-native/no-inline-styles': 'error',
    'react/prefer-read-only-props': 'error',
    'reactotron/no-tron-in-production': 'error',
  },
};
