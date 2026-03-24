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
        "noey-bg": "#ECEDF2",
        "noey-surface": "#E2E3E9",
        "noey-surface-dark": "#D4D5DC",
        "noey-card-dark": "#3A3A42",
        "noey-text": "#111114",
        "noey-text-muted": "#9B9BA8",
        "noey-primary": "#2B2B33",
        "noey-gem": "#E8396A",
        "noey-gem-light": "#FFF0F4",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
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
