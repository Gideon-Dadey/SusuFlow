import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const webPublic = path.resolve('apps/web/public');
const webSrcApp = path.resolve('apps/web/src/app');
const mobileAssets = path.resolve('apps/mobile/assets/images');
const svgPath = path.resolve('apps/web/public/brand/logo-mark.svg');

const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating brand logo assets & favicons from vector SVG...');

  // 1. brand/logo-transparent.webp & png (512x512)
  await sharp(svgBuffer).resize(512, 512).toFile(path.join(webPublic, 'brand/logo-transparent.webp'));
  await sharp(svgBuffer).resize(512, 512).toFile(path.join(webPublic, 'brand/logo-transparent.png'));
  await sharp(svgBuffer).resize(512, 512).toFile(path.join(webPublic, 'brand/Logo.webp'));
  await sharp(svgBuffer).resize(512, 512).toFile(path.join(webPublic, 'brand/Logo.png'));

  // 2. icons/ (PWA & favicons)
  await sharp(svgBuffer).resize(512, 512).toFile(path.join(webPublic, 'icons/icon-512.png'));
  await sharp(svgBuffer).resize(192, 192).toFile(path.join(webPublic, 'icons/icon-192.png'));
  await sharp(svgBuffer).resize(32, 32).toFile(path.join(webPublic, 'icons/icon-32.png'));
  await sharp(svgBuffer).resize(180, 180).toFile(path.join(webPublic, 'icons/apple-touch-icon.png'));

  // 3. Root apple-touch-icon.png & favicon.svg
  await sharp(svgBuffer).resize(180, 180).toFile(path.join(webPublic, 'apple-touch-icon.png'));
  fs.copyFileSync(svgPath, path.join(webPublic, 'favicon.svg'));

  // 4. App icons (src/app/icon.png & apple-icon.png)
  await sharp(svgBuffer).resize(512, 512).toFile(path.join(webSrcApp, 'icon.png'));
  await sharp(svgBuffer).resize(180, 180).toFile(path.join(webSrcApp, 'apple-icon.png'));

  // 5. Mobile App Assets (apps/mobile/assets/images/)
  if (fs.existsSync(mobileAssets)) {
    await sharp(svgBuffer).resize(1024, 1024).toFile(path.join(mobileAssets, 'icon.png'));
    await sharp(svgBuffer).resize(512, 512).toFile(path.join(mobileAssets, 'splash-icon.png'));
    await sharp(svgBuffer).resize(512, 512).toFile(path.join(mobileAssets, 'android-icon-foreground.png'));
    await sharp(svgBuffer).resize(512, 512).toFile(path.join(mobileAssets, 'logo-transparent.png'));
    await sharp(svgBuffer).resize(192, 192).toFile(path.join(mobileAssets, 'favicon.png'));
  }

  console.log('✅ All web & mobile brand assets, favicons, splash icons, and app icons generated successfully!');
}

generate().catch(console.error);
