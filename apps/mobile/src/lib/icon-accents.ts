import type { AppIconName } from "@/components/icons/AppIcon";
import { getWellForIcon } from "@/theme/bankChrome";

/** Accent wells — aliases bankChrome for shared list / ledger icons. */
export function getIconAccent(icon: AppIconName, isDark: boolean) {
  return getWellForIcon(icon, isDark);
}
