import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        panel: "#211d1a",
        line: "rgba(245,235,220,0.14)",
        mint: "#d99a4e",
        solar: "#c7a46a",
        volt: "#8f7b6a"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(0,0,0,0.22)",
        soft: "0 18px 48px rgba(0,0,0,0.24)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
