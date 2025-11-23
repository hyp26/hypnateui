const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Teal from Logo
        primary: {
          50: '#effcfd',
          100: '#d5f6f9',
          200: '#b0ecf2',
          300: '#7cdce7',
          400: '#42c3d4',
          500: '#3eb4c0', // Main Brand Color
          600: '#2691a0',
          700: '#237583',
          800: '#23606c',
          900: '#20505b',
          950: '#13343d',
        },
        // Brand Orange from Logo
        secondary: {
          50: '#fff8ed',
          100: '#ffefd5',
          200: '#ffdaa8',
          300: '#ffbf71',
          400: '#ff9d39',
          500: '#ff6b00', // Main Accent Color
          600: '#e64d00',
          700: '#bf3600',
          800: '#992b06',
          900: '#7c250b',
          950: '#431002',
        }
      }
    }
  },
  plugins: [],
};
