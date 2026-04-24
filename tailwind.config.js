/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        surface: "#1a1d24",
        border: "#2a2f38",
        text: "#e8eaed",
        muted: "#9aa0a6",
        accent: "#7c9cff",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};