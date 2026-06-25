/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#003087',
          secondary: '#0066CC',
          accent: '#FF6B00',
        },
      },
    },
  },
  plugins: [],
}
