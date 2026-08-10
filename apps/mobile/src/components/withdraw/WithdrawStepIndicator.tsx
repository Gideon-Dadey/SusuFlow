import { StyleSheet, Text, View } from "react-native";
import {
  WITHDRAW_STEP_LABELS,
  type WithdrawStep,
} from "@/components/withdraw/withdrawUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface WithdrawStepIndicatorProps {
  step: WithdrawStep;
  onGeometry?: boolean;
}

export function WithdrawStepIndicator({
  step,
  onGeometry = false,
}: WithdrawStepIndicatorProps) {
  const { colors } = useTheme();
  const idle = onGeometry ? "rgba(255,255,255,0.35)" : colors.border;
  const mute = onGeometry ? "rgba(255,255,255,0.7)" : colors.mutedForeground;
  const activeLabel = onGeometry ? "#FFFFFF" : colors.foreground;
  const activeDot = onGeometry ? "#FFFFFF" : colors.primary;
  const activeDotFg = onGeometry ? "#0B1220" : colors.primaryForeground;

  return (
    <View style={styles.root}>
      {WITHDRAW_STEP_LABELS.map((label, index) => {
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
                      complete || active
                        ? activeDot
                        : onGeometry
                          ? "rgba(255,255,255,0.12)"
                          : colors.muted,
                    borderColor: complete || active ? activeDot : idle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dotLabel,
                    {
                      color: complete || active ? activeDotFg : mute,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              {index < WITHDRAW_STEP_LABELS.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: complete ? activeDot : idle,
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: active ? activeLabel : mute,
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
