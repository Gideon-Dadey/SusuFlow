import type { AppIconName } from "@/components/icons/AppIcon";
import type { Href } from "expo-router";
import {
  getServiceWellFromLegacy,
  type LegacyServiceTone,
} from "@/theme/bankChrome";

export type ServiceWellTone = LegacyServiceTone;

export interface ServiceMenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: AppIconName;
  href: Href;
  tone: ServiceWellTone;
}

export function getServiceWell(
  tone: ServiceWellTone,
  isDark: boolean,
): { bg: string; fg: string } {
  return getServiceWellFromLegacy(tone, isDark);
}

/** Tab “More” hub — secondary product & account services (GCB-style). */
export const MORE_SERVICE_ITEMS: ServiceMenuItem[] = [
  {
    id: "history",
    label: "Transaction history",
    subtitle: "View and search your deposits and withdrawals",
    icon: "receipt",
    href: "/transactions",
    tone: "slate",
  },
  {
    id: "withdraw",
    label: "Withdraw",
    subtitle: "Request a payout to your mobile money",
    icon: "arrow-up-right",
    href: "/(tabs)/withdraw",
    tone: "rose",
  },
  {
    id: "kyc",
    label: "Identity verification",
    subtitle: "Ghana Card, passport, and selfie",
    icon: "shield",
    href: "/(tabs)/profile/kyc",
    tone: "mint",
  },
  {
    id: "security",
    label: "Security",
    subtitle: "Password, biometrics, and app lock",
    icon: "smartphone",
    href: "/(tabs)/profile/security",
    tone: "blue",
  },
  {
    id: "legal",
    label: "Legal",
    subtitle: "View Privacy Policy and Terms of use",
    icon: "file-text",
    href: "/(tabs)/profile/about",
    tone: "teal",
  },
  {
    id: "help",
    label: "Help & support",
    subtitle: "Contact our team when you need help",
    icon: "support",
    href: "/(tabs)/profile/help",
    tone: "violet",
  },
  {
    id: "appearance",
    label: "Appearance",
    subtitle: "Theme and display preferences",
    icon: "moon",
    href: "/(tabs)/profile/appearance",
    tone: "amber",
  },
  {
    id: "notifications",
    label: "Notifications",
    subtitle: "Push, email, and SMS alerts",
    icon: "bell",
    href: "/(tabs)/profile/notifications",
    tone: "blue",
  },
];

/** Personal profile menu (home avatar) — SusuFlow copy, bank-style layout. */
export const MY_PROFILE_ITEMS: ServiceMenuItem[] = [
  {
    id: "settings",
    label: "Settings",
    subtitle: "Appearance, alerts, and account preferences",
    icon: "settings",
    href: "/my-profile/settings",
    tone: "blue",
  },
  {
    id: "personal",
    label: "Personal details",
    subtitle: "Name, phone, and contact info",
    icon: "user",
    href: "/my-profile/personal",
    tone: "slate",
  },
  {
    id: "account",
    label: "Account overview",
    subtitle: "Membership, email, and group details",
    icon: "wallet",
    href: "/my-profile/account",
    tone: "mint",
  },
  {
    id: "kyc",
    label: "Identity verification",
    subtitle: "Verify your ID to unlock deposits and withdrawals",
    icon: "shield",
    href: "/my-profile/kyc",
    tone: "orange",
  },
  {
    id: "security",
    label: "Security",
    subtitle: "Password, biometrics, and app lock",
    icon: "smartphone",
    href: "/my-profile/security",
    tone: "teal",
  },
  {
    id: "notifications",
    label: "Notifications",
    subtitle: "Choose how SusuFlow reaches you",
    icon: "bell",
    href: "/my-profile/notifications",
    tone: "blue",
  },
];
