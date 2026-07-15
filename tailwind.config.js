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
        success: '#00BFA5',
        danger: '#E53935',
        warning: '#FFA000',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 20px -6px rgba(41, 98, 255, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.08)',
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

