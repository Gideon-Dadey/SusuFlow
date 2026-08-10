/**
 * Strip border-radius utility classes from button-like elements in the web app.
 *
 * Usage:
 *   node scripts/strip-button-radius.js           # apply changes
 *   node scripts/strip-button-radius.js --dry-run # preview only
 *
 * Targets:
 *   - <Button> and <button> JSX tags (multiline-safe)
 *   - <Link> and <a> tags whose className looks like a CTA/button
 *   - CSS rules for button, .btn*, and portal button tokens
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const TARGET_DIR = path.join(ROOT_DIR, "apps", "web", "src");
const DRY_RUN = process.argv.includes("--dry-run");

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
]);

const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

const ROUNDED_CLASS_RE = /\brounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g;

const BUTTON_LIKE_CLASS_RE =
  /\b(btn[-_]|bg-primary|bg-foreground|bg-secondary|h-1[0-2]\b|w-full.*py-|py-3|py-3\.5|type=.submit|afrusan-cta)/i;

const JSX_BUTTON_TAGS = new Set(["Button", "button"]);
const JSX_LINK_TAGS = new Set(["Link", "a"]);

let filesChecked = 0;
let filesModified = 0;
let totalStripped = 0;

function cleanClassList(classes) {
  const before = classes;
  const after = classes
    .replace(ROUNDED_CLASS_RE, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
  const stripped = (before.match(ROUNDED_CLASS_RE) || []).length;
  return { value: after, stripped };
}

function cleanQuotedStringsInExpression(expr) {
  let stripped = 0;
  const updated = expr.replace(
    /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
    (match, quote, inner) => {
      const { value, stripped: count } = cleanClassList(inner);
      stripped += count;
      return `${quote}${value}${quote}`;
    },
  );
  return { value: updated, stripped };
}

function cleanClassNamesInTag(tagStr) {
  let stripped = 0;
  let result = tagStr;

  result = result.replace(
    /className=(["'])([\s\S]*?)\1/g,
    (match, quote, classes) => {
      const { value, stripped: count } = cleanClassList(classes);
      stripped += count;
      return `className=${quote}${value}${quote}`;
    },
  );

  result = result.replace(/className=\{`([\s\S]*?)`\}/g, (match, classes) => {
    const { value, stripped: count } = cleanClassList(classes);
    stripped += count;
    return `className={\`${value}\`}`;
  });

  result = result.replace(/className=\{cn\(([\s\S]*?)\)\}/g, (match, args) => {
    const { value, stripped: count } = cleanQuotedStringsInExpression(args);
    stripped += count;
    return `className={cn(${value})}`;
  });

  result = result.replace(
    /className=\{("|')([\s\S]*?)\1\}/g,
    (match, quote, classes) => {
      const { value, stripped: count } = cleanClassList(classes);
      stripped += count;
      return `className={${quote}${value}${quote}}`;
    },
  );

  return { value: result, stripped };
}

function findTagEnd(source, startIndex) {
  let i = startIndex;
  let braceDepth = 0;
  let inQuote = null;

  while (i < source.length) {
    const char = source[i];
    const prev = source[i - 1];

    if (inQuote) {
      if (char === inQuote && prev !== "\\") {
        inQuote = null;
      }
      i += 1;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      inQuote = char;
      i += 1;
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
      i += 1;
      continue;
    }

    if (char === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      i += 1;
      continue;
    }

    if (char === ">" && braceDepth === 0) {
      return i + 1;
    }

    i += 1;
  }

  return source.length;
}

function tagLooksLikeButton(tagName, tagContent) {
  if (JSX_BUTTON_TAGS.has(tagName)) {
    return true;
  }

  if (!JSX_LINK_TAGS.has(tagName)) {
    return false;
  }

  return BUTTON_LIKE_CLASS_RE.test(tagContent);
}

function stripRoundedInJsxTags(source) {
  let result = "";
  let stripped = 0;
  let i = 0;

  while (i < source.length) {
    const slice = source.slice(i);
    const openMatch = slice.match(/^<([A-Za-z][\w.-]*)\b/);

    if (!openMatch) {
      result += source[i];
      i += 1;
      continue;
    }

    const tagName = openMatch[1];
    const openLen = openMatch[0].length;
    const tagStart = i;
    const attrsStart = i + openLen;
    const tagEnd = findTagEnd(source, attrsStart);
    const fullTag = source.slice(tagStart, tagEnd);
    const attrs = source.slice(attrsStart, tagEnd - 1);

    if (tagLooksLikeButton(tagName, attrs)) {
      const { value, stripped: count } = cleanClassNamesInTag(fullTag);
      result += value;
      stripped += count;
    } else {
      result += fullTag;
    }

    i = tagEnd;
  }

  return { value: result, stripped };
}

function stripRoundedInCss(source) {
  let stripped = 0;
  const value = source.replace(
    /([^{}]+)\{([^}]*)\}/g,
    (match, selectors, body) => {
      const selectorText = selectors.trim();
      const isButtonRule =
        /\bbutton\b/.test(selectorText) ||
        /\.btn[\w-]*/.test(selectorText) ||
        /\.afrusan-cta-pill\b/.test(selectorText) ||
        /\.omnih-btn/.test(selectorText) ||
        /\[type=['"]?(?:button|submit|reset)['"]?\]/.test(selectorText);

      if (!isButtonRule || !ROUNDED_CLASS_RE.test(body)) {
        return match;
      }

      const matches = body.match(ROUNDED_CLASS_RE) || [];
      stripped += matches.length;

      const cleanedBody = body
        .replace(ROUNDED_CLASS_RE, "")
        .replace(/@apply\s+/g, (m) => m)
        .replace(/\s{2,}/g, " ")
        .replace(/;\s*;/g, ";");

      return `${selectors}{${cleanedBody}}`;
    },
  );

  return { value, stripped };
}

