import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        graffiti: "graffiti 2s ease-in-out infinite",
        "graffiti-slow": "graffiti 4s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        graffiti: {
          "0%, 100%": {
            backgroundColor: "transparent",
            transform: "scale(1)",
          },
          "25%": {
            backgroundColor: "#ef4444", // red-500
            transform: "scale(1.05) rotate(1deg)",
          },
          "50%": {
            backgroundColor: "#3b82f6", // blue-500
            transform: "scale(1.1) rotate(-1deg)",
          },
          "75%": {
            backgroundColor: "#10b981", // emerald-500
            transform: "scale(1.05) rotate(0.5deg)",
          },
        },
      },
      colors: {
        sudoku: {
          primary: "#1e40af", // blue-700
          secondary: "#374151", // gray-700
          success: "#059669", // emerald-600
          error: "#dc2626", // red-600
          warning: "#d97706", // amber-600
          background: {
            light: "#ffffff",
            dark: "#111827", // gray-900
          },
          border: {
            light: "#d1d5db", // gray-300
            dark: "#374151", // gray-700
          },
        },
      },
      fontFamily: {
        sudoku: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
