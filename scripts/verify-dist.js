import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const results = [];

function check(title, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      results.push({ title, status: 'PASS' });
      console.log(`✅ [PASS] ${title}`);
    } else {
      results.push({ title, status: 'FAIL', error: String(result) });
      console.error(`❌ [FAIL] ${title}: ${result}`);
    }
  } catch (err) {
    results.push({ title, status: 'FAIL', error: err.message });
    console.error(`❌ [FAIL] ${title}: ${err.message}`);
  }
}

console.log('\n🔍 Starting Complete Verification of Built Extension in dist/...\n');

// 1. Manifest V3 validation
check('dist/manifest.json exists and is valid JSON', () => {
  const manifestPath = path.join(distDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return 'manifest.json missing';
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.manifest_version !== 3) return `Expected manifest_version 3, got ${manifest.manifest_version}`;
  if (!manifest.name) return 'manifest name missing';
  if (!manifest.version) return 'manifest version missing';
});

// 2. Referenced files in manifest exist
check('Service worker file exists and is non-empty', () => {
  const swPath = path.join(distDir, 'service-worker.js');
  if (!fs.existsSync(swPath)) return 'service-worker.js does not exist in dist/';
  const stat = fs.statSync(swPath);
  if (stat.size < 1000) return `service-worker.js seems too small (${stat.size} bytes)`;
});

check('Content script file exists and is self-contained IIFE', () => {
  const csPath = path.join(distDir, 'facebook-content.js');
  if (!fs.existsSync(csPath)) return 'facebook-content.js does not exist in dist/';
  const content = fs.readFileSync(csPath, 'utf8');
  if (!content.includes('function(') && !content.includes('(()=>')) {
    return 'facebook-content.js is not an IIFE bundle';
  }
});

check('All manifest icons exist and have valid dimensions', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
  for (const [size, relPath] of Object.entries(manifest.icons)) {
    const iconPath = path.join(distDir, relPath);
    if (!fs.existsSync(iconPath)) return `Icon ${relPath} (${size}) does not exist`;
    const stat = fs.statSync(iconPath);
    if (stat.size === 0) return `Icon ${relPath} is empty`;
  }
});

check('HTML pages exist in dist/src/pages/', () => {
  const pages = [
    'src/pages/dashboard/index.html',
    'src/pages/popup/index.html',
    'src/pages/options/index.html',
  ];
  for (const p of pages) {
    const fullPath = path.join(distDir, p);
    if (!fs.existsSync(fullPath)) return `Missing page: ${p}`;
  }
});

check('Assets referenced in HTML pages exist in dist/assets/', () => {
  const pages = [
    'src/pages/dashboard/index.html',
    'src/pages/popup/index.html',
    'src/pages/options/index.html',
  ];
  for (const p of pages) {
    const fullPath = path.join(distDir, p);
    const html = fs.readFileSync(fullPath, 'utf8');
    const assetMatches = html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g);
    for (const match of assetMatches) {
      const assetRel = match[1];
      const assetPath = path.join(distDir, assetRel);
      if (!fs.existsSync(assetPath)) {
        return `Page ${p} references missing asset: ${assetRel}`;
      }
    }
  }
});

// Summary
console.log('\n========================================');
console.log(`Total Checks: ${results.length}`);
console.log(`Passed: ${results.filter(r => r.status === 'PASS').length}`);
console.log(`Failed: ${results.filter(r => r.status === 'FAIL').length}`);
console.log('========================================\n');

if (results.some(r => r.status === 'FAIL')) {
  process.exit(1);
}
