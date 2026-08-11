/**
 * Shared banking chrome — profile / More / settings menus.
 * Keeps circular wells, flat dividers, and page surfaces consistent.
 */
import type { AppIconName } from "@/components/icons/AppIcon";

export type BankWellTone =
  | "sky"
  | "slate"
  | "mint"
  | "orange"
  | "olive"
  | "blue"
  | "rose"
  | "teal"
  | "violet"
  | "amber";

export const bankChrome = {
  pageDark: "#000000",
  pageLight: "#FFFFFF",
  dividerDark: "#2A2A2C",
  dividerLight: "#D0D7E2",
  chevronDark: "#E8E8EA",
  wellSize: 42,
  rowMinHeight: 68,
  rowGap: 14,
  rowPaddingY: 16,
  rowPaddingX: 16,
  labelSize: 16,
  subtitleSize: 12.5,
} as const;

const LIGHT_WELLS: Record<BankWellTone, { bg: string; fg: string }> = {
  sky: { bg: "#BFDBFE", fg: "#1E3A8A" },
  slate: { bg: "#E2E8F0", fg: "#334155" },
  mint: { bg: "#E2E8F0", fg: "#334155" },
  orange: { bg: "#FED7AA", fg: "#9A3412" },
  olive: { bg: "#E2E8F0", fg: "#475569" },
  blue: { bg: "#93C5FD", fg: "#1E3A8A" },
  rose: { bg: "#FECDD3", fg: "#9F1239" },
  teal: { bg: "#E2E8F0", fg: "#334155" },
  violet: { bg: "#E9D5FF", fg: "#6B21A8" },
  amber: { bg: "#FDE68A", fg: "#92400E" },
};

const DARK_WELLS: Record<BankWellTone, { bg: string; fg: string }> = {
  sky: { bg: "#7EB6D4", fg: "#0B3A52" },
  slate: { bg: "#8B93A8", fg: "#1A1F2E" },
  mint: { bg: "#8B93A8", fg: "#1A1F2E" },
  orange: { bg: "#E8923A", fg: "#3D2208" },
  olive: { bg: "#8B93A8", fg: "#1A1F2E" },
  blue: { bg: "#3B82F6", fg: "#FFFFFF" },
  rose: { bg: "#FB7185", fg: "#4C0519" },
  teal: { bg: "#8B93A8", fg: "#1A1F2E" },
  violet: { bg: "#A78BFA", fg: "#2E1065" },
  amber: { bg: "#FBBF24", fg: "#451A03" },
};

export function getBankWell(
  tone: BankWellTone,
  isDark: boolean,
): { bg: string; fg: string } {
  return isDark ? DARK_WELLS[tone] : LIGHT_WELLS[tone];
}

/** Default well tone per Phosphor AppIcon used in menus. */
const ICON_TONES: Partial<Record<AppIconName, BankWellTone>> = {
  settings: "sky",
  user: "slate",
  wallet: "slate",
  deposit: "slate",
  withdraw: "rose",
  shield: "orange",
  smartphone: "olive",
  bell: "blue",
  moon: "amber",
  power: "sky",
  logout: "sky",
  target: "orange",
  goals: "orange",
  receipt: "slate",
  "arrow-up-right": "rose",
  "arrow-down-left": "slate",
  "file-text": "teal",
  support: "violet",
  help: "violet",
  info: "teal",
  gift: "blue",
  users: "slate",
  sliders: "orange",
  activity: "blue",
  profile: "slate",
  "credit-card": "blue",
  building: "slate",
  plus: "slate",
  more: "slate",
  home: "slate",
};

export function getWellForIcon(
  icon: AppIconName,
  isDark: boolean,
): { bg: string; fg: string } {
  const tone = ICON_TONES[icon] ?? "slate";
  return getBankWell(tone, isDark);
}

/** Map legacy More-service tones onto bank wells. */
export type LegacyServiceTone =
  | "mint"
  | "blue"
  | "orange"
  | "rose"
  | "slate"
  | "teal"
  | "violet"
  | "amber";

const LEGACY_TONE_MAP: Record<LegacyServiceTone, BankWellTone> = {
  mint: "mint",
  blue: "blue",
  orange: "orange",
  rose: "rose",
  slate: "slate",
  teal: "teal",
  violet: "violet",
  amber: "amber",
};

export function getServiceWellFromLegacy(
  tone: LegacyServiceTone,
  isDark: boolean,
): { bg: string; fg: string } {
  return getBankWell(LEGACY_TONE_MAP[tone], isDark);
}
