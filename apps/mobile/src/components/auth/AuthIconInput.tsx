import { useState } from "react";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface AuthIconInputProps extends TextInputProps {
  label: string;
  icon: AppIconName;
  secure?: boolean;
}

export function AuthIconInput({
  label,
  icon,
  secure,
  style,
  ...props
}: AuthIconInputProps) {
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
        <AppIcon name={icon} size={18} color={colors.mutedForeground} />
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={secure && !visible}
          style={[
            styles.input,
            {
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.size.base,
              color: colors.foreground,
            },
            style,
          ]}
          {...props}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
          >
            <AppIcon
              name={visible ? "eye-off" : "eye"}
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {},
  field: {
    minHeight: 52,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
});
