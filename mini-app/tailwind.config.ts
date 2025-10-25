import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 *
 * This configuration centralizes all theme colors for the mini app.
 * To change the app's color scheme, simply update the 'primary' color value below.
 *
 * Example theme changes:
 * - Blue theme: primary: "#3182CE"
 * - Green theme: primary: "#059669"
 * - Red theme: primary: "#DC2626"
 * - Orange theme: primary: "#EA580C"
 */
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fabel brand colors inspired by the logo
        fabel: {
          purple: "#8B5CF6",
          blue: "#3B82F6",
          orange: "#F97316",
          pink: "#EC4899",
          gradient:
            "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 35%, #F97316 70%, #EC4899 100%)",
        },
        // Primary colors using fabel purple
        primary: "#8B5CF6",
        "primary-light": "#A78BFA",
        "primary-dark": "#7C3AED",

        // Dark theme colors
        dark: {
          900: "#0F0F0F",
          800: "#1A1A1A",
          700: "#2A2A2A",
          600: "#3A3A3A",
          500: "#4A4A4A",
        },

        // Secondary colors for backgrounds and text
        secondary: "#F1F5F9",
        "secondary-dark": "#334155",

        // Legacy CSS variables for backward compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Custom spacing for consistent layout
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      // Custom container sizes
      maxWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
      },
      // Gradient backgrounds inspired by fabel logo
      backgroundImage: {
        "fabel-gradient":
          "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 35%, #F97316 70%, #EC4899 100%)",
        "fabel-gradient-dark":
          "linear-gradient(135deg, #5B21B6 0%, #1E40AF 35%, #C2410C 70%, #BE185D 100%)",
        "dark-mesh":
          "radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
      },
      // Animation for gradient text effects
      animation: {
        gradient: "gradient 8s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      // Custom keyframes
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        glow: {
          "0%": { "box-shadow": "0 0 20px rgba(139, 92, 246, 0.5)" },
          "100%": { "box-shadow": "0 0 40px rgba(139, 92, 246, 0.8)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
