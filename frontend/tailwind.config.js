/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#075DF5',
          dark: '#0648C4',
          light: '#4D8BFF',
        },
        secondary: '#666666',
        navy: '#10233F',
        accent: '#EAF0FF',
        surface: '#FFFFFF',
        muted: '#F3F5F8',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        soft: '0 10px 28px rgba(7, 93, 245, 0.16)',
        card: '0 2px 12px rgba(16, 35, 63, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
