import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

const REPLACEMENTS = [
  // 1. Hardcoded bright white/light borders on cards & containers
  { from: /\bborder-slate-200\/90\b/g, to: 'border-border/60' },
  { from: /\bborder-slate-200\/80\b/g, to: 'border-border/60' },
  { from: /\bborder-slate-200\/70\b/g, to: 'border-border/60' },
  { from: /\bborder-slate-200\/60\b/g, to: 'border-border/60' },
  { from: /\bborder-slate-200\b/g, to: 'border-border/60' },
  { from: /\bborder-slate-300\b/g, to: 'border-border/60' },
  { from: /\bborder-gray-200\b/g, to: 'border-border/60' },
  { from: /\bborder-gray-300\b/g, to: 'border-border/60' },

  // 2. Hardcoded dark background colors
  { from: /\bdark:bg-zinc-950\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-zinc-900\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-zinc-850\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-zinc-800\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-gray-950\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-gray-900\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-gray-800\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-gray-700\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-slate-950\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-slate-900\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-slate-800\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-\[#09090b\]\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-\[#18181b\]\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-\[#141417\]\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-\[#1e293b\]\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:bg-\[#1a365d\]\/?[0-9]*\b/g, to: '' },

  // 3. Hardcoded dark border colors
  { from: /\bdark:border-zinc-[0-9]+\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:border-slate-[0-9]+\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:border-gray-[0-9]+\/?[0-9]*\b/g, to: '' },
  { from: /\bdark:border-white\/10\b/g, to: '' },
  { from: /\bdark:border-white\/20\b/g, to: '' },
  { from: /\bdark:border-white\/40\b/g, to: '' },

  // 4. Text color adjustments
  { from: /\bdark:text-white\b/g, to: 'text-foreground' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const { from, to } of REPLACEMENTS) {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      }

      if (modified) {
        content = content.replace(/className=(["']) +/g, 'className=$1');
        content = content.replace(/ +(["'])/g, '$1');
        content = content.replace(/  +/g, ' ');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${path.relative(srcDir, fullPath)}`);
      }
    }
  }
}

console.log('Purging white outlines & legacy borders across web/src...');
processDirectory(srcDir);
console.log('Finished purging legacy borders.');
