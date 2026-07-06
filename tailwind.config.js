/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: "#0a0a0f",
        glassBorder: "rgba(255, 255, 255, 0.1)",
        glassBg: "rgba(255, 255, 255, 0.03)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "scan-laser": "scanLaser 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { borderColor: "rgba(255, 255, 255, 0.1)", boxShadow: "0 0 0 rgba(255, 255, 255, 0)" },
          "50%": { borderColor: "rgba(255, 255, 255, 0.2)", boxShadow: "0 0 15px rgba(255, 255, 255, 0.05)" },
        },
        scanLaser: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(220px)" }
        }
      },
    },
  },
  plugins: [],
}
