import { AccountSettingsContent } from "@/components/settings/sections/AccountSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function AccountSettingsScreen() {
  const meta = PROFILE_SECTION_META.account;
  return (
    <SettingsDetailLayout title={meta.title}>
      <AccountSettingsContent />
    </SettingsDetailLayout>
  );
}
