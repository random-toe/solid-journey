/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // dark, slightly purple-tinted background
        ink: {
          DEFAULT: "#1a1625",
          light: "#241f33",
          dark: "#120f1a",
        },
        // gold accent — buttons, highlights, the "&" between names
        gold: {
          DEFAULT: "#d4a24c",
          light: "#e6c17a",
          dark: "#b8842f",
        },
        // cream/paper color for scrapbook + letter cards
        paper: {
          DEFAULT: "#f5ede0",
          light: "#faf5ec",
        },
        // muted rose for the tap-tap button on the Time panel
        rose: {
          DEFAULT: "#e88ca0",
        },
      },
      fontFamily: {
        // elegant serif for the couple's names / headings
        serif: ["'Playfair Display'", "Georgia", "serif"],
        // clean sans-serif for body text and UI chrome
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}