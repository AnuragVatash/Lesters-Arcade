#!/usr/bin/env node
/*
  Optimize PNG/JPG images in public while preserving transparency.
  - PNG: lossless via oxipng, plus palette quantization via sharp when beneficial.
  - JPG: mozjpeg-ish equivalent via sharp with mozjpeg
*/

const path = require('node:path');
const fs = require('node:fs');
const fg = require('fast-glob');
const sharp = require('sharp');

// Resize rules specifically for casinoFingerprints based on displayed sizes.
// We only downscale (never upscale) and preserve aspect ratio unless both width & height are given.
const casinoResizeRules = [
  // UI chrome
  { pattern: /public\\?\/casinoFingerprints\/status_bar\.png$/i, resize: { width: 1280 } },
  { pattern: /public\\?\/casinoFingerprints\/timer\.png$/i, resize: { width: 314, height: 67, fit: 'inside' } },
  { pattern: /public\\?\/casinoFingerprints\/deciphered_signals_box\.png$/i, resize: { width: 461 } },
  { pattern: /public\\?\/casinoFingerprints\/tab_button\.png$/i, resize: { width: 24, height: 24, fit: 'cover' } },
  { pattern: /public\\?\/casinoFingerprints\/clone_target\.png$/i, resize: { width: 461, height: 455, fit: 'cover' } },
  // Components column background and overlays
  { pattern: /public\\?\/casinoFingerprints\/fp_temp\.png$/i, resize: { width: 314, height: 520, fit: 'inside' } },
  { pattern: /public\\?\/casinoFingerprints\/fp_outline_transparent\.png$/i, resize: { width: 84, height: 84, fit: 'cover' } },
  // Fingerprint tiles (8 per set)
  { pattern: /public\\?\/casinoFingerprints\/print\d+\/casinofp\d+\.(png|jpg|jpeg)$/i, resize: { width: 84, height: 84, fit: 'cover' } },
  // Full target fingerprint overlay rendered at ~88.2% of 461px container -> ~407px wide
  { pattern: /public\\?\/casinoFingerprints\/print\d+\/fpFull\.png$/i, resize: { width: 407 } },
];

async function conditionalResize(inputPath) {
  const rule = casinoResizeRules.find(r => r.pattern.test(inputPath));
  if (!rule) return false;

  const buf = await fs.promises.readFile(inputPath);
  const img = sharp(buf, { sequentialRead: true });
  const meta = await img.metadata();

  // Avoid upscaling: if both target dims are greater than or equal to current, skip
  const targetW = rule.resize.width || null;
  const targetH = rule.resize.height || null;
  const willUpscaleW = targetW && meta.width && targetW > meta.width;
  const willUpscaleH = targetH && meta.height && targetH > meta.height;
  if ((willUpscaleW && !targetH) || (willUpscaleH && !targetW) || (willUpscaleW && willUpscaleH)) {
    return false;
  }

  const resized = await img
    .resize({
      width: targetW || undefined,
      height: targetH || undefined,
      fit: rule.resize.fit || 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  if (resized.length < buf.length) {
    await fs.promises.writeFile(inputPath, resized);
  }
  return true;
}

async function optimizePng(inputPath) {
  const buf = await fs.promises.readFile(inputPath);
  const img = sharp(buf, { sequentialRead: true });
  const meta = await img.metadata();

  // Use lossless oxipng and keep alpha; allow palette when <= 256 colors
  const pipeline = img.png({
    compressionLevel: 9,
    adaptiveFiltering: true,
    palette: meta.hasAlpha ? true : false,
    quality: 100,
    effort: 9,
  });

  const optimized = await pipeline.toBuffer();
  if (optimized.length < buf.length) {
    await fs.promises.writeFile(inputPath, optimized);
  }
}

async function optimizeJpeg(inputPath) {
  const buf = await fs.promises.readFile(inputPath);
  const optimized = await sharp(buf, { sequentialRead: true })
    .jpeg({ mozjpeg: true, quality: 78 })
    .toBuffer();
  if (optimized.length < buf.length) {
    await fs.promises.writeFile(inputPath, optimized);
  }
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const patterns = [
    'public/**/*.png',
    'public/**/*.PNG',
    'public/**/*.jpg',
    'public/**/*.JPG',
    'public/**/*.jpeg',
    'public/**/*.JPEG',
  ];

  const files = await fg(patterns, { cwd: root, absolute: true, onlyFiles: true });
  let optimizedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    try {
      // First, try to downscale casinoFingerprint assets to their render size
      await conditionalResize(file);

      if (ext === '.png') {
        await optimizePng(file);
        optimizedCount++;
      } else if (ext === '.jpg' || ext === '.jpeg') {
        await optimizeJpeg(file);
        optimizedCount++;
      }
    } catch (err) {
      console.error(`Failed to optimize ${file}:`, err.message);
    }
  }

  console.log(`Optimized ${optimizedCount} images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


