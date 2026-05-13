/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        runtime: {
          bg: "#06060a",
          "bg-elevated": "#0c0c12",
          card: "#0e0e14",
          "card-hover": "#12121a",
          border: "#1a1a24",
          "border-active": "#2a2a3a",
          blue: "#3b82f6",
          "blue-dim": "#1d4ed8",
          "blue-glow": "rgba(59, 130, 246, 0.15)",
          green: "#10b981",
          "green-dim": "#059669",
          amber: "#f59e0b",
          "amber-dim": "#d97706",
          red: "#ef4444",
          "red-dim": "#dc2626",
          muted: "#64748b",
          "muted-light": "#94a3b8",
          white: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "telemetry-flow": "telemetryFlow 2s linear infinite",
        "node-breathe": "nodeBreathe 4s ease-in-out infinite",
        "confidence-fill": "confidenceFill 2s ease-out forwards",
        "scan-line": "scanLine 3s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        telemetryFlow: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        nodeBreathe: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)" },
          "50%": { boxShadow: "0 0 20px 2px rgba(59, 130, 246, 0.15)" },
        },
        confidenceFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--confidence)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle, #1a1a24 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
