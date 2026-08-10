/**
 * Design tokens — SusuFlow black / white system.
 * Light: black primary on white surfaces.
 * Dark: white primary on black surfaces.
 */

export const lightColors = {
  primary: "#000000",
  primary50: "#f4f4f5",
  primary100: "#e4e4e7",
  primary200: "#d4d4d8",
  primary300: "#a1a1aa",
  primary400: "#71717a",
  primary500: "#52525b",
  primary600: "#3f3f46",
  primary700: "#27272a",
  primary800: "#18181b",
  primary900: "#09090b",
  primaryForeground: "#ffffff",
  brandDark: "#000000",
  background: "#FFFFFF",
  foreground: "#0F172A",
  heading: "#020617",
  card: "#ffffff",
  cardForeground: "#0F172A",
  popover: "#ffffff",
  popoverForeground: "#0F172A",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  border: "#D0D7E2",
  input: "#D0D7E2",
  ring: "#000000",
  secondary: "#0F172A",
  secondaryForeground: "#ffffff",
  accent: "#0F172A",
  accentForeground: "#ffffff",
  destructive: "#E11D48",
  warning: "#F59E0B",
  success: "#059669",
  surfaceGlow: "rgba(15, 23, 42, 0.06)",
  sidebar: "#F8FAFC",
  sidebarActive: "rgba(15, 23, 42, 0.06)",
  splashBackground: "#000000",
  surfaceElevated: "#ffffff",
  surfaceHover: "#F8FAFC",
} as const;

export const darkColors = {
  primary: "#ffffff",
  primary50: "#09090b",
  primary100: "#18181b",
  primary200: "#27272a",
  primary300: "#3f3f46",
  primary400: "#52525b",
  primary500: "#a1a1aa",
  primary600: "#d4d4d8",
  primary700: "#e4e4e7",
  primary800: "#f4f4f5",
  primary900: "#fafafa",
  primaryForeground: "#000000",
  brandDark: "#000000",
  background: "#000000",
  foreground: "#ffffff",
  heading: "#ffffff",
  card: "#1a1a1a",
  cardForeground: "#ffffff",
  popover: "#1a1a1a",
  popoverForeground: "#ffffff",
  muted: "#141414",
  mutedForeground: "#a1a1aa",
  border: "#2c2c2e",
  input: "#2c2c2e",
  ring: "#ffffff",
  secondary: "#ffffff",
  secondaryForeground: "#000000",
  accent: "#e4e4e7",
  accentForeground: "#000000",
  destructive: "#f87171",
  warning: "#fbbf24",
  success: "#34D399",
  surfaceGlow: "rgba(255, 255, 255, 0.08)",
  sidebar: "#1a1a1a",
  sidebarActive: "rgba(255, 255, 255, 0.12)",
  splashBackground: "#000000",
  surfaceElevated: "#1a1a1a",
  surfaceHover: "#141414",
} as const;

export type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};

/** @deprecated Use useTheme() for dynamic colors */
export const colors = lightColors;

/** Accent fills for shortcut / list icons (light + dark). */
export const iconAccents = {
  light: {
    receipt: { bg: "#F1F5F9", fg: "#334155" },
    target: { bg: "#FFF7ED", fg: "#C2410C" },
    users: { bg: "#ECFDF5", fg: "#047857" },
    "arrow-down-left": { bg: "#ECFDF5", fg: "#047857" },
    "arrow-up-right": { bg: "#FFF1F2", fg: "#BE123C" },
    "file-text": { bg: "#F0FDFA", fg: "#0F766E" },
  },
  dark: {
    receipt: { bg: "rgba(148, 163, 184, 0.16)", fg: "#E2E8F0" },
    target: { bg: "rgba(249, 115, 22, 0.18)", fg: "#FDBA74" },
    users: { bg: "rgba(16, 185, 129, 0.18)", fg: "#6EE7B7" },
    "arrow-down-left": { bg: "rgba(16, 185, 129, 0.18)", fg: "#6EE7B7" },
    "arrow-up-right": { bg: "rgba(244, 63, 94, 0.18)", fg: "#FDA4AF" },
    "file-text": { bg: "rgba(20, 184, 166, 0.18)", fg: "#5EEAD4" },
  },
} as const;

export type IconAccentKey = keyof typeof iconAccents.light;

/** Matches auth control radius (login / register fields & CTAs). */
export const AUTH_CONTROL_RADIUS = 14;

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  /** Cards, banners, list panels — same as login/register */
  lg: AUTH_CONTROL_RADIUS,
  /** Sheets / larger panels */
  xl: 18,
  /** Pills, avatars, page dots */
  full: 9999,
} as const;

/** Canonical radii — prefer these over raw `radius.*` in components. */
export const surfaceRadius = {
  card: AUTH_CONTROL_RADIUS,
  banner: AUTH_CONTROL_RADIUS,
  chip: 12,
  control: AUTH_CONTROL_RADIUS,
  avatar: radius.full,
  sheet: 18,
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
    regular: "Geist_400Regular",
    medium: "Geist_500Medium",
    semibold: "Geist_600SemiBold",
    bold: "Geist_700Bold",
    heading: "Geist_700Bold",
    cardLabel: "Geist_500Medium",
  },
  /** Prefer these over raw bold — keeps UI refined and consistent. */
  roles: {
    display: "Geist_700Bold",
    headline: "Geist_700Bold",
    title: "Geist_600SemiBold",
    label: "Geist_500Medium",
    body: "Geist_400Regular",
    caption: "Geist_400Regular",
    amount: "Geist_700Bold",
    cta: "Geist_600SemiBold",
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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

/** Primary brand color for native assets that cannot use useTheme(). */
export const brandGreen = "#000000";
export const brandBlue = "#000000";
export const brandInk = "#000000";
export const brandPaper = "#ffffff";
