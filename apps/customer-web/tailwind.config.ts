import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FBF9F5",
        surface: "#FFFFFF",
        cream: {
          50: "#FDFCF9",
          100: "#FBF9F5",
          200: "#F5F0E6",
          300: "#EFE5D3",
          400: "#E0D2BA",
          500: "#CBB696"
        },
        forest: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          500: "#2D6A4F",
          700: "#1B4332",
          800: "#133124",
          900: "#0B1D15"
        },
        terracotta: {
          50: "#FDF4F0",
          100: "#FCE5DC",
          200: "#F9C7B6",
          500: "#E76F51",
          600: "#D35436",
          700: "#B83A1D"
        },
        saffron: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"]
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 25px -5px rgba(27, 67, 50, 0.08), 0 8px 10px -6px rgba(27, 67, 50, 0.03)'
      }
    },
  },
  plugins: [],
};
export default config;
