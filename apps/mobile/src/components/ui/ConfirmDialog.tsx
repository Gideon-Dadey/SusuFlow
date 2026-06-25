import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface ConfirmDialogProps {
  visible: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onCancel}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.message, { color: colors.foreground }]}>
            {message}
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                { backgroundColor: colors.primary },
                (pressed || loading) && styles.buttonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color={colors.primaryForeground}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    styles.buttonLabel,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {confirmLabel}
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  borderColor: colors.border,
                  backgroundColor: "transparent",
                },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.buttonLabel, { color: colors.foreground }]}>
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  message: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.base,
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  confirmButton: {},
  cancelButton: {
    borderWidth: 1,
  },
  buttonLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
