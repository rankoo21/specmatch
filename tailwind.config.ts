import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Stratified earth tones with mineral accents.
        core: "#0B0A08", // core black
        slate: "#2B2A26", // deep slate
        umber: "#5B4327", // umber
        ochre: "#B07D3A", // ochre
        sand: "#CDB089", // sand
        bone: "#EDE6D6", // bone
        mineral: "#3FA89B", // mineral teal (corroborated cores only)
        fault: "#A6442E", // fault rust (distortions/contradictions only)
        quartz: "#8C8A82", // cool quartz grey
      },
      fontFamily: {
        engrave: ["var(--font-engrave)", "Georgia", "serif"],
        mark: ["var(--font-mark)", "ui-monospace", "monospace"],
      },
      keyframes: {
        silt: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0.0" },
          "20%": { opacity: "0.6" },
          "50%": { transform: "translateY(14px) translateX(6px)", opacity: "0.9" },
          "80%": { opacity: "0.4" },
          "100%": { transform: "translateY(28px) translateX(-4px)", opacity: "0.0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        tick: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
        vein: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        silt: "silt 9s ease-in-out infinite",
        shimmer: "shimmer 14s linear infinite",
        tick: "tick 4s ease-in-out infinite",
        vein: "vein 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
