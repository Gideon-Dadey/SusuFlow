#!/usr/bin/env node
/**
 * Starts Expo with consistent settings and pre-warms the iOS bundle so
 * Expo Go on a physical iPhone does not time out waiting for Metro.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const PORT = 8083;

const args = process.argv.slice(2);
const useTunnel = args.includes("--tunnel");
const clearCache = args.includes("--clear");

const expoArgs = ["expo", "start", "--port", String(PORT), useTunnel ? "--tunnel" : "--lan"];
if (clearCache) expoArgs.push("--clear");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMetro(port, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/status`);
      if (res.ok) return true;
    } catch {
      // Metro not ready yet.
    }
    await sleep(500);
  }
  return false;
}

async function warmIosBundle(port) {
  const bundleUrl = `http://127.0.0.1:${port}/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&minify=false`;

  process.stdout.write("\nPreparing iOS bundle for Expo Go");
  const ready = await waitForMetro(port);
  if (!ready) {
    process.stdout.write("\nMetro did not become ready in time. Try scanning the QR again once the server finishes starting.\n");
    return;
  }

  const started = Date.now();
  let dots = 0;
  const spinner = setInterval(() => {
    dots = (dots + 1) % 4;
    process.stdout.write(`\rPreparing iOS bundle for Expo Go${".".repeat(dots)}${" ".repeat(3 - dots)}`);
  }, 400);

  try {
    const res = await fetch(bundleUrl);
    clearInterval(spinner);
    if (!res.ok) {
      process.stdout.write(`\nCould not pre-warm bundle (HTTP ${res.status}). Scan the QR once Metro is ready.\n`);
      return;
    }
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    process.stdout.write(`\n iOS bundle ready in ${seconds}s — safe to scan the QR code on your iPhone now.\n`);
    if (!useTunnel) {
      process.stdout.write(
        "If Expo Go still times out, run: pnpm dev:mobile:tunnel\n",
      );
    }
  } catch (error) {
    clearInterval(spinner);
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`\nCould not pre-warm bundle: ${message}\n`);
  }
}

const child = spawn("npx", expoArgs, {
  cwd: projectRoot,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    EXPO_NO_DEPENDENCY_VALIDATION: process.env.EXPO_NO_DEPENDENCY_VALIDATION ?? "1",
  },
});

void warmIosBundle(PORT);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
