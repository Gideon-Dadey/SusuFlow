import { SecuritySettingsContent } from "@/components/settings/sections/SecuritySettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function SecuritySettingsScreen() {
  const meta = PROFILE_SECTION_META.security;
  return (
    <SettingsDetailLayout
      title={meta.title}
      subtitle={meta.subtitle}
      keyboardAvoid
    >
      <SecuritySettingsContent />
    </SettingsDetailLayout>
  );
}
