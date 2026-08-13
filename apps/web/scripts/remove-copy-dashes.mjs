#!/usr/bin/env node
/**
 * Remove dashes and hyphens from public-site copy (marketing pages + data).
 *
 * - Em dashes (—) and en dashes (–) become a period
 * - " - " separators become a period
 * - Hyphenated words in prose become spaced words (role-based → role based)
 * - Skips class names, hrefs, imports, CSS, URLs, emails, and template code
 *
 * Run: node scripts/remove-copy-dashes.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src");

const SOURCE_DIRS = [
  join(SRC, "components", "marketing"),
  join(SRC, "app", "(marketing)"),
];

const EXTRA_FILES = [join(SRC, "lib", "marketing-data.ts")];

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
    } else if (/\.(tsx|ts)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

function isCodeish(value) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length <= 2 && /^[—–-]+$/.test(trimmed)) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.includes("${")) return true;
  if (trimmed.includes("@") && !trimmed.includes(" ")) return true;
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return true;
  }
  if (
    trimmed.startsWith("@/") ||
    trimmed.startsWith("@fortawesome") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return true;
  }
  if (/var\(--/.test(trimmed) || /max-width:/.test(trimmed)) return true;
  if (
    /(?:^|\s)(?:bg-|text-|border-|rounded-|px-|py-|pt-|pb-|pl-|pr-|m[trblxy]?-|w-|h-|min-|max-|gap-|flex|grid|absolute|relative|sticky|hidden|overflow-|items-|justify-|sm:|md:|lg:|xl:|2xl:|hover:|dark:|focus:|ofx-|omnih-|afrusan-|sr-only|object-|leading-|tracking-|font-)/.test(
      trimmed,
    )
  ) {
    return true;
  }
  if (!trimmed.includes(" ") && /^[a-zA-Z0-9./_?#&=%-]+$/.test(trimmed)) {
    return true;
  }
  return false;
}

function stripDashes(value) {
  if (isCodeish(value)) return value;

  let out = value;

  if (/^[—–-]+$/.test(out.trim())) {
    return "n/a";
  }

  out = out.replace(/(\d)[—–-](\d)/g, "$1 to $2");
  out = out.replace(/\s*[—–]\s*/g, ". ");
  out = out.replace(/\s+-\s+/g, ". ");
  out = out.replace(/(\p{L})-(\p{L})/gu, "$1 $2");
  out = out.replace(/\.\s*\./g, ".");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/\s+\./g, ".");

  return out;
}

function rewriteStrings(source) {
  return source.replace(
    /(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
    (quoted) => {
      const quote = quoted[0];
      const inner = quoted.slice(1, -1);
      const next = stripDashes(inner);
      if (next === inner) return quoted;
      return `${quote}${next}${quote}`;
    },
  );
}

function rewriteJsxText(source) {
  return source.replace(/>([^<{]+)</g, (full, text) => {
    if (!/[—–-]/.test(text)) return full;
    const next = stripDashes(text);
    if (next === text) return full;
    return `>${next}<`;
  });
}

const files = [
  ...SOURCE_DIRS.flatMap((dir) => walk(dir)),
  ...EXTRA_FILES,
];

let changed = 0;
for (const file of files) {
  const original = readFileSync(file, "utf8");
  let next = rewriteStrings(original);
  next = rewriteJsxText(next);
  if (next !== original) {
    writeFileSync(file, next, "utf8");
    changed += 1;
    console.log("updated", relative(join(__dirname, ".."), file));
  }
}

console.log(`\nDone. ${changed} file(s) updated.`);
