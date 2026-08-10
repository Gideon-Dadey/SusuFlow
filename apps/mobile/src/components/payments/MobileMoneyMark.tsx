import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import { bankChrome } from "@/theme/bankChrome";

export type MobileMoneyMethodId = "mtn_momo" | "telecel_cash" | "airteltigo";

export type PaymentMethodMarkId = MobileMoneyMethodId | "bank_transfer";

/** Shared MoMo options for deposit + withdraw pickers. */
export const MOBILE_MONEY_METHODS: {
  id: MobileMoneyMethodId;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "mtn_momo",
    label: "MTN MoMo",
    subtitle: "Approve on your MTN wallet",
  },
  {
    id: "telecel_cash",
    label: "Telecel Cash",
    subtitle: "Approve on Telecel Cash",
  },
  {
    id: "airteltigo",
    label: "AirtelTigo Money",
    subtitle: "Approve on AirtelTigo Money",
  },
];

const MARKS: Record<PaymentMethodMarkId, ImageSourcePropType> = {
  mtn_momo: require("../../../assets/images/payments/mtn.png"),
  telecel_cash: require("../../../assets/images/payments/telecel.png"),
  airteltigo: require("../../../assets/images/payments/airteltigo.png"),
  bank_transfer: require("../../../assets/images/payments/bank.png"),
};

export function isMobileMoneyMethodId(id: string): id is MobileMoneyMethodId {
  return id === "mtn_momo" || id === "telecel_cash" || id === "airteltigo";
}

export function hasPaymentMethodMark(id: string): id is PaymentMethodMarkId {
  return isMobileMoneyMethodId(id) || id === "bank_transfer";
}

interface PaymentMethodMarkProps {
  methodId: string;
  size?: number;
}

/**
 * Circular provider / bank mark for deposit & withdraw method rows.
 * Default size matches banking wells (42).
 */
export function PaymentMethodMark({
  methodId,
  size = bankChrome.wellSize,
}: PaymentMethodMarkProps) {
  if (!hasPaymentMethodMark(methodId)) return null;
  const source = MARKS[methodId];

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

/** @deprecated Prefer PaymentMethodMark */
export function MobileMoneyMark(props: PaymentMethodMarkProps) {
  return <PaymentMethodMark {...props} />;
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
