import { Redirect } from "expo-router";

/** Legacy route — Activity is the canonical transaction history surface. */
export default function TransactionsRedirect() {
  return <Redirect href="/(tabs)/activity" />;
}
