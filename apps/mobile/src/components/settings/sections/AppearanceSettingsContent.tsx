import { SettingToggle } from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { useThemeStore } from "@/stores/theme.store";

export function AppearanceSettingsContent() {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const toggleColorScheme = useThemeStore((s) => s.toggleColorScheme);

  return (
    <SettingsPanel>
      <SettingToggle
        icon="moon-outline"
        title="Dark theme"
        subtitle={
          colorScheme === "dark"
            ? "Easier on the eyes in low light"
            : "Bright, clean interface"
        }
        value={colorScheme === "dark"}
        onValueChange={() => toggleColorScheme()}
      />
    </SettingsPanel>
  );
}
