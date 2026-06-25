import { AboutSettingsContent } from "@/components/settings/sections/AboutSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function AboutSettingsScreen() {
  const meta = PROFILE_SECTION_META.about;
  return (
    <SettingsDetailLayout title={meta.title} subtitle={meta.subtitle}>
      <AboutSettingsContent />
    </SettingsDetailLayout>
  );
}
