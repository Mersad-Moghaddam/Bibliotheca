/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        walnut:'#3b2a23', coffee:'#5d4032', parchment:'#eadcc8', cream:'#f9f3e8', bronze:'#a67c52'
      },
      boxShadow: { cozy:'0 8px 28px rgba(59,42,35,.12)'}
    }
  },
  plugins: []
}
