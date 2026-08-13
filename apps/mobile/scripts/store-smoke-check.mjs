/**
 * Pre-store smoke checklist for SusuFlow mobile (EAS production).
 * Run: node scripts/store-smoke-check.mjs
 * Exit 0 = config gate passed; still run a real device smoke after EAS build.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function readJson(rel) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    fail(`Missing ${rel}`);
    return null;
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function mustExist(rel) {
  if (!existsSync(join(root, rel))) fail(`Missing file: ${rel}`);
}

const appJson = readJson("app.json");
const easJson = readJson("eas.json");
const pkg = readJson("package.json");

mustExist("src/lib/store-readiness.ts");
mustExist("src/lib/analytics.ts");
mustExist("src/lib/monitoring.ts");
mustExist("app/support/ticket.tsx");
mustExist("app/support/tickets.tsx");
mustExist(".env.example");

if (appJson) {
  const androidPerms = appJson.expo?.android?.permissions ?? [];
  if (androidPerms.includes("RECORD_AUDIO") || androidPerms.includes("android.permission.RECORD_AUDIO")) {
    fail("Android still requests RECORD_AUDIO — remove before store submit");
  }
  if (appJson.expo?.userInterfaceStyle !== "dark") {
    fail('app.json userInterfaceStyle should be "dark" for banking chrome');
  }
  const plugins = appJson.expo?.plugins ?? [];
  const hasSentry = plugins.some(
    (p) =>
      p === "@sentry/react-native/expo" ||
      (Array.isArray(p) && p[0] === "@sentry/react-native/expo"),
  );
  if (!hasSentry) fail("Sentry Expo plugin missing from app.json");
}

if (easJson?.build) {
  for (const profile of ["production", "preview"]) {
    const env = easJson.build[profile]?.env ?? {};
    for (const key of [
      "EXPO_PUBLIC_API_URL",
      "EXPO_PUBLIC_WEB_URL",
      "EXPO_PUBLIC_SUPPORT_EMAIL",
      "EXPO_PUBLIC_SUPPORT_PHONE",
      "EXPO_PUBLIC_SUPPORT_WHATSAPP",
    ]) {
      if (!env[key]) fail(`eas.json build.${profile}.env missing ${key}`);
    }
    if (!env.EXPO_PUBLIC_SENTRY_DSN && !easJson.build[profile]?.env?.EXPO_PUBLIC_SENTRY_DSN) {
      // DSN may be EAS secret only — warn-style but gate soft
      console.warn(
        `[warn] ${profile}: EXPO_PUBLIC_SENTRY_DSN not in eas.json — ensure EAS secret is set`,
      );
    }
  }
}

if (pkg && !pkg.scripts?.["build:production"]) {
  fail("package.json missing build:production script");
}

console.log("\nSusuFlow store smoke (config gate)\n");
if (failures.length) {
  for (const f of failures) console.error(" ✗", f);
  console.error(`\n${failures.length} issue(s). Fix before public store.\n`);
  console.log(
    "Still required after green: EAS production build + physical device smoke (deposit, withdraw double-tap, Face ID, offline CTA, ticket, push).\n",
  );
  process.exit(1);
}

console.log(" ✓ Config files and store gates look ready");
console.log(
  " → Next: eas build --profile production, then device smoke (see docs/23-MOBILE_CUSTOMER_APP_AND_STORE_READINESS.md)\n",
);
process.exit(0);
