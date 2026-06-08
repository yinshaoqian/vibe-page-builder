const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: { DEFAULT: '#2F6BFF' },
        surface: { bg: '#F6F8FB', card: '#FFFFFF' },
        text: { primary: '#152033', secondary: '#637089' },
        success: '#16A37B',
        border: '#E6EAF2',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}