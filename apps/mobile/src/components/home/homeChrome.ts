/**
 * Home-only chrome — soft American-fintech accents without changing global primary.
 * Cool paper background + emerald money signal + pastel action wells.
 */
export const homeChrome = {
  /** Matches global light page — pure white */
  pageLight: "#FFFFFF",
  pageDark: "#050505",

  /** Money / growth */
  mint: "#059669",
  mintSoft: "#ECFDF5",
  mintInk: "#047857",
  mintDarkWell: "rgba(16, 185, 129, 0.16)",

  /** Primary CTA on home */
  cta: ["#0D9488", "#059669"] as const,
  ctaPressed: "#0F766E",

  /** Soft action wells (light) */
  wells: {
    wallet: { bg: "#ECFDF5", fg: "#047857" },
    "arrow-up-right": { bg: "#FFF1F2", fg: "#BE123C" },
    target: { bg: "#FFF7ED", fg: "#C2410C" },
    activity: { bg: "#EFF6FF", fg: "#1D4ED8" },
    "file-text": { bg: "#F0FDFA", fg: "#0F766E" },
    receipt: { bg: "#F8FAFC", fg: "#334155" },
  },

  /** Soft action wells (dark) */
  wellsDark: {
    wallet: { bg: "rgba(16, 185, 129, 0.18)", fg: "#6EE7B7" },
    "arrow-up-right": { bg: "rgba(244, 63, 94, 0.18)", fg: "#FDA4AF" },
    target: { bg: "rgba(249, 115, 22, 0.18)", fg: "#FDBA74" },
    activity: { bg: "rgba(59, 130, 246, 0.18)", fg: "#93C5FD" },
    "file-text": { bg: "rgba(20, 184, 166, 0.18)", fg: "#5EEAD4" },
    receipt: { bg: "rgba(148, 163, 184, 0.16)", fg: "#E2E8F0" },
  },

  /** Promo gradients — bright, distinct, not monochrome */
  promos: {
    light: {
      deposit: ["#0F766E", "#14B8A6"] as const,
      grow: ["#1D4ED8", "#3B82F6"] as const,
      goals: ["#C2410C", "#F59E0B"] as const,
    },
    dark: {
      deposit: ["#064E3B", "#0F766E"] as const,
      grow: ["#1E3A8A", "#2563EB"] as const,
      goals: ["#7C2D12", "#C2410C"] as const,
    },
  },

  link: "#0D9488",
  linkDark: "#2DD4BF",
} as const;

export type HomeWellIcon = keyof typeof homeChrome.wells;
