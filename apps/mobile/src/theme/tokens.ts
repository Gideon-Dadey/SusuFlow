/** Design tokens aligned with apps/web globals.css */
export const colors = {
  primary: "#22c55e",
  primary600: "#16a34a",
  primary700: "#15803d",
  primary800: "#166534",
  primaryForeground: "#ffffff",
  brandDark: "#1a365d",
  background: "#ffffff",
  foreground: "#1e293b",
  heading: "#1a365d",
  card: "#ffffff",
  muted: "#f1f5f9",
  mutedForeground: "#475569",
  border: "#e2e8f0",
  destructive: "#ef4444",
  warning: "#f59e0b",
  success: "#22c55e",
  surfaceGlow: "rgba(34, 197, 94, 0.08)",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  size: {
    xs: 12,
    sm: 14,
    base: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  lineHeight: {
    normal: 1.625,
    tight: 1.25,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
