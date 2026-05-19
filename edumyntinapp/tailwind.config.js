/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        paper: '#fffaf0',
        canvas: '#f5f0e6',
        brand: {
          50: '#fef5df',
          100: '#fbe8b6',
          500: '#d98422',
          600: '#b66517',
          900: '#4a2b12',
        },
        leaf: {
          500: '#3d775f',
          700: '#255341',
        },
      },
      fontFamily: {
        display: ['SpaceMono'],
      },
      boxShadow: {
        card: '0 12px 30px rgba(23, 32, 51, 0.12)',
      },
    },
  },
  plugins: [],
};
