/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#FFFFFF',
          100: '#F7F7F8',
          200: '#F1F1F3',
          300: '#E5E5E7',
        },
        ink: {
          900: '#171717',
          950: '#000000',
        },
      },
      borderRadius: {
        card: '0.625rem',
      },
    },
  },
  plugins: [],
};
