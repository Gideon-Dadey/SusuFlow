import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface InputProps extends TextInputProps {
  label: string;
}

export function Input({ label, style, ...props }: InputProps) {
  const { colors, radius, typography } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.label,
          {
            fontFamily: typography.fontFamily.medium,
            fontSize: typography.size.sm,
            color: colors.foreground,
          },
        ]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            fontFamily: typography.fontFamily.regular,
            fontSize: typography.size.base,
            color: colors.foreground,
            backgroundColor: colors.card,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {},
  input: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
