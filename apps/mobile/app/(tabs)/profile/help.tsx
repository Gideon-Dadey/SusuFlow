import { HelpSettingsContent } from "@/components/settings/sections/HelpSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function HelpSettingsScreen() {
  const meta = PROFILE_SECTION_META.help;
  return (
    <SettingsDetailLayout title={meta.title} subtitle={meta.subtitle}>
      <HelpSettingsContent />
    </SettingsDetailLayout>
  );
}
