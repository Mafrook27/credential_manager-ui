/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2962FF',
        secondary: '#00BFA5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Ensure Tailwind doesn't conflict with Bootstrap and MUI
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts
  },
}

