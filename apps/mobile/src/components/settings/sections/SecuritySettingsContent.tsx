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
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Manage how you sign in and protect balances on this device.
      </Text>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Sign-in
      </Text>
      <SettingsPanel>
        <SettingRow
          icon="key"
          title="Password"
          subtitle="Change the password you use to sign in"
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
          subtitle={
            lockEnabled
              ? "On · PIN required when you return to SusuFlow"
              : "Off · Protect the app when you leave"
          }
          onPress={() => router.push("/my-profile/security-lock" as Href)}
        />
        <SettingRow
          icon="fingerprint"
          title={biometricLabel}
          subtitle={
            !lockEnabled
              ? "Requires App lock"
              : biometricAvailable
                ? biometricUnlock
                  ? `On · Unlock with ${biometricLabel}`
                  : `Use ${biometricLabel} instead of your PIN`
                : `Set up ${biometricLabel} in phone settings first`
          }
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
          subtitle="Permanently close your SusuFlow account"
          onPress={() => router.push("/my-profile/security-delete" as Href)}
          showDivider={false}
        />
      </SettingsPanel>

      <Text style={[styles.footerHint, { color: colors.mutedForeground }]}>
        SusuFlow never asks for your password, PIN, or OTP by chat or email.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  intro: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
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
  footerHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
    marginHorizontal: 4,
  },
});
