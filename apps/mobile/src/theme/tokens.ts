/**
 * Design tokens — professional emerald palette (fintech-grade, not neon).
 * Primary: emerald-600 (#059669) for actions; emerald-700+ for text on tints.
 */

export const lightColors = {
  primary: "#059669",
  primary50: "#ecfdf5",
  primary100: "#d1fae5",
  primary200: "#a7f3d0",
  primary300: "#6ee7b7",
  primary400: "#34d399",
  primary500: "#10b981",
  primary600: "#059669",
  primary700: "#047857",
  primary800: "#065f46",
  primary900: "#064e3b",
  primaryForeground: "#ffffff",
  brandDark: "#1a365d",
  background: "#f5f7fa",
  foreground: "#1e293b",
  heading: "#1a365d",
  card: "#ffffff",
  cardForeground: "#1e293b",
  popover: "#ffffff",
  popoverForeground: "#1e293b",
  muted: "#f1f5f9",
  mutedForeground: "#475569",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: "#059669",
  secondary: "#059669",
  secondaryForeground: "#ffffff",
  accent: "#047857",
  accentForeground: "#ffffff",
  destructive: "#ef4444",
  warning: "#f59e0b",
  success: "#059669",
  surfaceGlow: "rgba(5, 150, 105, 0.08)",
  sidebar: "#f8fafc",
  sidebarActive: "rgba(5, 150, 105, 0.12)",
  splashBackground: "#1a365d",
  surfaceElevated: "#ffffff",
  surfaceHover: "#f8fafc",
} as const;

export const darkColors = {
  primary: "#10b981",
  primary50: "#022c22",
  primary100: "#064e3b",
  primary200: "#065f46",
  primary300: "#047857",
  primary400: "#34d399",
  primary500: "#10b981",
  primary600: "#059669",
  primary700: "#047857",
  primary800: "#065f46",
  primary900: "#064e3b",
  primaryForeground: "#ffffff",
  brandDark: "#000000",
  background: "#000000",
  foreground: "#ffffff",
  heading: "#ffffff",
  card: "#1a1a1a",
  cardForeground: "#ffffff",
  popover: "#1a1a1a",
  popoverForeground: "#ffffff",
  muted: "#141414",
  mutedForeground: "#8e8e93",
  border: "#2c2c2e",
  input: "#2c2c2e",
  ring: "#34d399",
  secondary: "#10b981",
  secondaryForeground: "#022c22",
  accent: "#34d399",
  accentForeground: "#022c22",
  destructive: "#f87171",
  warning: "#fbbf24",
  success: "#10b981",
  surfaceGlow: "rgba(16, 185, 129, 0.06)",
  sidebar: "#1a1a1a",
  sidebarActive: "rgba(16, 185, 129, 0.1)",
  splashBackground: "#000000",
  surfaceElevated: "#1a1a1a",
  surfaceHover: "#141414",
} as const;

export type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};

/** @deprecated Use useTheme() for dynamic colors */
export const colors = lightColors;

/** Accent fills for quick-action / list icons (light + dark). */
export const iconAccents = {
  light: {
    receipt: { bg: "#4A6FA5", fg: "#FFFFFF" },
    target: { bg: "#C4A574", fg: "#FFFFFF" },
    users: { bg: "#C4A574", fg: "#FFFFFF" },
    "arrow-down-left": { bg: "#4A6FA5", fg: "#FFFFFF" },
    "arrow-up-right": { bg: "#A3543F", fg: "#FFFFFF" },
    "file-text": { bg: "#6E5B8C", fg: "#FFFFFF" },
  },
  dark: {
    receipt: { bg: "#3D5F85", fg: "#FFFFFF" },
    target: { bg: "#9A7B4F", fg: "#FFFFFF" },
    users: { bg: "#9A7B4F", fg: "#FFFFFF" },
    "arrow-down-left": { bg: "#3D5F85", fg: "#FFFFFF" },
    "arrow-up-right": { bg: "#8B4535", fg: "#FFFFFF" },
    "file-text": { bg: "#5A4A72", fg: "#FFFFFF" },
  },
} as const;

export type IconAccentKey = keyof typeof iconAccents.light;

export const radius = {
  sm: 4,
  md: 6,
  /** Global surface radius — cards, banners, buttons, lists */
  lg: 12,
  /** Sheets and modals (matches lg; use either) */
  xl: 12,
  /** Pills, avatars, page dots */
  full: 9999,
} as const;

/** Canonical radii — prefer these over raw `radius.*` in components. */
export const surfaceRadius = {
  card: radius.lg,
  banner: radius.lg,
  chip: radius.md,
  control: radius.lg,
  avatar: radius.full,
  sheet: radius.lg,
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
  /** Prefer these over raw bold — keeps UI refined and consistent. */
  roles: {
    display: "Inter_600SemiBold",
    headline: "Inter_600SemiBold",
    title: "Inter_500Medium",
    label: "Inter_500Medium",
    body: "Inter_400Regular",
    caption: "Inter_400Regular",
    amount: "Inter_600SemiBold",
    cta: "Inter_600SemiBold",
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
  subtle: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  elevated: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

/** Brand green for native assets / auth screens that cannot use useTheme(). */
export const brandGreen = "#059669";
