import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { userApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { colors, radius, typography } from "@/theme/tokens";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: profile, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userApi.getMe(),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateMutation = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        firstName: firstName || profile?.firstName,
        lastName: lastName || profile?.lastName,
        phone: phone || profile?.phone || undefined,
      }),
    onSuccess: () => {
      Alert.alert("Saved", "Profile updated successfully.");
      refetch();
    },
    onError: (err: Error) => Alert.alert("Update failed", err.message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new Error(
          `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        );
      }
      return userApi.updatePassword({ currentPassword, newPassword });
    },
    onSuccess: () => {
      Alert.alert("Password updated", "Your password has been changed.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err: Error) => Alert.alert("Password update failed", err.message),
  });

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.firstName || "Customer";

  return (
    <Screen title="Profile" subtitle="Manage your account">
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.firstName?.[0] || "C").toUpperCase()}
            {(profile?.lastName?.[0] || "").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{profile?.email || user?.email}</Text>
      </View>

      <Card title="Personal details">
        <Input
          label="First name"
          defaultValue={profile?.firstName}
          onChangeText={setFirstName}
          placeholder={profile?.firstName}
        />
        <Input
          label="Last name"
          defaultValue={profile?.lastName}
          onChangeText={setLastName}
          placeholder={profile?.lastName}
        />
        <Input
          label="Phone"
          defaultValue={profile?.phone || ""}
          onChangeText={setPhone}
          placeholder="+233..."
          keyboardType="phone-pad"
        />
        <Button
          title="Save profile"
          loading={updateMutation.isPending}
          onPress={() => updateMutation.mutate()}
        />
      </Card>

      <Card title="Security">
        <Input
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <Input
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
        <Button
          title="Update password"
          variant="outline"
          loading={passwordMutation.isPending}
          onPress={() => passwordMutation.mutate()}
        />
      </Card>

      <Button title="Sign out" variant="outline" onPress={() => logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    color: colors.primaryForeground,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.heading,
  },
  email: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.mutedForeground,
  },
});
