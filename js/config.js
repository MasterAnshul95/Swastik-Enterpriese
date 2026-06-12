/* Tailwind Play CDN configuration — "Forge Blueprint" theme.
   Loaded after the Tailwind CDN script on every page so the design tokens
   live in exactly one place (no per-page duplication). */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        forge: {
          50: "#fbf3ee",
          100: "#f6e4d8",
          400: "#d98a5e",
          500: "#bf5a2a",
          600: "#a8481f",
          700: "#8a3a19",
        },
        steel: {
          50: "#211c17",
          100: "#2e2820",
          200: "#4a4137",
          300: "#6f655a",
          400: "#8f8576",
          500: "#a89e8e",
          600: "#c4baa9",
          700: "#dccfbd",
          800: "#e7ddcd",
          850: "#efe7d9",
          900: "#f5efe3",
          950: "#faf5ec",
        },
        blueprint: "#7c9cb8",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: { ultra: "0.35em" },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "spin-slow": "spinSlow 24s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
};
