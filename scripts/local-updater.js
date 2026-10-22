/**
 * Local Companion Auto-Updater Server
 * 
 * Runs a local lightweight bridge (port 3959) so that clicking "Update" inside
 * the Chrome extension triggers an automatic `git pull` from GitHub and `npm run build`
 * without touching the terminal or opening chrome://extensions!
 * 
 * Usage:
 *   node scripts/local-updater.js
 *   or: npm run updater
 */

import http from 'http';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 3959;
const HOST = '127.0.0.1';

function runCommand(cmd, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + '\n' + stderr, error: error.message });
      } else {
        resolve({ success: true, output: stdout + (stderr ? '\n' + stderr : '') });
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers allowing Chrome Extension to call local companion
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

  // Route 1: Status check
  if (url.pathname === '/status') {
    try {
      const gitLogRes = await runCommand('git log -1 --format="%H|%h|%s|%an|%cI"');
      const gitBranchRes = await runCommand('git branch --show-current');

      const parts = (gitLogRes.output || '').trim().split('|');
      const sha = parts[0] || '';
      const shortSha = parts[1] || '';
      const message = parts[2] || '';
      const author = parts[3] || '';
      const date = parts[4] || '';
      const branch = (gitBranchRes.output || 'main').trim();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        server: 'AI Group Poster Local Companion',
        branch,
        commit: { sha, shortSha, message, author, date },
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
    return;
  }

  // Route 2: Update from GitHub (git pull + build)
  if (url.pathname === '/update-from-github' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('\n🔄 [Companion] Received update request from Extension!');
    console.log('📥 Step 1/2: Pulling latest changes from GitHub (git pull origin main)...');

    const pullRes = await runCommand('git pull origin main');
    console.log(pullRes.output.trim());

    console.log('🔨 Step 2/2: Building extension (node scripts/build-extension.js)...');
    const buildRes = await runCommand('node scripts/build-extension.js');
    console.log(buildRes.output.trim());

    const overallSuccess = buildRes.success;

    res.writeHead(overallSuccess ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: overallSuccess,
      ok: overallSuccess,
      message: overallSuccess
        ? 'Successfully pulled latest changes from GitHub and rebuilt extension!'
        : 'Update or build encountered an issue. See details.',
      pullOutput: pullRes.output,
      buildOutput: buildRes.output,
    }));
    return;
  }

  // Route 3: Rebuild only (without git pull)
  if (url.pathname === '/rebuild' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('\n🔨 [Companion] Rebuilding extension bundle...');
    const buildRes = await runCommand('node scripts/build-extension.js');

    res.writeHead(buildRes.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: buildRes.success,
      message: buildRes.success ? 'Extension rebuilt successfully!' : 'Build failed',
      buildOutput: buildRes.output,
    }));
    return;
  }

  // Default: Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AI Group Poster Local Update Companion is Active!`);
  console.log(`📡 Listening at http://${HOST}:${PORT}`);
  console.log(`⚡ Ready for 1-click GitHub Pull & Extension Reloads`);
  console.log(`======================================================\n`);
});
