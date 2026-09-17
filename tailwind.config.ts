import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#0B3D2E",
        pitchdark: "#072A20",
        chalk: "#F5F2E8",
        amarillo: "#F2B705",
        amarillobrillante: "#FFDD40",
        granate: "#5B1F1F",
        coral: "#FF6B4A",
        navy: "#16233B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        stripes:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 40px, transparent 40px, transparent 80px)",
      },
    },
  },
  plugins: [],
};

export default config;
