import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      colors: {
        accent: '#cc4847',
        ink: {
          DEFAULT: '#222222', // near-black, not pure black
          light: '#484848',
          muted: '#717171',   // for placeholder-style text like "Add dates"
        },
      },
    },
  },
  plugins: [
    animate,
  ],
}
