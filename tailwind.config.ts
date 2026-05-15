import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0b14",
          elevated: "#15151f",
          inset: "#0a0a12",
        },
        brand: {
          purple: "#a855f7",
          "purple-dark": "#7c3aed",
          teal: "#2dd4bf",
          "teal-dark": "#14b8a6",
        },
        border: {
          DEFAULT: "#26262e",
          subtle: "#1f1f28",
        },
        muted: {
          DEFAULT: "#a1a1aa",
          dim: "#71717a",
        },
        danger: "#f87171",
        success: "#34d399",
      },
      borderRadius: {
        pill: "9999px",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(168,85,247,0.4), 0 8px 30px rgba(168,85,247,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
