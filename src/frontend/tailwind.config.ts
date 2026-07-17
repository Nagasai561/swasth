import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F4",
        pine: "#1E3D32",
        turmeric: "#D98E2B",
        brick: "#C1443C",
        sage: "#5B8C5A",
        charcoal: "#1A1A1A",
        warmgray: "#6B6459",
        line: "#E5DED3"
      },
      fontFamily: {
        serif: ["Fraunces", "Newsreader", "Georgia", "serif"],
        sans: ["Inter", "Public Sans", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 12px 30px rgba(30, 61, 50, 0.08)"
      },
      borderRadius: {
        soft: "10px"
      }
    }
  },
  plugins: []
};

export default config;
