import { NotificationsSettingsContent } from "@/components/settings/sections/NotificationsSettingsContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PROFILE_SECTION_META } from "@/types/profile";

export default function NotificationsSettingsScreen() {
  const meta = PROFILE_SECTION_META.notifications;
  return (
    <SettingsDetailLayout title={meta.title} subtitle={meta.subtitle}>
      <NotificationsSettingsContent />
    </SettingsDetailLayout>
  );
}
