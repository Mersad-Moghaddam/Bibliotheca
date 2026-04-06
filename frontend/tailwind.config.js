/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4B2E2B',
        secondary: '#6F4E37',
        background: '#F5E9DA',
        surface: '#E6D3B3',
        accent: '#C89F6A',
        text: '#2B1B17'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(43, 27, 23, 0.12)'
      }
    }
  },
  plugins: []
}
