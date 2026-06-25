import type { AppIconName } from "@/components/icons/AppIcon";
import { iconAccents, type IconAccentKey } from "@/theme/tokens";

const ACCENT_KEYS: IconAccentKey[] = [
  "receipt",
  "target",
  "users",
  "arrow-down-left",
  "arrow-up-right",
  "file-text",
];

function isAccentKey(icon: AppIconName): icon is IconAccentKey {
  return (ACCENT_KEYS as string[]).includes(icon);
}

export function getIconAccent(icon: AppIconName, isDark: boolean) {
  const palette = isDark ? iconAccents.dark : iconAccents.light;
  if (isAccentKey(icon)) {
    return palette[icon];
  }
  return isDark
    ? { bg: "rgba(16, 185, 129, 0.15)", fg: "#34D399" }
    : { bg: "#ECFDF5", fg: "#059669" };
}
