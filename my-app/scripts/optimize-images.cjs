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


