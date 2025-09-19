import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937'
      }
    }
  },
  plugins: []
};

export default config;
