import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // SF Pro on Apple devices, Inter everywhere else.
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Text"', '"Inter"', "system-ui", "Segoe UI", "Roboto", "sans-serif"],
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
        // Gen4 Foundations (Figma) — the legacy `airtel.*` names are kept so every screen picks up the new values.
        airtel: {
          red: "#CA262B", // brand surface (gen4red/600)
          "red-dark": "#981C20", // brand selected (gen4red/700)
          "red-bright": "#FD2F36", // brand hover (gen4red/500)
          "red-soft": "#FFD5D7", // gen4red/50
          ink: "#292C31", // black/900 — primary text
          sub: "#696B6F", // black/700 — body / help text
          surface: "#F6F6F6", // black/100
          line: "#E6E9EF", // border/card (blueGrey/100)
          success: "#0F7033", // green/800 text
          "success-soft": "#D1EFDC",
          "success-line": "#A3DFB9",
          warning: "#D79A00", // yellow/600
          "warning-text": "#8F4C00",
          "warning-soft": "#FFF0B8",
          "warning-line": "#FFE48A",
          error: "#981C20",
          "error-soft": "#FFD5D7",
          "error-line": "#FEACAF",
        },
        gen4: {
          black: "#000000",
          "black-200": "#EAEAEA",
          "black-300": "#D4D5D6",
          "black-400": "#BFC0C1",
          "black-500": "#A0A2A4",
          "black-800": "#3E4146",
          action: "#075EE8", // blue/500
          "action-hover": "#064BBA",
          "action-pressed": "#04388B",
          "action-soft": "#E6F0FF",
          "action-line": "#9CBFF6",
          "bg-50": "#F0F4F9", // blueGrey/50 — field surface
          "bg-100": "#E6E9EF",
          "bg-200": "#CDD3DD",
          "bg-400": "#8E9AA9",
          "bg-600": "#485B76",
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
        // Gen4 type scale (Inter): Headline H5/H6, Body LG/MD/SM/XS, Title (tracked caps)
        "display": ["28px", { lineHeight: "36px", fontWeight: "700" }], // Headline/H5-28/Bold
        "title": ["24px", { lineHeight: "32px", fontWeight: "700" }], // Headline/H6-24/Bold
        "heading": ["18px", { lineHeight: "26px", fontWeight: "700" }], // Body/LG/paragraph/Bold
        "body": ["16px", { lineHeight: "24px" }], // Body/MD/paragraph
        "small": ["14px", { lineHeight: "20px" }], // Body/SM/paragraph
        "micro": ["12px", { lineHeight: "14px", letterSpacing: "0.16em", fontWeight: "700" }], // Title/MD
      },
      boxShadow: {
        card: "0 5px 5.62px rgba(180,180,180,0.2)", // Shadow-Level2 (Default)
        lift: "0 8px 24px rgba(41,44,49,0.12)",
        sheet: "0 -8px 32px rgba(0,0,0,0.12)",
        red: "none",
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
