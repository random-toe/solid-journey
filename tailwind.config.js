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
          DEFAULT: "#211f2e",
          light: "#2a283c",
          dark: "#181725",
        },
        // gold accent — buttons, highlights, the "&" between names
        gold: {
          DEFAULT: "#d8a657",
          light: "#e6c17a",
          dark: "#b98c4a",
        },
        // cream/paper color for scrapbook + letter cards
        paper: {
          DEFAULT: "#f4eee4",
          light: "#f2eae0",
        },
        // muted rose for the tap-tap button + eyebrow labels
        rose: {
          DEFAULT: "#c97b84",
        },
        // used sparingly in the corner color-wash on the background
        lavender: {
          DEFAULT: "#a79fc7",
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