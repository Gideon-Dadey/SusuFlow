/**
 * Auth entry chrome — flat black / white, matching the welcome splash.
 * Use these instead of brand blue on launch, welcome, login, register, onboarding.
 */
export const authChrome = {
  canvas: "#000000",
  ink: "#ffffff",
  inkMuted: "rgba(255,255,255,0.62)",
  inkFaint: "rgba(255,255,255,0.35)",
  /** Charcoal field surface (Bamboo-style dark inputs) */
  field: "#1c1c1e",
  fieldLabel: "rgba(255,255,255,0.45)",
  placeholder: "rgba(255,255,255,0.38)",
  /** Shared radius for fields, CTAs, and auth controls */
  controlRadius: 14,
  /** @deprecated Prefer controlRadius — kept for existing call sites */
  fieldRadius: 14,
  controlHeight: 54,
  fieldBorder: "rgba(255,255,255,0.10)",
  fieldBorderFocused: "rgba(255,255,255,0.28)",
  /** Primary CTA on black canvas (welcome Register) */
  onBlackFill: "#ffffff",
  onBlackLabel: "#000000",
  /** Primary CTA on light sheet (login Sign in) */
  onLightFill: "#000000",
  onLightFillPressed: "#1a1a1a",
  onLightLabel: "#ffffff",
  /** Links / accents on light sheets */
  link: "#000000",
  linkMuted: "#111111",
  /** Links on dark auth screens */
  linkOnDark: "#ffffff",
  hairline: "rgba(255,255,255,0.55)",
  progressTrack: "rgba(255,255,255,0.28)",
  progressActive: "#ffffff",
} as const;
