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

/**
 * More tab — product & money services only.
 * Account, KYC, security, and preferences live under My Profile (avatar).
 */
export const MORE_SERVICE_ITEMS: ServiceMenuItem[] = [
  {
    id: "history",
    label: "Transaction history",
    subtitle: "Deposits, withdrawals, and receipts",
    icon: "receipt",
    href: "/(tabs)/activity",
    tone: "slate",
  },
  {
    id: "withdraw",
    label: "Withdraw",
    subtitle: "Request a payout to mobile money",
    icon: "arrow-up-right",
    href: "/(tabs)/withdraw",
    tone: "rose",
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
    id: "legal",
    label: "Legal",
    subtitle: "Privacy Policy and Terms of use",
    icon: "file-text",
    href: "/(tabs)/profile/about",
    tone: "teal",
  },
];

/**
 * Avatar → My Profile — single account & preferences home.
 * No overlap with More’s money services.
 */
export const MY_PROFILE_ITEMS: ServiceMenuItem[] = [
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
    subtitle: "Push, email, and SMS alerts",
    icon: "bell",
    href: "/my-profile/notifications",
    tone: "blue",
  },
  {
    id: "appearance",
    label: "Appearance",
    subtitle: "Theme and display preferences",
    icon: "moon",
    href: "/my-profile/appearance",
    tone: "amber",
  },
];
