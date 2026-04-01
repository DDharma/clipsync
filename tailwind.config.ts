import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050f0a",
        card: "#0a1f14",
        border: "#1a3d28",
        primary: "#4ade80",
        secondary: "#22d3ee",
        text: "#e8f5ec",
        muted: "#7fba96",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(74, 222, 128, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(74, 222, 128, 0.6)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
