import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        heading: "var(--heading)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        warning: "var(--warning)",
        credit: "var(--accent)",
        debit: "var(--destructive)",
        brand: {
          dark: "var(--brand-dark)",
        },
        "twitter-dark": {
          DEFAULT: "#010e25",
          border: "#1e293b",
          elevated: "#1e293b",
          hover: "#334155",
        },
        "surface-dark": {
          elevated: "#1e293b",
          border: "#1e293b",
          hover: "#334155",
        },
        surface: {
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
        heading: ["var(--font-display)"],
        hero: ["var(--font-hero)"],
        geist: ["var(--font-geist)", "system-ui", "sans-serif"],
        "open-sans": ["var(--font-display)"],
        grotesk: ["var(--font-grotesk)", "system-ui", "sans-serif"],
      },
      fontSize: {
        body: ["16px", { lineHeight: "1.6" }],
        "hero-body": ["18px", { lineHeight: "1.6" }],
        "hero-body-mobile": ["16px", { lineHeight: "1.6" }],
        input: ["15px", { lineHeight: "1.5" }],
        nav: ["15px", { lineHeight: "1.5" }],
        "section-bar": ["24px", { lineHeight: "1.3" }],
        btn: ["14px", { lineHeight: "1.5" }],
        "hero-mobile": [
          "2.25rem",
          { lineHeight: "1.15", letterSpacing: "-0.025em" },
        ],
        "hero-desktop": [
          "3.5rem",
          { lineHeight: "1.08", letterSpacing: "-0.03em" },
        ],
        "page-title": [
          "32px",
          { lineHeight: "38px", letterSpacing: "-0.02em" },
        ],
        "hero-title": [
          "36px",
          { lineHeight: "42px", letterSpacing: "-0.025em" },
        ],
        "dashboard-title": [
          "22px",
          { lineHeight: "1.3", letterSpacing: "-0.015em" },
        ],
        "dashboard-title-mobile": ["18px", { lineHeight: "1.3" }],
        "secondary-title": ["18px", { lineHeight: "1.5" }],
        "card-label": ["20px", { lineHeight: "1.4" }],
        "hero-sub": ["17px", { lineHeight: "1.6" }],
        "dashboard-sub": ["14px", { lineHeight: "1.5" }],
        meta: ["12px", { lineHeight: "1.5" }],
        "modal-title": ["1.25rem", { lineHeight: "1.375" }],
        "modal-body": ["14px", { lineHeight: "1.6" }],
        base: ["16px", { lineHeight: "1.6" }],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
        md: "var(--radius-lg)",
        lg: "var(--radius-lg)",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "var(--radius-full)",
      },
      boxShadow: {
        card: "0 2px 8px -1px rgb(15 23 42 / 0.08), 0 8px 16px -2px rgb(15 23 42 / 0.06)",
        elevated:
          "0 12px 32px -4px rgb(15 23 42 / 0.12), 0 4px 12px -2px rgb(15 23 42 / 0.08)",
        pop: "0 4px 20px -2px rgb(15 23 42 / 0.1), 0 2px 6px -1px rgb(15 23 42 / 0.06)",
        "card-dark":
          "0 2px 8px -1px rgb(0 0 0 / 0.4), 0 8px 16px -2px rgb(0 0 0 / 0.3)",
        "elevated-dark":
          "0 12px 32px -4px rgb(0 0 0 / 0.5), 0 4px 12px -2px rgb(0 0 0 / 0.4)",
        "premium-light":
          "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.08)",
        "premium-dark":
          "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.08)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom-2": {
          "0%": { transform: "translateY(0.5rem)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      },
      animation: {
        pop: "pop 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-in-from-bottom-2": "slide-in-from-bottom-2 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
        "ken-burns": "ken-burns 25s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
