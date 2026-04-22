import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        num: ['var(--font-num)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      colors: {
        ink: 'var(--ink)',
        steel: 'var(--steel)',
        mist: 'var(--mist)',
        fog: 'var(--fog)',
        line: 'var(--line)',
        snow: 'var(--snow)',
        forest: 'var(--forest)',
        grove: 'var(--grove)',
        leaf: 'var(--leaf)',
        mint: 'var(--mint)',
        pale: 'var(--pale)',
      },
    },
  },
  plugins: [],
};

export default config;
