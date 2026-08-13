import type { AppIconName } from "@/components/icons/AppIcon";

export type ProfileSectionId =
  | "account"
  | "personal"
  | "kyc"
  | "security"
  | "notifications"
  | "appearance"
  | "help"
  | "about";

export interface SettingsNavItem {
  id: ProfileSectionId;
  label: string;
  icon: AppIconName;
  description: string;
}

export interface SettingsGroup {
  title: string;
  items: SettingsNavItem[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Account",
    items: [
      {
        id: "account",
        label: "Account details",
        icon: "user",
        description: "Name, phone, email, and membership",
      },
      {
        id: "kyc",
        label: "Identity verification",
        icon: "shield",
        description: "Ghana Card, passport, and selfie",
      },
    ],
  },
  {
    title: "Security & privacy",
    items: [
      {
        id: "security",
        label: "Security",
        icon: "shield",
        description: "Password and sign-in options",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: "bell",
        description: "Push, email, and SMS alerts",
      },
    ],
  },
  {
    title: "App",
    items: [
      {
        id: "appearance",
        label: "Appearance",
        icon: "moon",
        description: "Theme and display",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        id: "help",
        label: "Help & support",
        icon: "support",
        description: "Contact our team",
      },
      {
        id: "about",
        label: "About SusuFlow",
        icon: "info",
        description: "Version and company info",
      },
    ],
  },
];

export const SECTION_ROUTES: Record<ProfileSectionId, string> = {
  account: "/my-profile/account",
  personal: "/my-profile/account",
  kyc: "/my-profile/kyc",
  security: "/my-profile/security",
  notifications: "/my-profile/notifications",
  appearance: "/my-profile/appearance",
  help: "/support",
  about: "/(tabs)/profile/about",
};

export const PROFILE_SECTION_META: Record<
  ProfileSectionId,
  { title: string; subtitle: string }
> = {
  account: {
    title: "Account details",
    subtitle: "View and update your profile in one place",
  },
  personal: {
    title: "Account details",
    subtitle: "View and update your profile in one place",
  },
  kyc: {
    title: "Identity verification",
    subtitle: "Verify your ID so you can start saving safely",
  },
  security: {
    title: "Security",
    subtitle: "Password, app lock, and account protection",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Choose how we reach you",
  },
  appearance: {
    title: "Appearance",
    subtitle: "Customize how SusuFlow looks",
  },
  help: {
    title: "Help & support",
    subtitle: "We're here when you need us",
  },
  about: {
    title: "About SusuFlow",
    subtitle: "Community savings, built for Ghana",
  },
};

export const PROFILE_HOME_GROUPS: SettingsGroup[] = SETTINGS_GROUPS;

export const PROFILE_MENU_ITEMS = PROFILE_HOME_GROUPS.flatMap((g) => g.items);

export const PROFILE_SECTION_TITLES = Object.fromEntries(
  Object.entries(PROFILE_SECTION_META).map(([k, v]) => [k, v.title]),
) as Record<ProfileSectionId, string>;
