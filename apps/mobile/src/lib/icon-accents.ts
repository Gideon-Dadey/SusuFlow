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
    ? { bg: "rgba(0, 86, 210, 0.18)", fg: "#38BDF8" }
    : { bg: "#EBF5FF", fg: "#0056D2" };
}
