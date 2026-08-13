import { AppearanceSettingsContent } from "@/components/settings/sections/AppearanceSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function AppearanceSettingsScreen() {
  const meta = PROFILE_SECTION_META.appearance;
  return (
    <SettingsDetailLayout title={meta.title} subtitle={meta.subtitle}>
      <AppearanceSettingsContent />
    </SettingsDetailLayout>
  );
}
