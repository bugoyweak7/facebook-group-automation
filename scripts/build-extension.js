import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Extract current git commit metadata
let currentGitSha = '33b84ad5f000c0e7f880c3543f8e8b64650f67dc';
let currentShortSha = '33b84ad';
let currentCommitMsg = 'resilient bulk group import';
let commitDate = new Date().toISOString();

try {
  currentGitSha = execSync('git rev-parse HEAD', { cwd: rootDir }).toString().trim();
  currentShortSha = execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
  currentCommitMsg = execSync('git log -1 --format=%s', { cwd: rootDir }).toString().trim();
  commitDate = execSync('git log -1 --format=%cI', { cwd: rootDir }).toString().trim();
} catch (e) {
  console.warn('⚠️ Could not extract git commit info:', e.message);
}

const buildDefines = {
  __APP_COMMIT_SHA__: JSON.stringify(currentGitSha),
  __APP_SHORT_SHA__: JSON.stringify(currentShortSha),
  __APP_COMMIT_MSG__: JSON.stringify(currentCommitMsg),
  __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
};

async function buildExtension() {
  console.log('🚀 Building AI Group Poster Chrome Extension...');
  console.log(`📌 Git Commit: ${currentShortSha} (${currentGitSha})`);

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Build HTML UI Pages
  console.log('📦 Step 1: Building Popup, Dashboard & Options pages...');
  await build({
    root: rootDir,
    plugins: [react()],
    define: buildDefines,
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: {
          dashboard: path.resolve(rootDir, 'src/pages/dashboard/index.html'),
          popup: path.resolve(rootDir, 'src/pages/popup/index.html'),
          options: path.resolve(rootDir, 'src/pages/options/index.html'),
        },
      },
    },
  });

  // 2. Build Service Worker (ES module)
  console.log('📦 Step 2: Building Service Worker...');
  await build({
    configFile: false,
    root: rootDir,
    define: buildDefines,
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/background/service-worker.ts'),
        name: 'ServiceWorker',
        formats: ['es'],
        fileName: () => 'service-worker.js',
      },
    },
  });

  // 3. Build Facebook Content Script (IIFE for isolated page injection)
  console.log('📦 Step 3: Building Facebook Content Script...');
  await build({
    configFile: false,
    root: rootDir,
    define: buildDefines,
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/content/facebook-content.ts'),
        name: 'FacebookContent',
        formats: ['iife'],
        fileName: () => 'facebook-content.js',
      },
    },
  });

  // 3b. Build Prevent BeforeUnload Script (IIFE for MAIN world page injection)
  console.log('📦 Step 3b: Building Prevent BeforeUnload Script...');
  await build({
    configFile: false,
    root: rootDir,
    define: buildDefines,
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/content/prevent-beforeunload.ts'),
        name: 'PreventBeforeUnload',
        formats: ['iife'],
        fileName: () => 'prevent-beforeunload.js',
      },
    },
  });

  // 4. Copy manifest.json, icons, & write build-info.json
  console.log('📦 Step 4: Finalizing manifest, build-info and static assets...');
  const manifestSrc = path.resolve(rootDir, 'public/manifest.json');
  const manifestDest = path.resolve(distDir, 'manifest.json');
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest);
    console.log('✅ manifest.json copied to dist/');
  }

  const iconsSrc = path.resolve(rootDir, 'public/icons');
  const iconsDest = path.resolve(distDir, 'icons');
  if (fs.existsSync(iconsSrc)) {
    fs.cpSync(iconsSrc, iconsDest, { recursive: true });
    console.log('✅ icons copied to dist/icons');
  }

  // Write build metadata
  const buildInfo = {
    version: '1.0.1',
    commitSha: currentGitSha,
    shortSha: currentShortSha,
    message: currentCommitMsg,
    commitDate,
    builtAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.resolve(distDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
  fs.writeFileSync(path.resolve(rootDir, 'public/build-info.json'), JSON.stringify(buildInfo, null, 2));
  console.log(`✅ build-info.json written (commit: ${currentShortSha})`);

  console.log('✨ Build successfully completed! Load unpacked folder: dist/');
}

buildExtension().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
