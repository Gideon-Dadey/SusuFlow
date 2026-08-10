import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="account" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="security" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="help" />
      <Stack.Screen name="about" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="beneficiaries" />
      <Stack.Screen name="limits" />
      <Stack.Screen name="session" />
      <Stack.Screen name="referral" />
    </Stack>
  );
}
