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
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 3959;
const HOST = '127.0.0.1';

function runCommand(cmd, cwd = rootDir) {
  return new Promise((resolve) => {
    exec(cmd, { cwd, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      const out = (stdout || '') + (stderr ? '\n' + stderr : '');
      if (error) {
        resolve({ success: false, output: out.trim(), error: error.message });
      } else {
        resolve({ success: true, output: out.trim() });
      }
    });
  });
}

async function getGitCommitDetails() {
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

    return { sha, shortSha, message, author, date, branch };
  } catch {
    return { sha: '', shortSha: '', message: '', author: '', date: '', branch: 'main' };
  }
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

  // Route 0: Quick health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, status: 'alive' }));
    return;
  }

  // Route 1: Status check
  if (url.pathname === '/status') {
    try {
      const details = await getGitCommitDetails();
      const statusRes = await runCommand('git status --porcelain');
      const isDirty = Boolean(statusRes.output && statusRes.output.trim());

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        server: 'AI Group Poster Local Companion',
        branch: details.branch,
        commit: {
          sha: details.sha,
          shortSha: details.shortSha,
          message: details.message,
          author: details.author,
          date: details.date,
        },
        hasUncommittedChanges: isDirty,
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
    return;
  }

  // Route 2: Update from GitHub (git pull + build)
  if (url.pathname === '/update-from-github' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('\n======================================================');
    console.log('🔄 [Companion] Received update request from Extension!');
    console.log('📥 Step 1/2: Pulling latest changes from GitHub (git pull origin main)...');

    // Handle unstaged changes safely with autostash
    const pullRes = await runCommand('git pull --autostash origin main');
    console.log(pullRes.output);

    if (!pullRes.success) {
      console.error('❌ [Companion] Git pull encountered an error:', pullRes.error || pullRes.output);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        ok: false,
        message: `Git pull failed: ${pullRes.error || pullRes.output}`,
        pullOutput: pullRes.output,
      }));
      return;
    }

    console.log('🔨 Step 2/2: Building extension (node scripts/build-extension.js)...');
    const buildRes = await runCommand('node scripts/build-extension.js');
    console.log(buildRes.output);

    if (!buildRes.success) {
      console.error('❌ [Companion] Build extension failed:', buildRes.error || buildRes.output);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        ok: false,
        message: `Extension build failed. Details: ${buildRes.error || buildRes.output}`,
        pullOutput: pullRes.output,
        buildOutput: buildRes.output,
      }));
      return;
    }

    const latestDetails = await getGitCommitDetails();
    console.log(`✨ [Companion] Update successful! Current Commit: ${latestDetails.shortSha}`);
    console.log('======================================================\n');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      ok: true,
      message: 'Extension successfully updated from GitHub and rebuilt!',
      commit: latestDetails,
      pullOutput: pullRes.output,
      buildOutput: buildRes.output,
    }));
    return;
  }

  // Route 3: Rebuild only (without git pull)
  if (url.pathname === '/rebuild' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('\n🔨 [Companion] Rebuilding extension bundle...');
    const buildRes = await runCommand('node scripts/build-extension.js');

    if (!buildRes.success) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        ok: false,
        message: `Rebuild failed: ${buildRes.error || buildRes.output}`,
        buildOutput: buildRes.output,
      }));
      return;
    }

    const latestDetails = await getGitCommitDetails();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      ok: true,
      message: 'Extension rebuilt successfully!',
      commit: latestDetails,
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
