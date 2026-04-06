/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)'
      }
    }
  },
  plugins: []
}
