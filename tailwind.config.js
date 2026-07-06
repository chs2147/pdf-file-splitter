/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#050505',
          charcoal: '#141414',
          line: '#2a2a2a',
          silver: '#9a9a9a',
          white: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Malgun Gothic', 'Apple SD Gothic Neo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
