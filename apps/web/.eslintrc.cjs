module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint'],
  overrides: [{ files: ['*.ts', '*.tsx'] }],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-irregular-whitespace': 'error',
    'no-debugger': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
