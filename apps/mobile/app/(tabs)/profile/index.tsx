import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { AppBrandFooter } from "@/components/profile/AppBrandFooter";
import {
  TabScreenHeader,
  TabScreenLayout,
} from "@/components/layout/TabScreen";
import {
  ProfileAccountRow,
  ProfileDivider,
  ProfileRow,
  ProfileSection,
} from "@/components/profile/ProfileSections";
import { useProfileData } from "@/components/settings/useProfileData";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import {
  PROFILE_HOME_GROUPS,
  SECTION_ROUTES,
  type ProfileSectionId,
} from "@/types/profile";

function maskClientId(value?: string) {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `${value.slice(0, 4)}****`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { displayName, initials, email, profile } = useProfileData();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const clientId = maskClientId(profile?.customer?.customerNumber);

  const navigateTo = (id: ProfileSectionId) => {
    router.push(SECTION_ROUTES[id]);
  };

  const handleConfirmSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      setSignOutOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <TabScreenLayout
        headerDecoration
        header={<TabScreenHeader title="Profile" />}
      >
        <ProfileSection title="Account Information">
          <ProfileAccountRow
            initials={initials}
            name={displayName}
            email={email || undefined}
            clientId={clientId}
            seed={displayName}
            onPress={() => router.push("/(tabs)/profile/account")}
          />
        </ProfileSection>

        {PROFILE_HOME_GROUPS.map((group) => (
          <ProfileSection key={group.title} title={group.title}>
            {group.items.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <ProfileDivider /> : null}
                <ProfileRow
                  icon={item.icon}
                  label={item.label}
                  subtitle={
                    item.id === "appearance"
                      ? colorScheme === "dark"
                        ? "Dark theme"
                        : "Light theme"
                      : item.description
                  }
                  onPress={() => navigateTo(item.id)}
                />
              </View>
            ))}
          </ProfileSection>
        ))}

        <ProfileSection title="Session">
          <ProfileRow
            icon="logout"
            label="Sign out"
            subtitle="Sign out of this device"
            destructive
            showChevron={false}
            onPress={() => setSignOutOpen(true)}
          />
        </ProfileSection>

        <AppBrandFooter />
      </TabScreenLayout>

      <ConfirmDialog
        visible={signOutOpen}
        message="Are you sure you want to log out?"
        confirmLabel="Yes"
        cancelLabel="No"
        loading={signingOut}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </>
  );
}
