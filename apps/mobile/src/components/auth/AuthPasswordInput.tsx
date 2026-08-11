import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTheme } from "@/theme/ThemeProvider";

interface AuthPasswordInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoComplete?: "password" | "new-password" | "current-password";
}

export function AuthPasswordInput({
  label,
  value,
  onChangeText,
  autoComplete = "password",
}: AuthPasswordInputProps) {
  const { colors, radius, typography } = useTheme();
  const [visible, setVisible] = useState(false);

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
      <View
        style={[
          styles.field,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.card,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoComplete={autoComplete}
          autoCapitalize="none"
          style={[
            styles.input,
            {
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.size.base,
              color: colors.foreground,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          style={styles.toggle}
        >
          <AppIcon
            name={visible ? "eye-off" : "eye"}
            size={20}
            color={colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {},
  field: {
    minHeight: 48,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  toggle: {
    padding: 8,
  },
});
