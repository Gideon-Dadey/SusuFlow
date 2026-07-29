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
  none: 0,
  sm: 4,
  md: 4,
  /** Global surface radius — cards, banners, buttons, inputs, modals (0.2rem / 4px) */
  lg: 4,
  xl: 4,
  /** Pills, avatars, page dots */
  full: 9999,
} as const;

/** Canonical radii — prefer these over raw `radius.*` in components. */
export const surfaceRadius = {
  card: 4,
  banner: 4,
  chip: 4,
  control: 4,
  avatar: radius.full,
  sheet: 4,
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
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "OpenSans_700Bold",
    heading: "OpenSans_700Bold",
    cardLabel: "OpenSans_500Medium",
  },
  /** Prefer these over raw bold — keeps UI refined and consistent. */
  roles: {
    display: "OpenSans_700Bold",
    headline: "OpenSans_700Bold",
    title: "OpenSans_500Medium",
    label: "System",
    body: "System",
    caption: "System",
    amount: "OpenSans_700Bold",
    cta: "System",
  },
  size: {
    xs: 12, // small meta / labels
    modalBody: 14,
    sm: 14,
    cta: 15, // buttons / CTA
    input: 16, // inputs
    bodySub: 17, // body copy under hero
    base: 18, // body / UI, nav links
    lg: 18,
    modalTitle: 20, // modal title (1.25rem)
    cardLabel: 22, // card label (22px)
    xl: 22,
    sectionBar: 26, // section bar (26px)
    xxl: 28,
    heroTitle: 35, // hero / page titles (35px)
    heroTitleMobile: 37.6, // hero title mobile (2.35rem)
    heroTitleDesktop: 54.4, // hero title desktop (3.4rem)
  },
  lineHeight: {
    normal: 1.7, // 30.6px / 18px
    tight: 1.08,
    snug: 1.375,
    relaxed: 1.7,
    heroMobile: 1.12,
    heroDesktop: 1.08,
    pageTitle: 1.2,
    sectionBar: 1.2,
    cardLabel: 1.7,
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
