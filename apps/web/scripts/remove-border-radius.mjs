#!/usr/bin/env node
/**
 * Remove border-radius from the public website (marketing + auth).
 *
 * - Strips Tailwind `rounded-*` / `pill` classes from marketing and auth source
 * - Forces `border-radius: 0` in marketing CSS
 * - Adds a site-wide override so leftover radius cannot render
 *
 * Run: node scripts/remove-border-radius.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src");
const CSS_FILE = join(SRC, "app", "globals.css");

const SOURCE_DIRS = [
  join(SRC, "components", "marketing"),
  join(SRC, "app", "(marketing)"),
  join(SRC, "components", "auth"),
  join(SRC, "app", "(auth)"),
];

const ROUNDED_CLASS = /(?:^|\s)(?:pill|rounded(?:-[^\s"'`]+)?)/g;

function stripRoundedFromClasses(value) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const cleaned = value
    .replace(ROUNDED_CLASS, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${leading}${cleaned}${trailing}`;
}

function looksLikeClassList(value) {
  return /(?:^|\s)(?:pill|rounded(?:-[^\s"'`]+)?)(?:\s|$)/.test(value) &&
    (/\b(?:flex|grid|block|inline|absolute|relative|sticky|hidden|overflow-|items-|justify-|bg-|text-|border-|px-|py-|pt-|pb-|w-|h-|gap-|p-|m-|sm:|md:|lg:|xl:|aspect-|object-|shadow-|ring-|z-|top-|left-|right-|bottom-|min-|max-|size-|cursor-|transition|hover:|focus:|ofx-|omnih-|sr-only)\b/.test(
      value,
    ) ||
      /^(?:\s*(?:pill|rounded(?:-[^\s"'`]+)?)\s*)+$/.test(value));
}

function stripRoundedClasses(source) {
  return source.replace(
    /([`'"])((?:\\.|[^\\])*?)\1/g,
    (full, quote, inner) => {
      if (!looksLikeClassList(inner)) return full;
      if (/^https?:\/\//.test(inner.trim()) || inner.includes("border-radius")) {
        return full;
      }
      const cleaned = stripRoundedFromClasses(inner);
      if (cleaned === inner) return full;
      return `${quote}${cleaned}${quote}`;
    },
  );
}

const OVERRIDE_MARK = "/* remove-border-radius: public site */";
const OVERRIDE_BLOCK = `${OVERRIDE_MARK}
.marketing-canvas,
.marketing-canvas *,
.marketing-canvas *::before,
.marketing-canvas *::after,
.auth-ofx,
.auth-ofx *,
.auth-ofx *::before,
.auth-ofx *::after {
 border-radius: 0 !important;
}
`;

function walk(dir, files = []) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules") continue;
      walk(path, files);
    } else if (/\.(tsx|ts|css)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

function stripCssRadius(source) {
  return source
    .replace(/border-radius\s*:\s*[^;]+;/g, "border-radius: 0;")
    .replace(/border-radius\s*:\s*[^;}]+([;}])/g, "border-radius: 0$1");
}

let changed = 0;

for (const dir of SOURCE_DIRS) {
  for (const file of walk(dir)) {
    const original = readFileSync(file, "utf8");
    let next = original;
    if (file.endsWith(".css")) {
      next = stripCssRadius(next);
    } else {
      next = stripRoundedClasses(next);
    }
    if (next !== original) {
      writeFileSync(file, next, "utf8");
      changed += 1;
      console.log("updated", relative(join(__dirname, ".."), file));
    }
  }
}

let css = readFileSync(CSS_FILE, "utf8");
css = css.replace(
  /\.marketing-nav-pill\s*\{[\s\S]*?border-radius:\s*[^;]+;/g,
  (block) => block.replace(/border-radius:\s*[^;]+;/, "border-radius: 0;"),
);
css = css.replace(
  /\.pill\s*\{[\s\S]*?border-radius:\s*[^;]+ !important;/g,
  (block) =>
    block.replace(/border-radius:\s*[^;]+ !important;/, "border-radius: 0 !important;"),
);
css = css.replace(
  /\.ofx-btn\s*\{[\s\S]*?border-radius:\s*[^;]+ !important;/g,
  (block) =>
    block.replace(/border-radius:\s*[^;]+ !important;/, "border-radius: 0 !important;"),
);

if (css.includes(OVERRIDE_MARK)) {
  css = css.replace(
    new RegExp(`${OVERRIDE_MARK.replace(/[/*]/g, "\\$&")}[\\s\\S]*?\\}\\s*`, "m"),
    `${OVERRIDE_BLOCK}\n`,
  );
} else {
  css += `\n${OVERRIDE_BLOCK}`;
}

writeFileSync(CSS_FILE, css, "utf8");
console.log("updated", relative(join(__dirname, ".."), CSS_FILE));
console.log(`\nDone. ${changed} source file(s) updated, CSS override applied.`);
