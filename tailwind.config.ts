import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: '[data-theme="dark"]',
  theme: {
    extend: {
      colors: {
        theme: {
          'bg-primary': 'var(--theme-bg-primary)',
          'bg-secondary': 'var(--theme-bg-secondary)',
          'bg-tertiary': 'var(--theme-bg-tertiary)',
          'surface': 'var(--theme-surface)',
          'surface-hover': 'var(--theme-surface-hover)',
          'surface-elevated': 'var(--theme-surface-elevated)',
          'text-primary': 'var(--theme-text-primary)',
          'text-secondary': 'var(--theme-text-secondary)',
          'text-muted': 'var(--theme-text-muted)',
          'text-link': 'var(--theme-text-link)',
          'border': 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
          'border-focus': 'var(--theme-border-focus)',
          'accent-primary': 'var(--theme-accent-primary)',
          'accent-secondary': 'var(--theme-accent-secondary)',
          'accent-success': 'var(--theme-accent-success)',
          'accent-warning': 'var(--theme-accent-warning)',
          'accent-error': 'var(--theme-accent-error)',
          'accent-info': 'var(--theme-accent-info)',
          'input-bg': 'var(--theme-input-bg)',
          'input-border': 'var(--theme-input-border)'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'Monaco',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'Consolas',
          '"Courier New"',
          'monospace'
        ]
      }
    }
  },
  plugins: []
};

export default config;



