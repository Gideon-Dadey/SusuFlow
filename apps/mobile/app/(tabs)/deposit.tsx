import { useMutation, useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { depositApi, userApi } from "@/lib/api";
import { colors, typography } from "@/theme/tokens";

const METHODS = [
  { id: "mtn_momo", label: "MTN MoMo" },
  { id: "telecel_cash", label: "Telecel Cash" },
];

export default function DepositScreen() {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userApi.getMe(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const customerId = profile?.customer?.id;
      if (!customerId) throw new Error("Customer account not found");

      const parsed = parseFloat(amount);
      if (!parsed || parsed <= 0) throw new Error("Enter a valid amount");

      return depositApi.initiate({
        amount: parsed,
        paymentMethod: method,
        customerId,
        payerPhone: phone,
      });
    },
    onSuccess: async (data) => {
      if (data.payment?.paymentUrl) {
        await WebBrowser.openBrowserAsync(data.payment.paymentUrl);
      }
      Alert.alert("Deposit started", `Reference: ${data.reference}`);
    },
    onError: (err: Error) => {
      Alert.alert("Deposit failed", err.message);
    },
  });

  return (
    <Screen title="Deposit" subtitle="Add money to your savings wallet">
      <Card>
        <Input
          label="Amount (GHS)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <Input
          label="MoMo number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+233..."
        />

        <Text style={styles.label}>Payment method</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => (
            <Button
              key={m.id}
              title={m.label}
              variant={method === m.id ? "primary" : "outline"}
              onPress={() => setMethod(m.id)}
              style={styles.methodBtn}
            />
          ))}
        </View>

        <Button
          title="Continue to payment"
          loading={mutation.isPending}
          onPress={() => mutation.mutate()}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  methods: {
    gap: 8,
  },
  methodBtn: {
    width: "100%",
  },
});
