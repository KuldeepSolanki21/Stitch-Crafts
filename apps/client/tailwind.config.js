/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          light: '#C49A6C',
          DEFAULT: '#8B4513',
          dark: '#5C2C0E',
        },
        charcoal: {
          DEFAULT: '#1E1E1E',
          dark: '#121212',
        },
        parchment: {
          light: '#FAF8F5',
          DEFAULT: '#F3EFEA',
        },
        brass: {
          DEFAULT: '#C5A059',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
