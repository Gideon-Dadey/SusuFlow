import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useProfileData } from "@/components/settings/useProfileData";
import { userApi } from "@/lib/api";

export function PersonalSettingsContent() {
  const { profile, refetch } = useProfileData();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const updateMutation = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        firstName: firstName || profile?.firstName,
        lastName: lastName || profile?.lastName,
        phone: phone || profile?.phone || undefined,
      }),
    onSuccess: () => {
      Alert.alert("Saved", "Your personal details have been updated.");
      refetch();
    },
    onError: (err: Error) => Alert.alert("Update failed", err.message),
  });

  return (
    <View style={{ gap: 14 }}>
      <Input
        label="First name"
        defaultValue={profile?.firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <Input
        label="Last name"
        defaultValue={profile?.lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      <Input
        label="Phone number"
        defaultValue={profile?.phone || ""}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+233 XX XXX XXXX"
      />
      <Button
        title="Save changes"
        loading={updateMutation.isPending}
        onPress={() => updateMutation.mutate()}
      />
    </View>
  );
}
