import { KycSettingsContent } from "@/components/settings/sections/KycSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function KycSettingsScreen() {
  const meta = PROFILE_SECTION_META.kyc;
  return (
    <SettingsDetailLayout
      title={meta.title}
      subtitle={meta.subtitle}
      keyboardAvoid
    >
      <KycSettingsContent />
    </SettingsDetailLayout>
  );
}
