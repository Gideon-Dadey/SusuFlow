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
        surface: {
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
        },
      },
      fontFamily: {
        display: ['"Open Sans"', "system-ui", "-apple-system", "sans-serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
        heading: ["var(--font-open-sans)", "sans-serif"],
        hero: ["var(--font-open-sans)", "sans-serif"],
        "open-sans": ["var(--font-open-sans)", "sans-serif"],
      },
      fontSize: {
        body: ["18px", { lineHeight: "30.6px" }],
        "hero-body": ["18px", { lineHeight: "1.625" }],
        "hero-body-mobile": ["17px", { lineHeight: "1.625" }],
        input: ["16px", { lineHeight: "1.5" }],
        nav: ["18px", { lineHeight: "30.6px" }],
        "section-bar": ["26px", { lineHeight: "31.2px" }],
        btn: ["15px", { lineHeight: "1.5" }],
        "hero-mobile": ["2.35rem", { lineHeight: "1.12" }],
        "hero-desktop": ["3.4rem", { lineHeight: "1.08" }],
        "page-title": ["35px", { lineHeight: "42px" }],
        "hero-title": ["35px", { lineHeight: "42px" }],
        "dashboard-title": ["24px", { lineHeight: "1.3" }],
        "dashboard-title-mobile": ["18px", { lineHeight: "1.3" }],
        "secondary-title": ["18px", { lineHeight: "1.5" }],
        "card-label": ["22px", { lineHeight: "37.4px" }],
        "hero-sub": ["18px", { lineHeight: "30.6px" }],
        "dashboard-sub": ["14px", { lineHeight: "1.5" }],
        meta: ["12px", { lineHeight: "1.5" }],
        "modal-title": ["1.25rem", { lineHeight: "1.375" }],
        "modal-body": ["14px", { lineHeight: "1.625" }],
        base: ["18px", { lineHeight: "30.6px" }],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0.2rem",
        sm: "0.2rem",
        md: "0.2rem",
        lg: "0.2rem",
        xl: "0.2rem",
        "2xl": "0.2rem",
        "3xl": "0.2rem",
        full: "9999px",
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
      },
      animation: {
        pop: "pop 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-in-from-bottom-2": "slide-in-from-bottom-2 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
