import { StyleSheet, Text, View } from "react-native";
import {
  DEPOSIT_STEP_LABELS,
  type DepositStep,
} from "@/components/deposit/depositUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface DepositStepIndicatorProps {
  step: DepositStep;
}

export function DepositStepIndicator({ step }: DepositStepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      {DEPOSIT_STEP_LABELS.map((label, index) => {
        const active = index === step;
        const complete = index < step;

        return (
          <View key={label} style={styles.item}>
            <View style={styles.track}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      complete || active ? colors.primary : colors.muted,
                    borderColor:
                      complete || active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dotLabel,
                    {
                      color:
                        complete || active
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              {index < DEPOSIT_STEP_LABELS.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: complete
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.foreground : colors.mutedForeground,
                  fontFamily: active
                    ? typography.fontFamily.semibold
                    : typography.fontFamily.medium,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  dotLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
  },
  line: {
    position: "absolute",
    left: "58%",
    right: "-42%",
    height: 2,
    borderRadius: radius.full,
  },
  label: {
    fontSize: 10,
    letterSpacing: -0.1,
  },
});
