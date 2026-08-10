import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/Button";
import { depositApi, type DepositDetail } from "@/lib/api";
import { formatGhs } from "@/lib/currency";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export type PendingDepositSession = {
  transactionId: string;
  reference: string;
  amount: number;
  paymentUrl?: string;
  bankTransfer?: {
    bankName: string;
    accountName?: string;
    accountNumber?: string;
    narration: string;
    instructions: string;
  } | null;
  methodLabel: string;
};

const POLL_MS = 3000;
const MAX_POLL_MS = 15 * 60_000;

function statusCopy(status: string): { title: string; body: string } {
  switch (status) {
    case "completed":
      return {
        title: "Deposit confirmed",
        body: "Your wallet has been credited. You can keep saving.",
      };
    case "failed":
      return {
        title: "Payment failed",
        body: "No money left your account for this attempt. Try again when ready.",
      };
    case "expired":
      return {
        title: "Payment expired",
        body: "This deposit request timed out. Start a new deposit to continue.",
      };
    case "cancelled":
      return {
        title: "Payment cancelled",
        body: "This deposit was cancelled. You can start a new one anytime.",
      };
    default:
      return {
        title: "Waiting for payment",
        body: "Approve the charge with your provider. We’ll update this screen automatically.",
      };
  }
}

export function DepositPendingPanel({
  session,
  onDone,
  onStartNew,
}: {
  session: PendingDepositSession;
  onDone: () => void;
  onStartNew: () => void;
}) {
  const { colors, isDark } = useTheme();
  const [detail, setDetail] = useState<DepositDetail | null>(null);
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());
  const appState = useRef(AppState.currentState);

  const status = detail?.status ?? "pending";
  const terminal = ["completed", "failed", "expired", "cancelled"].includes(
    status,
  );
  const copy = statusCopy(status);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt.current > MAX_POLL_MS) {
        setError(
          "Still waiting. Pull to refresh Activity later, or try again.",
        );
        return;
      }
      try {
        const next = await depositApi.get(session.transactionId);
        if (cancelled) return;
        setDetail(next);
        setError("");
        if (
          !["completed", "failed", "expired", "cancelled"].includes(next.status)
        ) {
          timer = setTimeout(() => void poll(), POLL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not check payment status. Retrying…",
        );
        timer = setTimeout(() => void poll(), POLL_MS * 2);
      }
    };

    void poll();

    const sub = AppState.addEventListener("change", (next) => {
      if (
        appState.current.match(/inactive|background/) &&
        next === "active" &&
        !terminal
      ) {
        void poll();
      }
      appState.current = next;
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, [session.transactionId, terminal]);

  const reopenCheckout = async () => {
    if (!session.paymentUrl) return;
    await WebBrowser.openBrowserAsync(session.paymentUrl);
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor:
                status === "completed"
                  ? isDark
                    ? "rgba(16,185,129,0.16)"
                    : "#ECFDF5"
                  : isDark
                    ? "rgba(245,158,11,0.16)"
                    : "#FFFBEB",
            },
          ]}
        >
          {terminal && status === "completed" ? (
            <AppIcon name="badge-check" size={28} color="#059669" />
          ) : terminal ? (
            <AppIcon name="alert-circle" size={28} color="#D97706" />
          ) : (
            <ActivityIndicator color={colors.primary} size="large" />
          )}
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {copy.title}
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          {copy.body}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Row label="Amount" value={formatGhs(session.amount)} />
        <Row label="Method" value={session.methodLabel} />
        <Row label="Reference" value={session.reference} />
        <Row label="Status" value={status.replace(/_/g, " ")} />

        {session.bankTransfer ? (
          <View
            style={[
              styles.bankBox,
              {
                backgroundColor: isDark ? colors.muted : colors.primary50,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.bankTitle, { color: colors.foreground }]}>
              {session.bankTransfer.bankName}
            </Text>
            <Text style={[styles.bankBody, { color: colors.mutedForeground }]}>
              {session.bankTransfer.instructions}
            </Text>
            {session.bankTransfer.accountNumber ? (
              <Text style={[styles.bankBody, { color: colors.foreground }]}>
                {session.bankTransfer.accountName}
                {"\n"}
                {session.bankTransfer.accountNumber}
                {"\n"}Narration: {session.bankTransfer.narration}
              </Text>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {error}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {!terminal && session.paymentUrl ? (
          <Button
            title="Open payment again"
            onPress={() => void reopenCheckout()}
          />
        ) : null}
        {status === "completed" ? (
          <Button title="Done" onPress={onDone} />
        ) : terminal ? (
          <Button title="Start new deposit" onPress={onStartNew} />
        ) : (
          <Pressable onPress={onStartNew} hitSlop={8}>
            <Text style={[styles.secondary, { color: colors.mutedForeground }]}>
              Cancel and start over
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  divider: {
    alignSelf: "stretch",
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 4,
  },
  rowLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
  },
  rowValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    textAlign: "right",
    flexShrink: 1,
  },
  bankBox: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
    marginTop: spacing.sm,
  },
  bankTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  bankBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
  error: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  actions: { gap: spacing.sm },
  secondary: {
    textAlign: "center",
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    paddingVertical: spacing.sm,
  },
});
