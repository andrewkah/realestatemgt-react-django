import { mtConfig } from "@material-tailwind/react";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // THIS IS CRUCIAL FOR CLASS-BASED DARK MODE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can extend your theme here, e.g., custom colors, fonts
      colors: {
        primary: {
          light: "#6366f1", // Example primary color for light mode
          dark: "#818cf8", // Example primary color for dark mode
        },
        secondary: {
          light: "#f87171",
          dark: "#fca5a5",
        },
        // Define text and background colors explicitly for theme consistency
        // This helps manage base colors that might not be directly tied to Tailwind's default dark mode behavior
        "base-background": "var(--color-base-background)",
        "base-text": "var(--color-base-text)",
        "card-background": "var(--color-card-background)",
        "card-text": "var(--color-card-text)",
      },
    },
  },
  plugins: [mtConfig],
};
