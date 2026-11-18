import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        airtel: {
          red: "#E4002B",
          "red-dark": "#B8001F",
          "red-soft": "#FDECEF",
          ink: "#171717",
          sub: "#777777",
          surface: "#F6F6F6",
          line: "#EAEAEA",
          success: "#16834A",
          "success-soft": "#E8F5EE",
          warning: "#E9A23B",
          "warning-soft": "#FDF4E6",
          error: "#D93025",
          "error-soft": "#FCEBEA",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
        xl: "20px",
        "2xl": "24px",
      },
      fontSize: {
        // Airtel type scale
        "display": ["28px", { lineHeight: "34px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title": ["22px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "heading": ["17px", { lineHeight: "22px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body": ["15px", { lineHeight: "22px" }],
        "small": ["13px", { lineHeight: "18px" }],
        "micro": ["11px", { lineHeight: "14px", letterSpacing: "0.02em" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,23,23,0.04), 0 4px 16px rgba(23,23,23,0.05)",
        lift: "0 8px 30px rgba(23,23,23,0.10)",
        sheet: "0 -8px 40px rgba(23,23,23,0.16)",
        red: "0 8px 20px rgba(228,0,43,0.28)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};
