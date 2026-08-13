import { Redirect } from "expo-router";

/** KYC lives under My Profile so it never traps the More tab stack. */
export default function ProfileKycRedirect() {
  return <Redirect href="/my-profile/kyc" />;
}
