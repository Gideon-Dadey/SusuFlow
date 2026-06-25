import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import type { BiometricSupport } from "@/lib/biometric";
import { radius } from "@/theme/tokens";

import { brandGreen } from "@/theme/tokens";

const BRAND_GREEN = brandGreen;

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
  const iconName = support?.icon ?? "fingerprint";
  const label = support?.label ?? "Biometrics";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sign in with ${label}`}
      accessibilityState={{ disabled: !enabled || loading }}
      onPress={onPress}
      disabled={!enabled || loading}
      style={({ pressed }) => [
        styles.button,
        ready && styles.buttonReady,
        !enabled && styles.buttonDisabled,
        enabled && !ready && styles.buttonSetup,
        pressed && enabled && !loading && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <MaterialCommunityIcons
          name={iconName}
          size={28}
          color={ready ? "#ffffff" : BRAND_GREEN}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
  },
  buttonReady: {
    backgroundColor: BRAND_GREEN,
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonSetup: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
