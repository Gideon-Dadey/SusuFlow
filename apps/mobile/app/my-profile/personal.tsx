import { PersonalSettingsContent } from "@/components/settings/sections/PersonalSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function PersonalSettingsScreen() {
  const meta = PROFILE_SECTION_META.personal;
  return (
    <SettingsDetailLayout
      title={meta.title}
      subtitle={meta.subtitle}
      keyboardAvoid
    >
      <PersonalSettingsContent />
    </SettingsDetailLayout>
  );
}
