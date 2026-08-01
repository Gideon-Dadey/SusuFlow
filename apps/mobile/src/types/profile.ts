import type { AppIconName } from "@/components/icons/AppIcon";

export type ProfileSectionId =
  | "account"
  | "personal"
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
        label: "Account overview",
        icon: "wallet",
        description: "Membership, email, and group",
      },
      {
        id: "personal",
        label: "Personal details",
        icon: "user",
        description: "Name, phone, and contact info",
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

export const SECTION_ROUTES: Record<
  ProfileSectionId,
  `/(tabs)/profile/${ProfileSectionId}`
> = {
  account: "/(tabs)/profile/account",
  personal: "/(tabs)/profile/personal",
  security: "/(tabs)/profile/security",
  notifications: "/(tabs)/profile/notifications",
  appearance: "/(tabs)/profile/appearance",
  help: "/(tabs)/profile/help",
  about: "/(tabs)/profile/about",
};

export const PROFILE_SECTION_META: Record<
  ProfileSectionId,
  { title: string; subtitle: string }
> = {
  account: {
    title: "Account Information",
    subtitle: "Your membership details and linked information",
  },
  personal: {
    title: "Personal details",
    subtitle: "Keep your profile accurate and up to date",
  },
  security: {
    title: "Security",
    subtitle: "Protect your account and sign-in methods",
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

export const PROFILE_HOME_GROUPS: SettingsGroup[] = SETTINGS_GROUPS.map(
  (group) => ({
    ...group,
    items: group.items.filter((item) => item.id !== "account"),
  }),
).filter((group) => group.items.length > 0);

export const PROFILE_MENU_ITEMS = PROFILE_HOME_GROUPS.flatMap((g) => g.items);

export const PROFILE_SECTION_TITLES = Object.fromEntries(
  Object.entries(PROFILE_SECTION_META).map(([k, v]) => [k, v.title]),
) as Record<ProfileSectionId, string>;
