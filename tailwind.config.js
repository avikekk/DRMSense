/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#000000',
          800: '#111111',
          700: '#1a1a1a'
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['Satoshi', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
