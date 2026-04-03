const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
     colors: {
          "noey-primary":      "#F9695A",
          "noey-dark":         "#3D2B3D",
          "noey-bg":           "#FFFDFA",
          "noey-neutral":      "#F8EFE2",
          "noey-text":         "#3D2B3D",
          "noey-text-muted":   "#9B8FA0",
          "noey-gem":          "#F9695A",
          // Aliases to keep old code from breaking during migration
          "noey-surface":      "#F8EFE2",
          "noey-surface-dark": "#EDE8E0",
          "noey-card-dark":    "#3D2B3D",
          "noey-gem-light":    "#FFF0F4",
        },
      fontFamily: {
        sans:    ["Poppins", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#ECEDF2",
            foreground: "#111114",
            primary: { DEFAULT: "#2B2B33", foreground: "#FFFFFF" },
            secondary: { DEFAULT: "#E2E3E9", foreground: "#111114" },
            danger: { DEFAULT: "#E8396A", foreground: "#FFFFFF" },
          },
        },
      },
    }),
  ],
};
