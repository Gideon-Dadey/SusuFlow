import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import type { BiometricSupport } from "@/lib/biometric";
import { useTheme } from "@/theme/ThemeProvider";

interface BiometricLoginButtonProps {
  support: BiometricSupport | null;
  enabled: boolean;
  ready?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function BiometricLoginButton({
  support,
  enabled,
  ready = false,
  loading,
  onPress,
  style,
}: BiometricLoginButtonProps) {
  const { colors, radius, isDark } = useTheme();
  const iconName = support?.icon ?? "face-recognition";
  const label = support?.label ?? "Biometrics";

  const buttonBg = ready ? "#0056d2" : isDark ? "#18181b" : "#f1f5f9";

  const borderColor = ready ? "#0056d2" : isDark ? "#27272a" : "#e2e8f0";

  const iconColor = ready ? "#ffffff" : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sign in with ${label}`}
      accessibilityState={{ disabled: !enabled || loading }}
      onPress={onPress}
      disabled={!enabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: radius.lg,
          backgroundColor: buttonBg,
          borderColor,
        },
        !enabled && styles.buttonDisabled,
        pressed &&
          enabled &&
          !loading &&
          (ready ? styles.pressedReady : styles.pressedSetup),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={ready ? "#ffffff" : colors.primary}
          size="small"
        />
      ) : (
        <MaterialCommunityIcons name={iconName} size={26} color={iconColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressedReady: {
    backgroundColor: "#0043aa",
    transform: [{ scale: 0.97 }],
  },
  pressedSetup: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
