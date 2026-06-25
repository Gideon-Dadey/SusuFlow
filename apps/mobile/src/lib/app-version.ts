import Constants from "expo-constants";

export const appVersion =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "1.0.0";
