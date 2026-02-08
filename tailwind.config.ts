import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        "background-light": "#ffffff",
        "background-dark": "#0f172a",
        "canvas-grid": "#e2e8f0",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
