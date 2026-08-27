/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          sidebar: '#1A1D24',
          bg: '#F4F6F8',
          card: '#FFFFFF',
          primary: '#8B4513',
        }
      }
    },
  },
  plugins: [],
}
