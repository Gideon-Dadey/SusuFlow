import { Stack } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";

export default function MyProfileLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="account" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="security" />
      <Stack.Screen name="security-password" />
      <Stack.Screen name="security-lock" />
      <Stack.Screen name="security-delete" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
