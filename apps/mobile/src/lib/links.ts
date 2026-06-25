import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { legalUrls, openPasswordResetRequest } from "@/lib/config";

export async function openLegalPage(path: "terms" | "privacy") {
  router.push(
    path === "terms" ? "/(tabs)/profile/terms" : "/(tabs)/profile/privacy",
  );
}

export async function openLegalPageInBrowser(path: "terms" | "privacy") {
  const url = path === "terms" ? legalUrls.terms() : legalUrls.privacy();
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      enableBarCollapsing: true,
    });
  } catch {
    await openLegalPage(path);
  }
}

export async function openPasswordReset(email?: string) {
  await Linking.openURL(openPasswordResetRequest(email));
}
