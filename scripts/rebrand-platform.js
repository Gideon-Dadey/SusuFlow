/**
 * Rebrand Platform Utility Script for SusuFlow
 *
 * Usage:
 *   node scripts/rebrand-platform.js
 *   node scripts/rebrand-platform.js --target=SusuFlow
 *
 * Automatically sweeps codebase files to replace legacy brand terms
 * with SusuFlow branding across source code, components, and metadata.
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

const TARGET_DIRECTORIES = [
  path.join(ROOT_DIR, "apps"),
  path.join(ROOT_DIR, "packages"),
  path.join(ROOT_DIR, "docs"),
];

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  ".turbo",
  "public",
  "artifacts",
  "scratch",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".html",
  ".yml",
  ".yaml",
]);

const REPLACEMENT_RULES = [
  { pattern: /Adipa Microfinance/g, replacement: "SusuFlow" },
  { pattern: /adipa microfinance/gi, replacement: "SusuFlow" },
  {
    pattern: /admin@adipamicrofinance\.com/gi,
    replacement: "support@susuflow.com",
  },
  { pattern: /adipamicrofinance\.com/gi, replacement: "susuflow.com" },
  { pattern: /\bCredo\b/g, replacement: "SusuFlow" },
  { pattern: /\bcredo\b/g, replacement: "susuflow" },
  { pattern: /\bCREDO\b/g, replacement: "SUSUFLOW" },
];

let totalFilesChecked = 0;
let totalFilesModified = 0;
let totalReplacementsCount = 0;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

function processFile(filePath) {
  totalFilesChecked++;
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;
  let fileReplacements = 0;

  for (const rule of REPLACEMENT_RULES) {
    const matches = content.match(rule.pattern);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(rule.pattern, rule.replacement);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    totalFilesModified++;
    totalReplacementsCount += fileReplacements;
    const relPath = path.relative(ROOT_DIR, filePath);
    console.log(`[REBRANDED] ${relPath} (${fileReplacements} replacements)`);
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  }
}

function main() {
  console.log("====================================================");
  console.log("  SusuFlow Rebranding Utility Sweep");
  console.log("====================================================\n");

  for (const dir of TARGET_DIRECTORIES) {
    console.log(`Scanning directory: ${path.relative(ROOT_DIR, dir)}...`);
    scanDirectory(dir);
  }

  console.log("\n====================================================");
  console.log("  Rebranding Summary");
  console.log("====================================================");
  console.log(`Total Files Checked : ${totalFilesChecked}`);
  console.log(`Total Files Updated : ${totalFilesModified}`);
  console.log(`Total Replacements  : ${totalReplacementsCount}`);
  console.log("====================================================\n");
}

main();
