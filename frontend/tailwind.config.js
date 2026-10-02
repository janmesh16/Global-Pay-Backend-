/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0fa3a3', // Primary Teal
          600: '#0d8989',
          700: '#0f6c6c',
          800: '#115656',
          900: '#134747',
          950: '#072727',
        },
        navy: {
          800: '#132847',
          900: '#0B1F3A', // Surface dark mode
          950: '#061325',
        },
        amber: {
          accent: '#F5A524',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
}
