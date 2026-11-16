// scripts/verify-screenshots.mjs
// Inspect all screenshots in docs/phase-3/screenshots/ and verify PNG dimensions

import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve('docs/phase-3/screenshots');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  // PNG signature is 8 bytes: 89 50 4E 47 0D 0A 1A 0A
  // IHDR chunk starts at byte 12: length(4), 'IHDR'(4), width(4), height(4)
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    return null;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

async function verifyScreenshots() {
  console.log('=====================================================');
  console.log('  RASOIIQ SCREENSHOT RECONCILIATION & DIMENSION AUDIT ');
  console.log('=====================================================');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    console.error('Screenshot directory does not exist:', SCREENSHOT_DIR);
    return;
  }

  const files = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} PNG screenshots in ${SCREENSHOT_DIR}:\n`);

  for (const file of files) {
    const filePath = path.join(SCREENSHOT_DIR, file);
    const stat = fs.statSync(filePath);
    const dims = getPngDimensions(filePath);
    console.log(`- ${file.padEnd(35)} : ${dims ? `${dims.width}x${dims.height}` : 'INVALID PNG'}, Size: ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

verifyScreenshots().catch(console.error);
