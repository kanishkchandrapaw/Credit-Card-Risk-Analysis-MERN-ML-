/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'float': 'float 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-20px) rotate(2deg)' },
          '50%': { transform: 'translateY(-40px) rotate(-2deg)' },
          '75%': { transform: 'translateY(-20px) rotate(1deg)' },
        }
      },
    },
  },
  plugins: [],
}
