/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d47a1',
        'primary-dark': '#0b3a82',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        muted: '#64748b',
        gov: {
          blue: '#1e3a8a', // Deep Blue
          primary: '#0d47a1', // Main Accent
          saffron: '#ff9933', // Indian Saffron
          green: '#138808', // Indian Green
          bg: '#f8fafc',
          text: '#1e293b',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
