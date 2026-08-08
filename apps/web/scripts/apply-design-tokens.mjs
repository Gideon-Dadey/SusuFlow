#!/usr/bin/env node
// Applies SusuFlow design-system token replacements across src tsx and css files.
// Run: node scripts/apply-design-tokens.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "src");

const REPLACEMENTS = [
  [/bg-\[#0066cc\]\s+hover:bg-\[#0052a3\]/g, "bg-primary hover:bg-primary/90"],
  [/bg-\[#0066cc\]/g, "bg-primary"],
  [/hover:bg-\[#0052a3\]/g, "hover:bg-primary/90"],
  [/text-\[#0066cc\]/g, "text-foreground"],
  [/hover:text-\[#0052a3\]/g, "hover:text-foreground/80"],
  [/hover:text-\[#0066cc\]/g, "hover:text-foreground/80"],
  [/dark:hover:text-\[#38bdf8\]/g, "dark:hover:text-foreground"],
  [/dark:text-blue-400/g, "dark:text-foreground"],
  [/from-\[#0066cc\]/g, "from-primary"],
  [/rgba\(0,102,204/g, "rgba(1,5,23"],
  [/text-\[17px\]/g, "text-base"],
  [/sm:text-\[17px\]/g, "sm:text-base"],
  [/text-\[15px\]/g, "text-sm"],
  [/--primary-300: #153e90;/, "--primary-300: #828282;"],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules") continue;
      walk(path, files);
    } else if (/\.(tsx|css)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const original = readFileSync(file, "utf8");
  let next = original;
  for (const [pattern, replacement] of REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  if (next !== original) {
    writeFileSync(file, next, "utf8");
    changed += 1;
    console.log("updated", relative(join(__dirname, ".."), file));
  }
}

console.log(`\nDone. ${changed} file(s) updated.`);
