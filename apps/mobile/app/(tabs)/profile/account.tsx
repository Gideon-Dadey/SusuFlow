import { Redirect } from "expo-router";

/** Legacy tab route — canonical screen lives under /my-profile. */
export default function AccountRedirect() {
  return <Redirect href="/my-profile/account" />;
}
