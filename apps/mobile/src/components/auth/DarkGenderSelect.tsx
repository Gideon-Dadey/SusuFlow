import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

export type GenderValue = "female" | "male" | "other" | "prefer_not_to_say";

const GENDER_OPTIONS: { value: GenderValue; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

interface DarkSelectFieldProps {
  label?: string;
  placeholder: string;
  value: GenderValue | "";
  onChange: (value: GenderValue) => void;
}

export function DarkGenderSelect({
  label,
  placeholder,
  value,
  onChange,
}: DarkSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = GENDER_OPTIONS.find((option) => option.value === value);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        onPress={() => setOpen(true)}
        style={styles.field}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label || placeholder}
        </Text>
        <AppIcon name="chevron-down" size={18} color={authChrome.inkMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Gender</Text>
            {GENDER_OPTIONS.map((option) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      active && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {active ? (
                    <AppIcon
                      name="check"
                      size={18}
                      color={authChrome.ink}
                      weight="bold"
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
    minHeight: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    backgroundColor: authChrome.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  value: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    letterSpacing: 0,
    color: authChrome.ink,
  },
  placeholder: {
    color: authChrome.placeholder,
    letterSpacing: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 4,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: authChrome.ink,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  option: {
    minHeight: 48,
    borderRadius: authChrome.controlRadius,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  optionLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    color: authChrome.inkMuted,
  },
  optionLabelActive: {
    color: authChrome.ink,
    fontFamily: typography.fontFamily.semibold,
  },
});
