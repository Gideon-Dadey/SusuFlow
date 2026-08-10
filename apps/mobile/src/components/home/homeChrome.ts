/**
 * Home chrome — neutral banking accents (no mint/teal “fintech green”).
 * Aligns with bankChrome while keeping home-only promo gradients.
 */
export const homeChrome = {
  pageLight: "#FFFFFF",
  pageDark: "#000000",

  /** Subtle growth signal — cool slate, not emerald */
  growth: "#64748B",
  growthSoft: "#F1F5F9",
  growthInk: "#334155",
  growthDarkWell: "rgba(148, 163, 184, 0.18)",

  /** Soft action wells */
  wells: {
    wallet: { bg: "#E2E8F0", fg: "#1E293B" },
    deposit: { bg: "#E2E8F0", fg: "#1E293B" },
    withdraw: { bg: "#FEE2E2", fg: "#991B1B" },
    "arrow-up-right": { bg: "#FEE2E2", fg: "#991B1B" },
    target: { bg: "#FFEDD5", fg: "#9A3412" },
    goals: { bg: "#FFEDD5", fg: "#9A3412" },
    activity: { bg: "#DBEAFE", fg: "#1E40AF" },
    "file-text": { bg: "#E2E8F0", fg: "#334155" },
    receipt: { bg: "#F1F5F9", fg: "#475569" },
  },

  wellsDark: {
    wallet: { bg: "rgba(148, 163, 184, 0.22)", fg: "#E2E8F0" },
    deposit: { bg: "rgba(148, 163, 184, 0.22)", fg: "#E2E8F0" },
    withdraw: { bg: "rgba(248, 113, 113, 0.2)", fg: "#FECACA" },
    "arrow-up-right": { bg: "rgba(248, 113, 113, 0.2)", fg: "#FECACA" },
    target: { bg: "rgba(251, 146, 60, 0.22)", fg: "#FED7AA" },
    goals: { bg: "rgba(251, 146, 60, 0.22)", fg: "#FED7AA" },
    activity: { bg: "rgba(96, 165, 250, 0.22)", fg: "#BFDBFE" },
    "file-text": { bg: "rgba(148, 163, 184, 0.2)", fg: "#E2E8F0" },
    receipt: { bg: "rgba(148, 163, 184, 0.16)", fg: "#CBD5E1" },
  },

  /** Promo washes — blue / slate / warm, not teal-green */
  promos: {
    light: {
      deposit: ["#1E293B", "#334155"] as const,
      grow: ["#1D4ED8", "#3B82F6"] as const,
      goals: ["#9A3412", "#EA580C"] as const,
    },
    dark: {
      deposit: ["#0F172A", "#1E293B"] as const,
      grow: ["#1E3A8A", "#2563EB"] as const,
      goals: ["#7C2D12", "#C2410C"] as const,
    },
  },

  link: "#334155",
  linkDark: "#CBD5E1",
} as const;

export type HomeWellIcon = keyof typeof homeChrome.wells;
