#!/usr/bin/env node
/**
 * Restore class names, imports, and identifiers broken by remove-copy-dashes.
 * Keeps intended copy changes (em dashes → periods, hyphenated prose → spaces).
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

const REPLACEMENTS = [
  ["@fortawesome/react fontawesome", "@fortawesome/react-fontawesome"],
  ["@fortawesome/fontawesome svg core", "@fortawesome/fontawesome-svg-core"],
  ["@fortawesome/free solid svg icons", "@fortawesome/free-solid-svg-icons"],
  ["gideondadey@gmail. Com", "gideondadey@gmail.com"],
  ["max width:", "max-width:"],
  ["! Text-", "!text-"],
  ["! Leading-", "!leading-"],
  ["sm:! Text-", "sm:!text-"],
  ["lg:! Text-", "lg:!text-"],
  ["xl:! Text-", "xl:!text-"],
  ["pointer events none", "pointer-events-none"],
  ["focus:not sr only", "focus:not-sr-only"],
  ["sr only", "sr-only"],
  ["select none", "select-none"],
  ["transform gpu", "transform-gpu"],
  ["transition colors", "transition-colors"],
  ["transition all", "transition-all"],
  ["transition transform", "transition-transform"],
  ["ease out", "ease-out"],
  ["marketing canvas", "marketing-canvas"],
  ["afrusan hero title", "afrusan-hero-title"],
  ["afrusan section title", "afrusan-section-title"],
  ["afrusan cta pill", "afrusan-cta-pill"],
  ["afrusan body", "afrusan-body"],
  ["ofx btn outline", "ofx-btn-outline"],
  ["ofx btn dark", "ofx-btn-dark"],
  ["ofx btn", "ofx-btn"],
  ["font geist", "font-geist"],
  ["font semibold", "font-semibold"],
  ["font medium", "font-medium"],
  ["font bold", "font-bold"],
  ["leading relaxed", "leading-relaxed"],
  ["leading snug", "leading-snug"],
  ["leading none", "leading-none"],
  ["tracking tight", "tracking-tight"],
  ["text pretty", "text-pretty"],
  ["text balance", "text-balance"],
  ["text left", "text-left"],
  ["text right", "text-right"],
  ["text center", "text-center"],
  ["text base", "text-base"],
  ["text sm", "text-sm"],
  ["text white", "text-white"],
  ["text foreground", "text-foreground"],
  ["text muted", "text-muted"],
  ["dark:text white", "dark:text-white"],
  ["dark:text slate-", "dark:text-slate-"],
  ["text slate-", "text-slate-"],
  ["bg white", "bg-white"],
  ["bg current", "bg-current"],
  ["bg primary", "bg-primary"],
  ["bg background", "bg-background"],
  ["hover:bg primary", "hover:bg-primary"],
  ["dark:bg slate-", "dark:bg-slate-"],
  ["border collapse", "border-collapse"],
  ["border border border", "border border-border"],
  ["border t ", "border-t "],
  ["divide y ", "divide-y "],
  ["space y-", "space-y-"],
  ["items center", "items-center"],
  ["justify center", "justify-center"],
  ["justify between", "justify-between"],
  ["justify self end", "justify-self-end"],
  ["lg:justify self-end", "lg:justify-self-end"],
  ["object cover", "object-cover"],
  ["object contain", "object-contain"],
  ["object center", "object-center"],
  ["overflow hidden", "overflow-hidden"],
  ["overflow x-hidden", "overflow-x-hidden"],
  ["min h-screen", "min-h-screen"],
  ["min h-[", "min-h-["],
  ["min w-0", "min-w-0"],
  ["min w-[", "min-w-["],
  ["max w-none", "max-w-none"],
  ["max w-[", "max-w-["],
  ["max w-", "max-w-"],
  ["lg:max w-", "lg:max-w-"],
  ["xl:max w-", "xl:max-w-"],
  ["sm:min w-", "sm:min-w-"],
  ["lg:order none", "lg:order-none"],
  ["lg:order none", "lg:order-none"],
  ["w full", "w-full"],
  ["h full", "h-full"],
  ["w auto", "w-auto"],
  ["h auto", "h-auto"],
  ["sm:w auto", "sm:w-auto"],
  ["flex col", "flex-col"],
  ["flex wrap", "flex-wrap"],
  ["scroll mt-", "scroll-mt-"],
  ["group hover:-translate y-", "group-hover:-translate-y-"],
  ["group hover:translate x-", "group-hover:translate-x-"],
  ["group hover:scale", "group-hover:scale"],
  ["group open:", "group-open:"],
  ["-translate y-[", "-translate-y-["],
  ["translate y-[", "translate-y-["],
  ["translate x-", "translate-x-"],
  ["afrusan warm section", "afrusan-warm-section"],
  ["afrusan section", "afrusan-section"],
  ["afrusan eyebrow", "afrusan-eyebrow"],
  ["marketing band height", "marketing-band-height"],
  ["marketing container", "marketing-container"],
  ["sr container", "sr-container"],
  ["hero title", "hero-title"],
  ["cubic bezier", "cubic-bezier"],
  ["text-muted foreground", "text-muted-foreground"],
  ["inline flex", "inline-flex"],
  ["align bottom", "align-bottom"],
  ["self end", "self-end"],
  ["text xs", "text-xs"],
  ["lg:col span-", "lg:col-span-"],
  ["sm:col span-", "sm:col-span-"],
  ["col span-", "col-span-"],
  ["border b border border/", "border-b border-border/"],
  ["safe area inset top", "safe-area-inset-top"],
  ["inset x-0", "inset-x-0"],
  ["size full", "size-full"],
  ["mx auto", "mx-auto"],
  ["underline offset-", "underline-offset-"],
  ["animate fade in", "animate-fade-in"],
  ["sm:grid cols-", "sm:grid-cols-"],
  ["lg:grid cols-", "lg:grid-cols-"],
  ["grid cols-", "grid-cols-"],
  ["aspect [", "aspect-["],
  [". Href", ".href"],
  [". Title", ".title"],
  [". Id", ".id"],
  [". Period", ".period"],
  [". Pct", ".pct"],
];

function restoreCssVars(source) {
  return source
    .replace(/--ofx cream deep/g, "--ofx-cream-deep")
    .replace(/--ofx cream/g, "--ofx-cream")
    .replace(/--ofx paper/g, "--ofx-paper")
    .replace(/--ofx flame/g, "--ofx-flame")
    .replace(/--ofx ink/g, "--ofx-ink")
    .replace(/--ofx sage/g, "--ofx-sage")
    .replace(/--ofx sand/g, "--ofx-sand")
    .replace(/--ofx sky/g, "--ofx-sky")
    .replace(/--ofx lilac/g, "--ofx-lilac");
}

function repair(source) {
  let next = restoreCssVars(source);
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  return next;
}

const files = [...SOURCE_DIRS.flatMap((dir) => walk(dir)), ...EXTRA_FILES];

let changed = 0;
for (const file of files) {
  const original = readFileSync(file, "utf8");
  const next = repair(original);
  if (next !== original) {
    writeFileSync(file, next, "utf8");
    changed += 1;
    console.log("repaired", relative(join(__dirname, ".."), file));
  }
}

console.log(`\nDone. ${changed} file(s) repaired.`);
