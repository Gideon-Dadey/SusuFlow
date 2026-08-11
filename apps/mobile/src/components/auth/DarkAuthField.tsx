import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

interface DarkAuthFieldProps extends TextInputProps {
  label?: string;
  secure?: boolean;
}

/** Bamboo-style charcoal field on pure black auth screens. */
export function DarkAuthField({
  label,
  secure,
  style,
  value,
  placeholder,
  onFocus,
  onBlur,
  onChangeText,
  ...props
}: DarkAuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const showPlaceholder = !value && !!placeholder;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused]}>
        {/*
          Custom font + TextInput placeholders mis-kern on Android (letters look
          spaced out). Overlay a Text instead so placeholders match typed text.
        */}
        {showPlaceholder ? (
          <Text
            style={[styles.placeholder, secure && styles.placeholderWithToggle]}
            pointerEvents="none"
          >
            {placeholder}
          </Text>
        ) : null}
        <TextInput
          {...props}
          value={value}
          placeholder=""
          placeholderTextColor="transparent"
          accessibilityLabel={
            props.accessibilityLabel ?? label ?? placeholder ?? undefined
          }
          secureTextEntry={secure ? !visible : false}
          style={[styles.input, style]}
          onChangeText={onChangeText}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {secure ? (
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
              color={authChrome.inkMuted}
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
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: authChrome.fieldLabel,
    marginLeft: 2,
  },
  field: {
    position: "relative",
    minHeight: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    backgroundColor: authChrome.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 8,
  },
  fieldFocused: {
    borderColor: authChrome.fieldBorderFocused,
  },
  placeholder: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    bottom: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    letterSpacing: 0,
    color: authChrome.placeholder,
    lineHeight: authChrome.controlHeight - 2,
  },
  placeholderWithToggle: {
    right: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    letterSpacing: 0,
    color: authChrome.ink,
  },
  toggle: {
    padding: 10,
  },
});
