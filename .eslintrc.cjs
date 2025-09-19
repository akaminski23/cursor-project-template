module.exports = {
  root: true,
  ignorePatterns: ['.eslintrc.cjs', 'dist', '.next'],
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./apps/web/tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      extends: ['next', 'next/core-web-vitals', 'prettier']
    },
    {
      files: ['packages/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    }
  ]
};
