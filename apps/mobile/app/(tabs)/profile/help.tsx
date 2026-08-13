import { Redirect } from "expo-router";
import type { Href } from "expo-router";

/** Help lives in the dedicated support hub. */
export default function HelpSettingsScreen() {
  return <Redirect href={"/support" as Href} />;
}