function stripRoundedInExportConsts(source) {
  let stripped = 0;
  const buttonConstRe = /export const (?:authSubmitClassName|HC|SocialButton)/;

  if (!buttonConstRe.test(source)) {
    return { value: source, stripped: 0 };
  }

  const value = source.replace(
    /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
    (match, quote, inner) => {
      if (!ROUNDED_CLASS_RE.test(inner)) {
        return match;
      }
      const isButtonish =
        /btn|submit|Button|button|authSubmit|btnPrimary|btnSecondary|btnDanger|SocialButton/i.test(
          inner,
        ) || /py-3|bg-primary-600|bg-slate-900/.test(inner);

      if (!isButtonish) {
        return match;
      }

      const { value: cleaned, stripped: count } = cleanClassList(inner);
      stripped += count;
      return `${quote}${cleaned}${quote}`;
    },
  );

  return { value, stripped };
}

function processFileContent(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let stripped = 0;
  let value = content;

  if (ext === ".css") {
    const cssResult = stripRoundedInCss(value);
    value = cssResult.value;
    stripped += cssResult.stripped;
  } else {
    const jsxResult = stripRoundedInJsxTags(value);
    value = jsxResult.value;
    stripped += jsxResult.stripped;

    const constResult = stripRoundedInExportConsts(value);
    value = constResult.value;
    stripped += constResult.stripped;
  }

  return { value, stripped, changed: value !== content };
}

function shouldProcessFile(filePath) {
  return ALLOWED_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        scanDirectory(fullPath);
      }
      continue;
    }

    if (!entry.isFile() || !shouldProcessFile(fullPath)) {
      continue;
    }

    filesChecked += 1;
    const original = fs.readFileSync(fullPath, "utf8");
    const { value, stripped, changed } = processFileContent(original, fullPath);

    if (!changed) {
      continue;
    }

    filesModified += 1;
    totalStripped += stripped;
    const rel = path.relative(ROOT_DIR, fullPath);
    console.log(
      `[${DRY_RUN ? "DRY-RUN" : "UPDATED"}] ${rel} (~${stripped} rounded class(es) removed)`,
    );

    if (!DRY_RUN) {
      fs.writeFileSync(fullPath, value, "utf8");
    }
  }
}

function main() {
  console.log("====================================================");
  console.log("  Strip border-radius from buttons");
  console.log(`  Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}`);
  console.log("====================================================\n");

  scanDirectory(TARGET_DIR);

  console.log("\n====================================================");
  console.log("  Summary");
  console.log("====================================================");
  console.log(`Files checked : ${filesChecked}`);
  console.log(`Files updated : ${filesModified}`);
  console.log(`Classes stripped (approx): ${totalStripped}`);
  console.log("====================================================\n");

  if (DRY_RUN && filesModified > 0) {
    console.log("Re-run without --dry-run to apply changes.\n");
  }
}

main();
