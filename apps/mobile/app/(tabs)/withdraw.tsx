import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { withdrawalApi } from "@/lib/api";
import { colors, typography } from "@/theme/tokens";

const METHODS = [
  { id: "mtn_momo", label: "MTN MoMo" },
  { id: "telecel_cash", label: "Telecel Cash" },
];

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = parseFloat(amount);
      if (!parsed || parsed <= 0) throw new Error("Enter a valid amount");
      if (!phone.trim()) throw new Error("Enter your MoMo number");

      return withdrawalApi.requestWithdrawal({
        amount: parsed,
        disbursementMethod: method,
        disbursementPhone: phone,
      });
    },
    onSuccess: () => {
      Alert.alert(
        "Withdrawal requested",
        "Your request has been submitted for approval.",
      );
      setAmount("");
    },
    onError: (err: Error) => {
      Alert.alert("Withdrawal failed", err.message);
    },
  });

  return (
    <Screen title="Withdraw" subtitle="Request a payout to your mobile money">
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

        <Text style={styles.label}>Disbursement method</Text>
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
          title="Request withdrawal"
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
