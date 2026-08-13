import type { AppIconName } from "@/components/icons/AppIcon";
import type { Href } from "expo-router";
import { getSupportEmail } from "@/lib/config";
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
  tone: ServiceWellTone;
  /** Navigate to this route when pressed. */
  href?: Href;
  /** Special action instead of navigation. */
  action?: "contact-email";
}

export function getServiceWell(
  tone: ServiceWellTone,
  isDark: boolean,
): { bg: string; fg: string } {
  return getServiceWellFromLegacy(tone, isDark);
}

/**
 * More tab — money services + support.
 * Account, KYC, security, and preferences live under My Profile (avatar).
 */
export const MORE_SERVICE_ITEMS: ServiceMenuItem[] = [
  {
    id: "deposit",
    label: "Deposit",
    subtitle: "Add money with Mobile Money",
    icon: "plus",
    href: "/(tabs)/deposit",
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
    id: "goals",
    label: "Savings goals",
    subtitle: "Plans you are enrolled in",
    icon: "goals",
    href: "/(tabs)/plans",
    tone: "orange",
  },
  {
    id: "history",
    label: "Transaction history",
    subtitle: "Deposits, withdrawals, and receipts",
    icon: "receipt",
    href: "/(tabs)/activity",
    tone: "blue",
  },
  {
    id: "chat",
    label: "Chat",
    subtitle: "Ask general questions about the app",
    icon: "chat",
    href: "/support" as Href,
    tone: "violet",
  },
  {
    id: "contact",
    label: "Contact us",
    subtitle: getSupportEmail(),
    icon: "mail",
    action: "contact-email",
    tone: "blue",
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
    id: "account",
    label: "Account details",
    subtitle: "Name, phone, email, and membership",
    icon: "user",
    href: "/my-profile/account",
    tone: "slate",
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
    subtitle: "Password, app lock, and biometrics",
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
