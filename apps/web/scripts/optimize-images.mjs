/**
 * Resize and compress marketing assets for fast page loads.
 * Outputs WebP variants only (originals are kept as backups).
 * Run: pnpm --filter @susuflow/web optimize:images
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

/** @type {Array<{ file: string; maxWidth: number; quality?: number }>} */
const TARGETS = [
  { file: 'brand/susuflow-logo.png', maxWidth: 1200, quality: 92 },
  { file: 'brand/logo-transparent.png', maxWidth: 800, quality: 92 },
  { file: 'brand/Logo.png', maxWidth: 800, quality: 92 },
  { file: 'marketing/susuflow-hero-organic.png', maxWidth: 1600, quality: 85 },
  { file: 'marketing/susuflow-home-hero.png', maxWidth: 1920, quality: 92 },
  { file: 'marketing/myhero.jpg', maxWidth: 1600, quality: 82 },
  { file: 'marketing/hero-showcase.png', maxWidth: 1400, quality: 82 },
  { file: 'marketing/susuflow-introduction-organic.png', maxWidth: 1400, quality: 85 },
  { file: 'marketing/susuflow-introduction-organic-transparent.png', maxWidth: 1400, quality: 90 },
  { file: 'marketing/platform-overview.png', maxWidth: 1400, quality: 82 },
  { file: 'marketing/momo-pay-showcase.png', maxWidth: 900, quality: 82 },
  { file: 'marketing/workflow-automation-bg.png', maxWidth: 1400, quality: 82 },
  { file: 'marketing/how-it-works/ghanian-market.png', maxWidth: 1400, quality: 82 },
  { file: 'marketing/how-it-works/digital-collector.png', maxWidth: 1400, quality: 82 },
  { file: 'marketing/pricing/ghanian-office.png', maxWidth: 1400, quality: 82 },
  { file: 'marketing/pricing/erasebg-transformed.png', maxWidth: 1200, quality: 85 },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function toWebpPath(file) {
  const parsed = path.parse(file);
  return path.join(parsed.dir, `${parsed.name}.webp`).replace(/\\/g, '/');
}

async function optimizeOne({ file, maxWidth, quality = 82 }) {
  const inputPath = path.join(publicDir, file);
  const webpRel = toWebpPath(file);
  const webpPath = path.join(publicDir, webpRel);

  let before;
  try {
    before = (await stat(inputPath)).size;
  } catch {
    console.warn(`  skip (missing): ${file}`);
    return null;
  }

  const meta = await sharp(inputPath, { failOn: 'none' }).metadata();

  await mkdir(path.dirname(webpPath), { recursive: true });
  await sharp(inputPath, { failOn: 'none' })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality, effort: 6 })
    .toFile(webpPath);

  const webpSize = (await stat(webpPath)).size;

  return {
    file,
    webp: webpRel,
    before,
    webpSize,
    width: meta.width,
    height: meta.height,
  };
}

async function main() {
  console.log('Optimizing SusuFlow marketing images...\n');
  const results = [];

  for (const target of TARGETS) {
    const result = await optimizeOne(target);
    if (result) results.push(result);
  }

  const contactSource = path.join(publicDir, 'marketing/pricing/erasebg-transformed.webp');
  const contactTarget = path.join(publicDir, 'marketing/pricing/contact-map.webp');
  try {
    await writeFile(contactTarget, await readFile(contactSource));
    console.log('  created marketing/pricing/contact-map.webp');
  } catch {
    console.warn('  could not create contact-map.webp');
  }

  let saved = 0;
  for (const r of results) {
    saved += Math.max(0, r.before - r.webpSize);
    console.log(
      `${r.file} -> ${r.webp}\n  ${r.width}x${r.height} | ${formatBytes(r.before)} -> ${formatBytes(r.webpSize)}`,
    );
  }

  console.log(`\nDone. Estimated savings vs originals: ${formatBytes(saved)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
