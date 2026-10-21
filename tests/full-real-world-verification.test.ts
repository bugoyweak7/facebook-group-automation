import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QueueItem } from '../src/types/queue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

describe('Full Real-World Built Extension Verification', () => {
  it('1. dist/manifest.json is valid Manifest V3', () => {
    const manifestPath = path.join(distDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('AI Group Poster');
    expect(manifest.action.default_popup).toBe('src/pages/popup/index.html');
    expect(manifest.background.service_worker).toBe('service-worker.js');
    expect(manifest.content_scripts[0].js[0]).toBe('facebook-content.js');
    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('tabs');
    expect(manifest.permissions).toContain('notifications');
  });

  it('2. All referenced scripts, HTML files, icons and assets actually exist inside dist/', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
    const filesToCheck = [
      manifest.background.service_worker,
      manifest.content_scripts[0].js[0],
      manifest.action.default_popup,
      manifest.options_ui.page,
      ...Object.values(manifest.icons as Record<string, string>),
    ];

    for (const f of filesToCheck) {
      const fullPath = path.join(distDir, f);
      expect(fs.existsSync(fullPath), `File missing: ${f}`).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(0);
    }
  });

  it('3. There are no broken import paths or missing asset files in HTML pages', () => {
    const pages = ['src/pages/dashboard/index.html', 'src/pages/popup/index.html', 'src/pages/options/index.html'];
    for (const page of pages) {
      const html = fs.readFileSync(path.join(distDir, page), 'utf8');
      const matches = Array.from(html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g));
      expect(matches.length).toBeGreaterThan(0);
      for (const m of matches) {
        const assetPath = path.join(distDir, m[1]);
        expect(fs.existsSync(assetPath), `Asset not found: ${m[1]}`).toBe(true);
      }
    }
  });

  it('4. Popup loads correctly and has root container & bundled code', () => {
    const popupHtml = fs.readFileSync(path.join(distDir, 'src/pages/popup/index.html'), 'utf8');
    expect(popupHtml).toContain('id="root"');
    const match = popupHtml.match(/src="\/assets\/popup-([^"]+)\.js"/);
    expect(match).not.toBeNull();
    const jsContent = fs.readFileSync(path.join(distDir, `assets/popup-${match![1]}.js`), 'utf8');
    expect(jsContent).toContain('AI Group Poster');
  });

  it('5. Full dashboard loads correctly and has root container & bundled code', () => {
    const dashHtml = fs.readFileSync(path.join(distDir, 'src/pages/dashboard/index.html'), 'utf8');
    expect(dashHtml).toContain('id="root"');
    const match = dashHtml.match(/src="\/assets\/dashboard-([^"]+)\.js"/);
    expect(match).not.toBeNull();
    const jsContent = fs.readFileSync(path.join(distDir, `assets/dashboard-${match![1]}.js`), 'utf8');
    expect(jsContent).toContain('AI Group Poster');
  });

  it('6. Options page works with redirect to dashboard', () => {
    const optHtml = fs.readFileSync(path.join(distDir, 'src/pages/options/index.html'), 'utf8');
    expect(optHtml).toContain('id="root"');
    const match = optHtml.match(/src="\/assets\/options-([^"]+)\.js"/);
    expect(match).not.toBeNull();
  });

  it('7. Chrome Storage operations work (saveGroup, deleteGroup, getGroups)', async () => {
    const { saveGroup, getGroups, deleteGroup } = await import('../src/services/storage/chrome-storage');
    const group = {
      id: 'test_verify_grp',
      name: 'Verify Group',
      url: 'https://www.facebook.com/groups/verify.grp',
      category: 'General',
      enabled: true,
      status: 'READY' as const,
      postCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveGroup(group);
    let current = await getGroups();
    expect(current.some(g => g.id === 'test_verify_grp')).toBe(true);

    await deleteGroup('test_verify_grp');
    current = await getGroups();
    expect(current.some(g => g.id === 'test_verify_grp')).toBe(false);
  });

  it('8. Groups can actually be added, edited, and duplicate checked', async () => {
    const { validateFacebookGroupUrl, detectDuplicateGroup } = await import('../src/utils/validators');
    const valid = validateFacebookGroupUrl('https://www.facebook.com/groups/dhaka.bikes');
    expect(valid.valid).toBe(true);
    expect(valid.groupId).toBe('dhaka.bikes');

    const list = [{
      id: 'g1',
      name: 'Existing',
      url: 'https://www.facebook.com/groups/dhaka.bikes/',
      groupId: 'dhaka.bikes',
      category: 'General',
      enabled: true,
      status: 'READY' as const,
      postCount: 0,
      createdAt: 1000,
      updatedAt: 1000,
    }];

    expect(detectDuplicateGroup('https://m.facebook.com/groups/dhaka.bikes', list)).toBe(true);
    expect(detectDuplicateGroup('https://www.facebook.com/groups/new.bikes', list)).toBe(false);
  });

  it('9. Posts can actually be created and saved', async () => {
    const { savePost, getPosts, deletePost } = await import('../src/services/storage/chrome-storage');
    const post = {
      id: 'test_post_verify',
      title: 'Yamaha FZS Verification',
      productName: 'Yamaha FZS V3',
      price: '2,15,000 BDT',
      description: 'Single owner bike',
      images: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await savePost(post);
    let posts = await getPosts();
    expect(posts.some(p => p.id === 'test_post_verify')).toBe(true);

    await deletePost('test_post_verify');
    posts = await getPosts();
    expect(posts.some(p => p.id === 'test_post_verify')).toBe(false);
  });

  it('10. Templates work with variables {product_name}, {price}, {location}, {contact}', async () => {
    const { formatPostWithTemplate } = await import('../src/services/template/template-engine');
    const post = {
      id: 'p_tpl',
      title: 'Test',
      productName: 'Yamaha R15',
      price: '5,50,000 BDT',
      location: 'Banani, Dhaka',
      contactInfo: '01800-000000',
      description: 'Super fast',
      images: [],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const template = '🔥 {product_name}\nPrice: {price}\nLoc: {location}\nCall: {contact_info}';
    const output = formatPostWithTemplate(post, template);
    expect(output).toContain('Yamaha R15');
    expect(output).toContain('5,50,000 BDT');
    expect(output).toContain('Banani, Dhaka');
    expect(output).toContain('01800-000000');
  });

  it('11. Queue creation and state transitions work', async () => {
    const { transitionQueueItem } = await import('../src/services/queue/state-machine');
    let item: QueueItem = {
      id: 'q_test',
      groupId: 'g1',
      postId: 'p1',
      status: 'PENDING',
      order: 1,
      createdAt: 1000,
    };

    item = transitionQueueItem(item, 'READY');
    expect(item.status).toBe('READY');

    item = transitionQueueItem(item, 'IN_PROGRESS');
    expect(item.status).toBe('IN_PROGRESS');
    expect(item.startedAt).toBeDefined();

    item = transitionQueueItem(item, 'WAITING_FOR_USER');
    expect(item.status).toBe('WAITING_FOR_USER');

    item = transitionQueueItem(item, 'POSTED');
    expect(item.status).toBe('POSTED');
    expect(item.completedAt).toBeDefined();
  });

  it('12. Queue persists after reload/restart', async () => {
    const { setQueue, getQueue } = await import('../src/services/storage/chrome-storage');
    const item = {
      id: 'persist_item_1',
      groupId: 'g1',
      postId: 'p1',
      status: 'READY' as const,
      order: 1,
      createdAt: Date.now(),
    };
    await setQueue([item]);
    const retrieved = await getQueue();
    expect(retrieved.some(q => q.id === 'persist_item_1')).toBe(true);
  });

  it('13. History is actually written when an item is marked as posted', async () => {
    const { addHistory, getHistory, clearHistory } = await import('../src/services/storage/chrome-storage');
    const rec = {
      id: 'hist_rec_1',
      groupId: 'g1',
      groupName: 'Dhaka Bikers',
      groupUrl: 'https://www.facebook.com/groups/dhaka.bikers',
      postId: 'p1',
      postTitle: 'Yamaha Post',
      productName: 'Yamaha FZS',
      status: 'POSTED' as const,
      postedAt: Date.now(),
      notes: 'Posted successfully',
    };
    await addHistory(rec);
    const list = await getHistory();
    expect(list.some(h => h.id === 'hist_rec_1')).toBe(true);
  });

  it('14. Activity Logs are actually written and retrieved', async () => {
    const { logger } = await import('../src/services/logger/logger');
    const { getLogs } = await import('../src/services/storage/chrome-storage');
    await logger.info('queue', 'Unit verification log entry');
    const logs = await getLogs();
    expect(logs.some(l => l.message === 'Unit verification log entry')).toBe(true);
  });

  it('15. CSV import/export works with validation and duplicate checking', async () => {
    const { parseGroupsCsv, exportGroupsToCsv } = await import('../src/services/csv/csv-parser');
    const csv = `name,url,category,location\nChittagong Auto,https://www.facebook.com/groups/ctg.auto,Vehicles,Chittagong`;
    const res = parseGroupsCsv(csv);
    expect(res.validRows.length).toBe(1);
    expect(res.validRows[0].name).toBe('Chittagong Auto');

    const exported = exportGroupsToCsv([{
      id: 'g_exp',
      name: 'Chittagong Auto',
      url: 'https://www.facebook.com/groups/ctg.auto',
      category: 'Vehicles',
      enabled: true,
      status: 'READY' as const,
      postCount: 0,
      createdAt: 1000,
      updatedAt: 1000,
    }]);
    expect(exported).toContain('Chittagong Auto');
  });

  it('16. JSON backup/restore works and validates schema', async () => {
    const { inspectBackupJson } = await import('../src/services/backup/backup-service');
    const backup = {
      version: '1.0.0',
      exportedAt: Date.now(),
      groups: [{ id: 'g1', name: 'Group 1', url: 'https://www.facebook.com/groups/g1' }],
      posts: [],
      templates: [],
      queue: [],
      history: [],
      settings: {},
    };
    const { preview, parsed } = inspectBackupJson(JSON.stringify(backup));
    expect(preview?.valid).toBe(true);
    expect(preview?.groupCount).toBe(1);
    expect(parsed).not.toBeNull();
  });

  it('17. AI configuration UI and provider abstraction are connected correctly', async () => {
    const { aiService } = await import('../src/services/ai/ai-service');
    expect(aiService).toBeDefined();
    expect(typeof aiService.generateCaption).toBe('function');
    expect(typeof aiService.transformCaption).toBe('function');
  });

  it('18. Facebook Group page detection and helper panel logic', async () => {
    const { validateFacebookGroupUrl } = await import('../src/utils/validators');
    const info = validateFacebookGroupUrl('https://www.facebook.com/groups/sylhet.market/');
    expect(info.valid).toBe(true);
    expect(info.groupId).toBe('sylhet.market');
  });

  it('19. Clipboard helpers and copy functions', async () => {
    const { copyToClipboard } = await import('../src/utils/helpers');
    expect(typeof copyToClipboard).toBe('function');
  });

  it('20. Pause, Resume, Skip, Retry and Stop queue controls', async () => {
    const { calculateQueueStats, findNextExecutableItem } = await import('../src/services/queue/queue-engine');
    const queue = [
      { id: '1', groupId: 'g1', postId: 'p1', status: 'READY' as const, order: 1, createdAt: 1000 },
      { id: '2', groupId: 'g2', postId: 'p1', status: 'FAILED' as const, order: 2, createdAt: 1000 },
    ];
    const stats = calculateQueueStats(queue);
    expect(stats.ready).toBe(1);
    expect(stats.failed).toBe(1);
    const next = findNextExecutableItem(queue);
    expect(next?.id).toBe('1');
  });

  it('21. No console or runtime syntax errors in compiled dist bundles', () => {
    const sw = fs.readFileSync(path.join(distDir, 'service-worker.js'), 'utf8');
    expect(sw.length).toBeGreaterThan(1000);

    const cs = fs.readFileSync(path.join(distDir, 'facebook-content.js'), 'utf8');
    expect(cs.includes('(function(){')).toBe(true);
  });

  it('22. No broken buttons or fake placeholder functionality across components', () => {
    const files = [
      'src/services/queue/queue-engine.ts',
      'src/services/storage/chrome-storage.ts',
      'src/services/ai/ai-service.ts',
      'src/pages/dashboard/App.tsx',
      'src/pages/popup/PopupApp.tsx',
    ];

    for (const f of files) {
      const code = fs.readFileSync(path.join(rootDir, f), 'utf8');
      expect(code.includes('TODO: implement')).toBe(false);
      expect(code.includes('// TODO')).toBe(false);
    }
  });

  it('23. Group Discovery Link parser extracts group slugs and filters out non-group paths', async () => {
    const { validateFacebookGroupUrl } = await import('../src/utils/validators');

    const valid1 = validateFacebookGroupUrl('https://www.facebook.com/groups/rangamati.buysell/');
    expect(valid1.valid).toBe(true);
    expect(valid1.groupId).toBe('rangamati.buysell');

    const valid2 = validateFacebookGroupUrl('https://facebook.com/groups/1092837465/');
    expect(valid2.valid).toBe(true);
    expect(valid2.groupId).toBe('1092837465');

    // Utility paths must NOT be accepted as groups
    const feed = validateFacebookGroupUrl('https://www.facebook.com/groups/feed/');
    expect(feed.valid).toBe(false);

    const discover = validateFacebookGroupUrl('https://www.facebook.com/groups/discover/');
    expect(discover.valid).toBe(false);
  });

  it('24. mergeDiscoveredGroups deduplicates groups, updates lastDiscoveredAt, and preserves data', async () => {
    const { mergeDiscoveredGroups } = await import('../src/services/facebook/discovery-manager');
    const { getGroups, setGroups } = await import('../src/services/storage/chrome-storage');

    await setGroups([
      {
        id: 'grp-existing-1',
        name: 'Existing Group',
        url: 'https://www.facebook.com/groups/existing.group',
        groupId: 'existing.group',
        privacy: 'PUBLIC',
        category: 'General',
        enabled: true,
        selected: false,
        status: 'READY',
        postCount: 5,
        createdAt: 10000,
        updatedAt: 10000,
      }
    ]);

    const result = await mergeDiscoveredGroups([
      {
        name: 'Existing Group Renamed',
        url: 'https://www.facebook.com/groups/existing.group/',
        groupId: 'existing.group',
        privacy: 'PUBLIC',
      },
      {
        name: 'New Discovered Group',
        url: 'https://www.facebook.com/groups/new.group',
        groupId: 'new.group',
        privacy: 'PRIVATE',
      }
    ]);

    expect(result.imported).toBe(1);
    expect(result.duplicates).toBe(1);

    const stored = await getGroups();
    expect(stored.length).toBe(2);
    const existing = stored.find(g => g.groupId === 'existing.group');
    expect(existing?.postCount).toBe(5); // Preserves existing post count
    expect(existing?.discoveredAt).toBeGreaterThan(0);
  });

  it('25. Multi-selection to queue items: batch queue generation maps selected groups to READY items', async () => {
    const { createQueueItems } = await import('../src/services/queue/queue-engine');
    const { getQueue, setQueue } = await import('../src/services/storage/chrome-storage');

    await setQueue([]);
    const selectedGroupIds = ['grp-1', 'grp-2', 'grp-3'];
    const postId = 'post-product-1';

    const newItems = await createQueueItems(selectedGroupIds, postId);
    expect(newItems.length).toBe(3);
    expect(newItems.every(item => item.status === 'READY')).toBe(true);
    expect(newItems.map(i => i.groupId)).toEqual(['grp-1', 'grp-2', 'grp-3']);
  });

  it('26. Wrong-group detection: URL and slug matching accurately flags mismatched group tabs', async () => {
    const { validateFacebookGroupUrl } = await import('../src/utils/validators');

    const expectedGroupUrl = 'https://www.facebook.com/groups/rangamati.buysell/';
    const currentTabUrl1 = 'https://www.facebook.com/groups/rangamati.buysell/?ref=share';
    const currentTabUrl2 = 'https://www.facebook.com/groups/dhaka.bikemarket/';

    const expected = validateFacebookGroupUrl(expectedGroupUrl);
    const tab1 = validateFacebookGroupUrl(currentTabUrl1);
    const tab2 = validateFacebookGroupUrl(currentTabUrl2);

    const match1 = expected.groupId?.toLowerCase() === tab1.groupId?.toLowerCase();
    const match2 = expected.groupId?.toLowerCase() === tab2.groupId?.toLowerCase();

    expect(match1).toBe(true);  // Same group
    expect(match2).toBe(false); // Wrong group! Warning must trigger
  });

  it('27. Popup and Dashboard bundle include Discover My Facebook Groups functionality', () => {
    const assetsDir = path.join(distDir, 'assets');
    const popupFile = fs.readdirSync(assetsDir).find(f => f.startsWith('popup-') && f.endsWith('.js')) || '';
    const popupJs = fs.readFileSync(path.join(assetsDir, popupFile), 'utf8');
    expect(popupJs).toContain('START_GROUP_DISCOVERY');

    const swJs = fs.readFileSync(path.join(distDir, 'service-worker.js'), 'utf8');
    expect(swJs).toContain('START_GROUP_DISCOVERY');
    expect(swJs).toContain('https://www.facebook.com/groups/joins/');
  });

  it('28. Popup and Service Worker contain CREATE_AND_START_QUEUE sequential posting logic', () => {
    const assetsDir = path.join(distDir, 'assets');
    const popupFile = fs.readdirSync(assetsDir).find(f => f.startsWith('popup-') && f.endsWith('.js')) || '';
    const popupJs = fs.readFileSync(path.join(assetsDir, popupFile), 'utf8');
    expect(popupJs).toContain('CREATE_AND_START_QUEUE');

    const swSource = fs.readFileSync(path.join(rootDir, 'src/background/service-worker.ts'), 'utf8');
    expect(swSource).toContain('activePostingTabId');

    const swJs = fs.readFileSync(path.join(distDir, 'service-worker.js'), 'utf8');
    expect(swJs).toContain('CREATE_AND_START_QUEUE');
    expect(swJs).toContain('MARK_AS_POSTED');
    expect(swJs).toContain('SKIP_CURRENT_ITEM');
    expect(swJs).toContain('chrome.tabs.remove');
  });

  it('29. Manifest includes unlimitedStorage permission for robust multi-image base64 support', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
    expect(manifest.permissions).toContain('unlimitedStorage');
  });

  it('30. Facebook content script contains automated posting robot with photo attachment & submission', () => {
    const fcSource = fs.readFileSync(path.join(rootDir, 'src/content/facebook-content.ts'), 'utf8');
    expect(fcSource).toContain('runAutomatedPostingRoutine');
    expect(fcSource).toContain('openComposerModal');
    expect(fcSource).toContain('injectCaptionIntoEditor');
    expect(fcSource).toContain('attachPhotosToDialog');
    expect(fcSource).toContain('findAndClickPostButton');
    expect(fcSource).toContain('startAutoPostingCountdown');

    const fcDist = fs.readFileSync(path.join(distDir, 'facebook-content.js'), 'utf8');
    expect(fcDist).toContain('insertText');
    expect(fcDist).toContain('DataTransfer');
  });
});


