import { StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/Button";
import { formatGhs } from "@/lib/currency";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export type SubmittedWithdrawal = {
  reference: string;
  amount: number;
  methodLabel: string;
  phone: string;
};

export function WithdrawSubmittedPanel({
  submission,
  onDone,
  onStartNew,
}: {
  submission: SubmittedWithdrawal;
  onDone: () => void;
  onStartNew: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor: isDark ? colors.muted : colors.primary50,
            },
          ]}
        >
          <AppIcon name="clock" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Withdrawal requested
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Your request is pending staff approval. You’ll be notified when funds
          are paid out to your mobile money wallet.
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Row label="Amount" value={formatGhs(submission.amount)} />
        <Row label="Destination" value={submission.methodLabel} />
        <Row label="MoMo number" value={submission.phone} />
        <Row label="Reference" value={submission.reference} />
      </View>

      <View style={styles.actions}>
        <Button title="Done" onPress={onDone} />
        <Button
          title="New withdrawal"
          variant="secondary"
          onPress={onStartNew}
        />
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
  root: {
    gap: spacing.lg,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  iconWell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignSelf: "stretch",
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
  actions: {
    gap: spacing.sm,
  },
});
