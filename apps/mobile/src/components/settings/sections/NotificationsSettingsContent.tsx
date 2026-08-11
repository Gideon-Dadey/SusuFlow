import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import {
  SettingRow,
  SettingToggle,
} from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { notificationApi, type NotificationPreferences } from "@/lib/api";
import {
  registerDevicePushTokenWithRetry,
  requestPushPermissions,
} from "@/lib/push-notifications";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

const FALLBACK_PREFS: NotificationPreferences = {
  pushEnabled: true,
  transactions: true,
  identity: true,
  security: true,
  account: true,
};

export function NotificationsSettingsContent() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [testBusy, setTestBusy] = useState(false);
  const prefsKey = userId
    ? queryKeys.notificationPreferences(userId)
    : (["notification-preferences", "inactive"] as const);

  const prefsQuery = useQuery({
    queryKey: prefsKey,
    queryFn: () => notificationApi.getPreferences(),
    enabled: !!userId,
  });

  const prefs = prefsQuery.data ?? FALLBACK_PREFS;

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<NotificationPreferences>) =>
      notificationApi.updatePreferences(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: prefsKey });
      const previous =
        queryClient.getQueryData<NotificationPreferences>(prefsKey);
      const next: NotificationPreferences = {
        ...FALLBACK_PREFS,
        ...previous,
        ...patch,
        security: true,
      };
      queryClient.setQueryData(prefsKey, next);
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(prefsKey, context.previous);
      }
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : "Try again in a moment.",
      );
    },
    onSuccess: (next) => {
      queryClient.setQueryData(prefsKey, next);
    },
  });

  const update = (patch: Partial<NotificationPreferences>) => {
    updateMutation.mutate(patch);
  };

  const writeLocal = (patch: Partial<NotificationPreferences>) => {
    const current =
      queryClient.getQueryData<NotificationPreferences>(prefsKey) ??
      FALLBACK_PREFS;
    queryClient.setQueryData(prefsKey, {
      ...current,
      ...patch,
      security: true as const,
    });
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!enabled) {
      update({ pushEnabled: false });
      return;
    }

    writeLocal({ pushEnabled: true });

    const granted = await requestPushPermissions();
    if (!granted) {
      writeLocal({ pushEnabled: false });
      Alert.alert(
        "Notifications are off",
        "Open iPhone Settings → Notifications → SusuFlow and allow alerts so you can see payments even when the app is closed.",
      );
      return;
    }

    const token = await registerDevicePushTokenWithRetry(2);
    if (!token) {
      writeLocal({ pushEnabled: false });
      Alert.alert(
        "Device not ready",
        "We could not register this phone yet. Stay on this screen for a moment and try again on a physical device.",
      );
      return;
    }

    update({ pushEnabled: true });
  };

  const handleTest = async () => {
    setTestBusy(true);
    try {
      await registerDevicePushTokenWithRetry(2);
      await notificationApi.sendTest();
      Alert.alert(
        "Test sent",
        "Lock your phone or leave the app. You should see a SusuFlow alert within a few seconds.",
      );
    } catch (error) {
      Alert.alert(
        "Test did not send",
        error instanceof Error
          ? error.message
          : "Make sure the API and worker are running, then try again.",
      );
    } finally {
      setTestBusy(false);
    }
  };

  return (
    <View style={styles.stack}>
      <SettingsPanel>
        <SettingToggle
          icon="bell"
          title="Push alerts"
          subtitle="Reach this phone when the app is closed"
          value={prefs.pushEnabled}
          onValueChange={(value) => void handlePushToggle(value)}
          showDivider
        />
        <SettingToggle
          icon="arrow-down-left"
          title="Payments & payouts"
          subtitle="Deposits credited, withdrawals, failed charges"
          value={prefs.transactions}
          onValueChange={(transactions) => update({ transactions })}
          showDivider
        />
        <SettingToggle
          icon="fingerprint"
          title="Identity"
          subtitle="Ghana Card approved or needs another look"
          value={prefs.identity}
          onValueChange={(identity) => update({ identity })}
          showDivider
        />
        <SettingToggle
          icon="shield"
          title="Security"
          subtitle="Always on — new sign-in and password changes"
          value
          disabled
          onValueChange={() => undefined}
          showDivider
        />
        <SettingToggle
          icon="info"
          title="Account updates"
          subtitle="Service messages from your susu company"
          value={prefs.account}
          onValueChange={(account) => update({ account })}
        />
      </SettingsPanel>

      <SettingsPanel>
        <SettingRow
          icon="smartphone"
          title="Send a test alert"
          subtitle="Confirms this phone can receive background push"
          showDivider={false}
        />
        <View style={styles.testBlock}>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Leave the app after you tap send. The alert should arrive the same
            way a real deposit would.
          </Text>
          <Button
            title={testBusy ? "Sending…" : "Send test notification"}
            onPress={() => void handleTest()}
            loading={testBusy}
          />
        </View>
      </SettingsPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  testBlock: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
