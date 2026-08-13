import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import {
  SettingRow,
  SettingsSwitch,
} from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { getBiometricSupport } from "@/lib/biometric";
import { useAppLockStore } from "@/stores/app-lock.store";
import { toast } from "@/stores/toast.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

/**
 * Security hub — PayPal / banking pattern:
 * one job per row, dedicated screens for forms, clear status labels.
 */
export function SecuritySettingsContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const lockEnabled = useAppLockStore((s) => s.enabled);
  const biometricUnlock = useAppLockStore((s) => s.biometricUnlock);
  const setBiometricUnlock = useAppLockStore((s) => s.setBiometricUnlock);
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    void getBiometricSupport().then((support) => {
      setBiometricLabel(support.label);
      setBiometricAvailable(support.available);
    });
  }, []);

  const onBiometricToggle = async (next: boolean) => {
    if (!lockEnabled) {
      Alert.alert(
        "App lock required",
        "Turn on App lock first, then you can unlock with biometrics.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Set up App lock",
            onPress: () => router.push("/my-profile/security-lock" as Href),
          },
        ],
      );
      return;
    }
    setBioBusy(true);
    try {
      await setBiometricUnlock(next);
      toast.success(
        next ? `${biometricLabel} is on` : `${biometricLabel} is off`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update biometrics",
      );
    } finally {
      setBioBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Sign-in
      </Text>
      <SettingsPanel>
        <SettingRow
          icon="key"
          title="Password"
          onPress={() => router.push("/my-profile/security-password" as Href)}
          showDivider={false}
        />
      </SettingsPanel>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        This device
      </Text>
      <SettingsPanel>
        <SettingRow
          icon="lock"
          title="App lock"
          onPress={() => router.push("/my-profile/security-lock" as Href)}
        />
        <SettingRow
          icon="fingerprint"
          title={biometricLabel}
          right={
            <SettingsSwitch
              value={biometricUnlock && lockEnabled}
              disabled={bioBusy || (!biometricAvailable && !biometricUnlock)}
              onValueChange={(next) => void onBiometricToggle(next)}
            />
          }
          showDivider={false}
        />
      </SettingsPanel>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Account
      </Text>
      <SettingsPanel>
        <SettingRow
          icon="shield"
          title="Delete account"
          onPress={() => router.push("/my-profile/security-delete" as Href)}
          showDivider={false}
        />
      </SettingsPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: spacing.md,
    marginBottom: 4,
    marginLeft: 4,
  },
});
