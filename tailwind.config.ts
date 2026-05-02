import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#F5F7FA",
        muted: "#8B8F98",
        line: "#1F2933",
        panel: "#080B10",
        card: "#0D1117",
        player: "#00D084",
        rival: "#FF4040",
        bg: "#05070A",
      },
      backgroundImage: {
        "hud-grid":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(0, 0, 0, 0.45)",
        player: "0 0 0 1px rgba(0, 208, 132, 0.18), 0 0 30px rgba(0, 208, 132, 0.14)",
        rival: "0 0 0 1px rgba(255, 64, 64, 0.18), 0 0 30px rgba(255, 64, 64, 0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(0, 208, 132, 0.18)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 208, 132, 0.28)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        drift: "drift 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
