import {
  getQueue,
  setQueue,
  getQueueState,
  setQueueState,
  getGroups,
  setGroups,
  clearAllGroups,
  getPosts,
  getTemplates,
  getSettings,
  updateSettings,
  getFacebookAccount,
  setFacebookAccount,
  getAutoJoinState,
  setAutoJoinState,
  getAutoJoinConfig,
  setAutoJoinConfig,
} from '../services/storage/chrome-storage';
import { normalizeSearchUrl } from '../services/facebook/auto-joiner-engine';
import { AutoJoinConfig, AutoJoinState } from '../types/auto-joiner';
import {
  calculateQueueStats,
  findNextExecutableItem,
  recordItemPosted,
  recordItemSkipped,
  recordItemFailed,
  updateItemStatus,
  createQueueItems,
} from '../services/queue/queue-engine';
import { formatPostWithTemplate, resolveSpintax } from '../services/template/template-engine';
import { deduplicateRepeatedCaption } from '../utils/text-styler';
import { logger } from '../services/logger/logger';
import { dispatchWebhookEvent } from '../services/webhook/webhook-service';
import {
  getDiscoveryProgress,
  setDiscoveryProgress,
  mergeDiscoveredGroups,
} from '../services/facebook/discovery-manager';
import { RuntimeMessage, ActivePostTabPayload, GroupDiscoveryResultPayload } from '../types/messages';
import { DiscoveryProgress, Group } from '../types/group';
import { DEFAULT_SETTINGS, DEFAULT_TEMPLATES } from '../utils/constants';

console.log('[AGP:Background] Service Worker starting with Group Discovery...');

// Lifecycle installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[AGP:Background] Extension installed/updated:', details.reason);
  try {
    const settings = await getSettings();
    if (!settings) {
      await chrome.storage.local.set({ agp_settings: DEFAULT_SETTINGS });
    } else if (settings.queue && settings.queue.delayBetweenItemsSec > 3) {
      // Auto-tune to turbo instant mode (0s delay)
      settings.queue.delayBetweenItemsSec = 0;
      await updateSettings(settings);
    }
    await cleanStorageBloat();
    const templates = await getTemplates();
    if (!templates || templates.length === 0) {
      await chrome.storage.local.set({ agp_templates: DEFAULT_TEMPLATES });
    }
    await logger.info('background', `AI Group Poster installed/updated (${details.reason})`);
  } catch (err) {
    console.error('Error during onInstalled initialization:', err);
  }
});

async function cleanStorageBloat() {
  try {
    const qItems = await getQueue();
    let hasBloat = false;
    const cleanItems = qItems.map(item => {
      if (item.media && item.media.length > 0) {
        hasBloat = true;
        return { ...item, media: undefined };
      }
      return item;
    });
    if (hasBloat || qItems.length > 100) {
      const activeOnly = cleanItems.filter(i => i.status === 'READY' || i.status === 'IN_PROGRESS');
      await chrome.storage.local.set({ agp_queue: activeOnly });
      console.log('[AGP:Background] Pruned storage bloat from agp_queue.');
    }
  } catch (err) {
    console.warn('[AGP:Background] Clean storage bloat error:', err);
  }
}
cleanStorageBloat();

/**
 * Sends a native Chrome notification if permitted and enabled.
 */
async function showNotification(title: string, message: string) {
  try {
    const settings = await getSettings();
    if (!settings.general.notificationsEnabled) return;

    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title,
        message,
        priority: 1,
      });
    }
  } catch (err) {
    console.warn('Could not show notification:', err);
  }
}

/**
 * Opens or updates tab for a given URL.
 */
async function openOrFocusTab(url: string): Promise<number | undefined> {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const existing = tabs.find(t => t.url && t.url.includes(url.replace(/https?:\/\//, '').split('?')[0]));

    if (existing && existing.id) {
      await chrome.tabs.update(existing.id, { active: true });
      return existing.id;
    }

    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = activeTabs[0];

    if (currentTab && (currentTab.url === 'chrome://newtab/' || currentTab.url?.includes('facebook.com'))) {
      const updated = await chrome.tabs.update(currentTab.id!, { url, active: true });
      return updated?.id;
    } else {
      const created = await chrome.tabs.create({ url, active: true });
      return created.id;
    }
  } catch (err) {
    console.error('Failed to open/update tab for URL:', url, err);
    return undefined;
  }
}

/**
 * Pacing delay runner between queue items.
 */
async function runPacingDelay(delaySeconds: number): Promise<void> {
  let remaining = delaySeconds;
  while (remaining > 0) {
    const state = await getQueueState();
    if (!state.isRunning || state.isPaused) {
      break; // Cancel pacing if paused or stopped
    }
    await setQueueState({ ...state, pacingDelayRemaining: remaining });
    await new Promise(r => setTimeout(r, 1000));
    remaining--;
  }

  const finalState = await getQueueState();
  await setQueueState({ ...finalState, pacingDelayRemaining: 0 });
}

// Track dedicated automation window and tab so all posting actions stay completely isolated in a small separate window
let activePostingWindowId: number | null = null;
let activePostingTabId: number | null = null;

/**
 * Orchestrates moving to the next item in the queue.
 */
async function executeNextQueueItem(): Promise<void> {
  const queue = await getQueue();
  const nextItem = findNextExecutableItem(queue);

  if (!nextItem) {
    // Queue completed! Cleanly close our dedicated automation window
    if (activePostingWindowId) {
      try {
        await chrome.windows.remove(activePostingWindowId);
      } catch {}
      activePostingWindowId = null;
      activePostingTabId = null;
    } else if (activePostingTabId) {
      try {
        await chrome.tabs.remove(activePostingTabId);
      } catch {}
      activePostingTabId = null;
    }

    const state = await getQueueState();
    await setQueueState({
      ...state,
      isRunning: false,
      isPaused: false,
      currentItemId: null,
      expectedGroupId: null,
      expectedGroupName: null,
      expectedGroupUrl: null,
      pacingDelayRemaining: 0,
    });
    await showNotification('Queue Completed', 'All eligible items in the posting queue have been processed.');
    await logger.success('queue', 'Queue session completed successfully');
    await dispatchWebhookEvent('QUEUE_COMPLETED', { totalProcessed: queue.length });
    return;
  }

  const [groups, posts] = await Promise.all([getGroups(), getPosts()]);
  let group = groups.find(
    g => g.id === nextItem.groupId || g.groupId === nextItem.groupId || (g.url && nextItem.groupId && g.url.includes(nextItem.groupId))
  );

  let groupUrl = group?.url || nextItem.groupUrl || '';
  if (!groupUrl && nextItem.groupId) {
    if (!nextItem.groupId.startsWith('grp_') && !nextItem.groupId.startsWith('queue_')) {
      groupUrl = nextItem.groupId.startsWith('http')
        ? nextItem.groupId
        : `https://www.facebook.com/groups/${nextItem.groupId}/`;
    }
  }

  // If this item has an invalid internal dummy URL (e.g. /groups/grp_...), auto-skip it immediately!
  if (!groupUrl || groupUrl.includes('/groups/grp_') || !groupUrl.includes('facebook.com')) {
    console.warn(`[AGP:Worker] Stale/invalid group URL: "${groupUrl}" for item ${nextItem.id}. Skipping...`);
    await recordItemSkipped(nextItem.id);
    await executeNextQueueItem();
    return;
  }

  const activeGroup: Group = group || {
    id: nextItem.groupId,
    name: nextItem.groupName || 'Facebook Group',
    url: groupUrl,
    groupId: nextItem.groupId,
    category: 'General',
    enabled: true,
    status: 'READY' as const,
    postCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  activeGroup.url = groupUrl;

  let post = posts.find(p => p.id === nextItem.postId) || posts[posts.length - 1] || posts[0];
  if (!post) {
    post = {
      id: nextItem.postId || 'post_default',
      title: 'Facebook Group Listing',
      productName: 'Facebook Group Listing',
      caption: nextItem.caption || '',
      description: nextItem.caption || '',
      images: nextItem.media || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Update item to IN_PROGRESS
  await updateItemStatus(nextItem.id, 'IN_PROGRESS');

  let tabId: number | undefined;

  // 1. Check if our dedicated small automation window is still alive
  let isWindowAlive = false;
  if (activePostingWindowId) {
    try {
      const existingWin = await chrome.windows.get(activePostingWindowId, { populate: true });
      if (existingWin && existingWin.id) {
        isWindowAlive = true;
      }
    } catch {
      isWindowAlive = false;
      activePostingWindowId = null;
      activePostingTabId = null;
    }
  }

  if (isWindowAlive && activePostingWindowId) {
    // Check if the tab inside our dedicated window is still alive
    if (activePostingTabId) {
      try {
        const existingTab = await chrome.tabs.get(activePostingTabId);
        if (existingTab && existingTab.windowId === activePostingWindowId) {
          await chrome.tabs.update(activePostingTabId, { url: activeGroup.url, active: true });
          tabId = activePostingTabId;
          try {
            await chrome.windows.update(activePostingWindowId, { focused: true });
          } catch {}
        }
      } catch {
        activePostingTabId = null;
      }
    }

    // If tab inside our dedicated window was closed, recreate it strictly inside this window
    if (!tabId) {
      try {
        const newTab = await chrome.tabs.create({
          windowId: activePostingWindowId,
          url: activeGroup.url,
          active: true,
        });
        tabId = newTab.id;
        activePostingTabId = newTab.id ?? null;
      } catch (tabErr) {
        console.warn('[AGP:Worker] Failed to create tab inside automation window:', tabErr);
      }
    }
  }

  // 2. If dedicated window does not exist or failed to open tab, create a new dedicated small popup window!
  // NEVER use or hijack user's existing tabs in their normal browser window.
  if (!tabId || !activePostingWindowId) {
    try {
      const win = await chrome.windows.create({
        url: activeGroup.url,
        type: 'popup',
        width: 960,
        height: 720,
        top: 60,
        left: 60,
        focused: true,
      });
      activePostingWindowId = win.id ?? null;
      if (win.tabs && win.tabs.length > 0) {
        tabId = win.tabs[0].id;
      } else if (win.id) {
        const winTabs = await chrome.tabs.query({ windowId: win.id });
        tabId = winTabs[0]?.id;
      }
      activePostingTabId = tabId ?? null;
    } catch (winErr) {
      console.error('[AGP:Worker] Failed to create dedicated automation popup window:', winErr);
    }
  }

  const state = await getQueueState();
  await setQueueState({
    ...state,
    isRunning: true,
    isPaused: false,
    currentItemId: nextItem.id,
    activeTabId: tabId ?? null,
    expectedGroupId: activeGroup.groupId || activeGroup.id,
    expectedGroupName: activeGroup.name,
    expectedGroupUrl: activeGroup.url,
    currentGroupMatch: true,
  });

  await logger.info('queue', `Opening group: ${activeGroup.name} (${activeGroup.url})`);
  await showNotification('Group Opened', `Review your prepared post for: ${activeGroup.name}`);
  await dispatchWebhookEvent('POST_READY', { groupId: activeGroup.id, postId: post.id, groupName: activeGroup.name });
}

/**
 * Checks if a given URL belongs to Facebook.
 */
function isFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('facebook.com') || parsed.hostname === 'fb.com' || parsed.hostname.endsWith('.facebook.com');
  } catch {
    return false;
  }
}

/**
 * Deterministic Facebook Tab Resolution (Requirement 10):
 * 1. Active facebook.com tab in current window
 * 2. Another facebook.com tab in current window
 * 3. Another facebook.com tab in browser
 * 4. Otherwise NONE -> prompt user
 */
async function resolveDeterministicFacebookTab(): Promise<{ tab: chrome.tabs.Tab | null; resolution: 'ACTIVE_CURRENT_WIN' | 'OTHER_CURRENT_WIN' | 'ANY_WIN' | 'NONE' }> {
  try {
    // 1. Active tab in current window
    const activeCurrent = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeCurrent[0]?.url && isFacebookUrl(activeCurrent[0].url)) {
      return { tab: activeCurrent[0], resolution: 'ACTIVE_CURRENT_WIN' };
    }

    // 2. Another facebook tab in current window
    const currentWinTabs = await chrome.tabs.query({ currentWindow: true });
    const inCurrentWin = currentWinTabs.find(t => t.url && isFacebookUrl(t.url));
    if (inCurrentWin) {
      return { tab: inCurrentWin, resolution: 'OTHER_CURRENT_WIN' };
    }

    // 3. Another facebook tab across all windows
    const allTabs = await chrome.tabs.query({});
    const inAnyWin = allTabs.find(t => t.url && isFacebookUrl(t.url));
    if (inAnyWin) {
      return { tab: inAnyWin, resolution: 'ANY_WIN' };
    }

    return { tab: null, resolution: 'NONE' };
  } catch (err) {
    console.warn('[AGP:Worker] Tab resolution error:', err);
    return { tab: null, resolution: 'NONE' };
  }
}

// Track active Facebook sync window
let activeDiscoveryWindowId: number | null = null;

/**
 * Executes Group Discovery on Facebook for the logged-in user using the Content Script engine.
 * Opens a small detached popup window, executes progressive scrolling sync, and closes the window when complete.
 */
async function executeGroupDiscovery(): Promise<DiscoveryProgress> {
  const initialProgress: DiscoveryProgress = {
    state: 'DISCOVERING',
    foundCount: 0,
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    outcome: 'PARTIAL',
    message: 'Opening Facebook sync window...',
    lastDiscoveredAt: Date.now(),
  };
  await setDiscoveryProgress(initialProgress);

  let createdWindowId: number | null = null;
  let tabId: number | null = null;

  try {
    const discoveryUrl = 'https://www.facebook.com/groups/joins/?nav_source=tab';
    
    // Always open in a dedicated small popup window - NEVER hijack user's personal open tabs!
    const win = await chrome.windows.create({
      url: discoveryUrl,
      type: 'popup',
      width: 500,
      height: 680,
      top: 80,
      left: 80,
      focused: true,
    });

    createdWindowId = win.id ?? null;
    activeDiscoveryWindowId = createdWindowId;

    if (win.tabs && win.tabs.length > 0) {
      tabId = win.tabs[0].id ?? null;
    } else if (createdWindowId) {
      const tabs = await chrome.tabs.query({ windowId: createdWindowId });
      tabId = tabs[0]?.id ?? null;
    }

    if (!tabId) {
      throw new Error('Failed to resolve Facebook tab for group sync.');
    }

    console.log(`[AGP:Worker] Facebook popup window created (Win #${createdWindowId}, Tab #${tabId})`);

    // 2. Wait for tab completion
    const startTime = Date.now();
    while (Date.now() - startTime < 15000) {
      try {
        const t = await chrome.tabs.get(tabId);
        if (t.status === 'complete') break;
      } catch {}
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Wait for Facebook React DOM hydration
    await new Promise(r => setTimeout(r, 2200));

    // 4. Ensure content script is ready
    let isScriptReady: boolean = await new Promise(resolve => {
      chrome.tabs.sendMessage(tabId!, { type: 'CHECK_FACEBOOK_SESSION' }, res => {
        resolve(!chrome.runtime.lastError && res?.success);
      });
    });

    if (!isScriptReady && chrome.scripting) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId! },
          files: ['facebook-content.js'],
        });
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.warn('[AGP:Worker] Script injection warning:', e);
      }
    }

    await setDiscoveryProgress({
      state: 'DISCOVERING',
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      outcome: 'PARTIAL',
      message: 'Scanning Facebook joined groups...',
      lastDiscoveredAt: Date.now(),
    });

    // 5. Send START_GROUP_DISCOVERY to content script
    const csResponse: any = await new Promise(resolve => {
      chrome.tabs.sendMessage(tabId!, { type: 'START_GROUP_DISCOVERY' }, res => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(res || { success: false, error: 'No response from content script' });
        }
      });
    });

    // 6. Close the small popup window automatically when finished!
    if (createdWindowId) {
      try {
        await chrome.windows.remove(createdWindowId);
      } catch (closeErr) {
        console.warn('[AGP:Worker] Popup window auto-close note:', closeErr);
      }
      activeDiscoveryWindowId = null;
    }

    if (csResponse?.success && csResponse.payload) {
      const payload = csResponse.payload;
      const discoveredGroups = payload.groups || [];
      const userProfile = payload.profile;
      const accountContext = userProfile?.userId || userProfile?.name || undefined;

      // Check account context switch
      const existingAcc = await getFacebookAccount();
      const newName = (userProfile?.name || existingAcc?.name || '').trim();
      if (existingAcc?.name && userProfile?.name && existingAcc.name.trim().toLowerCase() !== userProfile.name.trim().toLowerCase()) {
        console.log(`[AGP:Worker] Account changed from "${existingAcc.name}" to "${userProfile.name}". Isolated storage.`);
      }

      const mergeResult = await mergeDiscoveredGroups(discoveredGroups, {
        syncMode: 'exact',
        accountContext,
      });

      // Save account info
      const updatedAcc = {
        isLoggedIn: Boolean(userProfile?.isLoggedIn || userProfile?.name),
        name: newName || 'Facebook User',
        profileUrl: userProfile?.profileUrl || existingAcc?.profileUrl || 'https://www.facebook.com',
        avatarUrl: userProfile?.avatarUrl || existingAcc?.avatarUrl || '',
        userId: userProfile?.userId || existingAcc?.userId || '',
        totalGroupsCount: mergeResult.totalStored,
        lastSyncedAt: Date.now(),
      };
      await setFacebookAccount(updatedAcc);

      const outcome = payload.outcome || (payload.isPartial ? 'PARTIAL' : 'COMPLETE');
      const completionReason = payload.completionReason || (outcome === 'COMPLETE' ? 'TARGET_REACHED' : 'STAGNANT_TIMEOUT');

      let statusMessage = '';
      if (outcome === 'COMPLETE') {
        statusMessage = `${mergeResult.totalStored} verified groups found — scan complete.`;
      } else {
        statusMessage = `${mergeResult.totalStored} verified groups found — Facebook did not expose the complete list.`;
      }

      const finalProgress: DiscoveryProgress = {
        state: outcome === 'COMPLETE' ? 'DISCOVERY_COMPLETE' : 'DISCOVERY_PARTIAL',
        foundCount: payload.totalFoundOnPage || mergeResult.totalStored,
        importedCount: mergeResult.imported,
        duplicateCount: mergeResult.duplicates,
        errorCount: 0,
        outcome,
        completionReason,
        targetCount: payload.debugMetrics?.targetCount ?? null,
        targetCountStatus: payload.debugMetrics?.targetCountStatus ?? 'UNAVAILABLE',
        debugMetrics: payload.debugMetrics,
        message: statusMessage,
        lastDiscoveredAt: Date.now(),
      };

      await setDiscoveryProgress(finalProgress);

      if (outcome === 'COMPLETE') {
        await showNotification('Facebook Groups Synced', statusMessage);
        await logger.success('dashboard', statusMessage);
      } else {
        await showNotification('Facebook Groups Synced (Partial)', statusMessage);
        await logger.info('dashboard', statusMessage);
      }

      return finalProgress;
    }

    // Fallback if content script returned error
    const errMessage = csResponse?.error || 'Facebook group discovery failed.';
    const failProgress: DiscoveryProgress = {
      state: 'DISCOVERY_FAILED',
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 1,
      outcome: 'FAILED',
      completionReason: 'NO_JOINED_GROUP_INTERFACE',
      message: errMessage,
      lastDiscoveredAt: Date.now(),
    };
    await setDiscoveryProgress(failProgress);
    return failProgress;
  } catch (err: unknown) {
    if (createdWindowId) {
      try {
        await chrome.windows.remove(createdWindowId);
      } catch {}
      activeDiscoveryWindowId = null;
    }

    const msg = err instanceof Error ? err.message : String(err);
    const failProgress: DiscoveryProgress = {
      state: 'DISCOVERY_FAILED',
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 1,
      outcome: 'FAILED',
      completionReason: 'NO_JOINED_GROUP_INTERFACE',
      message: `Discovery error: ${msg}`,
      lastDiscoveredAt: Date.now(),
    };
    await setDiscoveryProgress(failProgress);
    return failProgress;
  }
}

// Runtime message listener
chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'START_GROUP_DISCOVERY': {
          const progress = await executeGroupDiscovery();
          sendResponse({ success: true, progress });
          break;
        }

        case 'CANCEL_GROUP_DISCOVERY': {
          if (activeDiscoveryWindowId) {
            try {
              await chrome.windows.remove(activeDiscoveryWindowId);
            } catch {}
            activeDiscoveryWindowId = null;
          }
          await setDiscoveryProgress({
            state: 'DISCOVERY_PARTIAL',
            foundCount: 0,
            importedCount: 0,
            duplicateCount: 0,
            errorCount: 0,
            outcome: 'CANCELLED',
            completionReason: 'USER_CANCELLED',
            message: 'Discovery cancelled by user.',
            lastDiscoveredAt: Date.now(),
          });
          sendResponse({ success: true });
          break;
        }

        case 'GET_DISCOVERY_STATUS': {
          const progress = await getDiscoveryProgress();
          sendResponse({ success: true, progress });
          break;
        }

        case 'GROUP_BATCH_DISCOVERED': {
          const p = message.payload as any;
          if (p && p.liveGroups && Array.isArray(p.liveGroups)) {
            try {
              await mergeDiscoveredGroups(p.liveGroups, { syncMode: 'merge' });
            } catch (mergeErr) {
              console.warn('[AGP:Worker] Live batch merge warning:', mergeErr);
            }
            await setDiscoveryProgress({
              state: 'DISCOVERING',
              foundCount: p.verifiedCount || p.liveGroups.length,
              importedCount: p.verifiedCount || p.liveGroups.length,
              duplicateCount: p.duplicatesRemoved || 0,
              errorCount: 0,
              outcome: 'PARTIAL',
              debugMetrics: p.debugMetrics,
              message: `Scanning Facebook Groups... ${p.verifiedCount || p.liveGroups.length} verified groups discovered`,
              lastDiscoveredAt: Date.now(),
            });
          }
          sendResponse({ success: true });
          break;
        }

        case 'GROUP_DISCOVERY_PROGRESS': {
          const p = message.payload as any;
          if (p && typeof p.foundCount === 'number') {
            await setDiscoveryProgress({
              state: 'DISCOVERING',
              foundCount: p.foundCount,
              importedCount: p.foundCount,
              duplicateCount: 0,
              errorCount: 0,
              outcome: 'PARTIAL',
              debugMetrics: p.debugMetrics,
              message: p.status || `Scanning Facebook Groups... ${p.foundCount} verified groups discovered`,
              lastDiscoveredAt: Date.now(),
            });
          }
          sendResponse({ success: true });
          break;
        }

        case 'GET_QUEUE_STATE': {
          const [queue, state] = await Promise.all([getQueue(), getQueueState()]);
          const stats = calculateQueueStats(queue);
          sendResponse({ success: true, queue, state, stats });
          break;
        }

        case 'DETECT_FB_SESSION': {
          const tabs = await chrome.tabs.query({});
          const fbTab = tabs.find(t => t.url && t.url.includes('facebook.com'));
          if (fbTab && fbTab.id) {
            const queryTab = async () => {
              chrome.tabs.sendMessage(fbTab.id!, { type: 'GET_FACEBOOK_USER_INFO' }, async res => {
                const storedGroups = await getGroups();
                if (chrome.runtime.lastError || !res) {
                  if (chrome.scripting && fbTab.id) {
                    try {
                      await chrome.scripting.executeScript({
                        target: { tabId: fbTab.id },
                        files: ['facebook-content.js'],
                      });
                      setTimeout(() => {
                        chrome.tabs.sendMessage(fbTab.id!, { type: 'GET_FACEBOOK_USER_INFO' }, async r2 => {
                          if (r2 && r2.profile && r2.profile.isLoggedIn) {
                            const acc = {
                              isLoggedIn: true,
                              name: r2.profile.name,
                              profileUrl: r2.profile.profileUrl,
                              avatarUrl: r2.profile.avatarUrl,
                              userId: r2.profile.userId,
                              totalGroupsCount: storedGroups.length,
                              lastSyncedAt: Date.now(),
                            };
                            await setFacebookAccount(acc);
                            sendResponse({ success: true, account: acc });
                          } else {
                            const saved = await getFacebookAccount();
                            sendResponse({ success: true, account: saved });
                          }
                        });
                      }, 400);
                      return;
                    } catch {
                      // Script injection fallback
                    }
                  }
                  const saved = await getFacebookAccount();
                  sendResponse({ success: true, account: saved });
                  return;
                }

                if (res && res.profile && res.profile.isLoggedIn) {
                  const acc = {
                    isLoggedIn: true,
                    name: res.profile.name,
                    profileUrl: res.profile.profileUrl,
                    avatarUrl: res.profile.avatarUrl,
                    userId: res.profile.userId,
                    totalGroupsCount: storedGroups.length,
                    lastSyncedAt: Date.now(),
                  };
                  await setFacebookAccount(acc);
                  sendResponse({ success: true, account: acc });
                } else {
                  const saved = await getFacebookAccount();
                  sendResponse({ success: true, account: saved });
                }
              });
            };
            await queryTab();
            return true;
          } else {
            const saved = await getFacebookAccount();
            sendResponse({ success: true, account: saved });
          }
          break;
        }

        case 'FB_USER_PROFILE_DETECTED': {
          const p = message.payload as any;
          if (p && p.name) {
            const current = await getFacebookAccount();
            await setFacebookAccount({
              isLoggedIn: true,
              name: p.name,
              profileUrl: p.profileUrl,
              avatarUrl: p.avatarUrl,
              userId: p.userId,
              totalGroupsCount: current?.totalGroupsCount || 0,
              lastSyncedAt: Date.now(),
            });
          }
          sendResponse({ success: true });
          break;
        }

        case 'START_QUEUE': {
          const state = await getQueueState();
          await setQueueState({
            ...state,
            isRunning: true,
            isPaused: false,
            sessionStartedAt: Date.now(),
          });
          await logger.info('queue', 'Queue execution started');
          await dispatchWebhookEvent('QUEUE_STARTED', {});
          await executeNextQueueItem();
          sendResponse({ success: true });
          break;
        }

        case 'PAUSE_QUEUE': {
          const state = await getQueueState();
          await setQueueState({ ...state, isPaused: true });
          await logger.info('queue', 'Queue execution paused');
          await showNotification('Queue Paused', 'Posting queue has been paused by user.');
          sendResponse({ success: true });
          break;
        }

        case 'RESUME_QUEUE': {
          const state = await getQueueState();
          await setQueueState({ ...state, isPaused: false, isRunning: true });
          await logger.info('queue', 'Queue execution resumed');
          await executeNextQueueItem();
          sendResponse({ success: true });
          break;
        }

        case 'CREATE_AND_START_QUEUE': {
          const p = message.payload as {
            groupIds: string[];
            postId: string;
            delaySec?: number;
          };
          if (p && Array.isArray(p.groupIds) && p.postId) {
            const curSettings = await getSettings();
            const delay = typeof p.delaySec === 'number' && p.delaySec >= 0 ? p.delaySec : 0;
            await updateSettings({
              queue: { ...curSettings.queue, delayBetweenItemsSec: delay },
            });

            // Ensure previous window is cleaned up so a fresh dedicated automation window opens
            if (activePostingWindowId) {
              try {
                await chrome.windows.remove(activePostingWindowId);
              } catch {}
            }
            activePostingWindowId = null;
            activePostingTabId = null;

            await createQueueItems(p.groupIds, p.postId, 'READY');
            const state = await getQueueState();
            await setQueueState({
              ...state,
              isRunning: true,
              isPaused: false,
              activeTabId: null,
              sessionStartedAt: Date.now(),
            });
            await logger.info('queue', `Sequential posting queue created for ${p.groupIds.length} groups`);
            await dispatchWebhookEvent('QUEUE_STARTED', { count: p.groupIds.length });
            await executeNextQueueItem();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Invalid payload for CREATE_AND_START_QUEUE' });
          }
          break;
        }

        case 'STOP_QUEUE': {
          if (activePostingWindowId) {
            try {
              await chrome.windows.remove(activePostingWindowId);
            } catch {}
            activePostingWindowId = null;
            activePostingTabId = null;
          } else if (activePostingTabId) {
            try {
              await chrome.tabs.remove(activePostingTabId);
            } catch {}
            activePostingTabId = null;
          }

          const state = await getQueueState();
          await setQueueState({
            ...state,
            isRunning: false,
            isPaused: false,
            currentItemId: null,
            expectedGroupId: null,
            expectedGroupName: null,
            expectedGroupUrl: null,
            pacingDelayRemaining: 0,
          });
          await logger.info('queue', 'Queue execution stopped by user');
          sendResponse({ success: true });
          break;
        }

        case 'MARK_AS_POSTED': {
          const state = await getQueueState();
          const currentId = message.payload ? (message.payload as { itemId: string }).itemId : state.currentItemId;
          if (!currentId) {
            sendResponse({ success: false, error: 'No active item to mark as posted' });
            return;
          }

          await recordItemPosted(currentId);
          await showNotification('Post Completed', 'Group marked as posted.');
          await dispatchWebhookEvent('POST_MARKED_POSTED', { itemId: currentId });

          const settings = await getSettings();
          if (!state.isPaused) {
            await setQueueState({ ...state, isRunning: true });
            if (settings.queue.delayBetweenItemsSec > 0 && settings.queue.delayBetweenItemsSec <= 5) {
              await runPacingDelay(settings.queue.delayBetweenItemsSec);
            }
            await executeNextQueueItem();
          }

          sendResponse({ success: true });
          break;
        }

        case 'SKIP_CURRENT_ITEM': {
          const state = await getQueueState();
          const p = message.payload as { itemId?: string; reason?: string } | undefined;
          const currentId = p?.itemId || state.currentItemId;
          if (!currentId) {
            sendResponse({ success: false, error: 'No active item to skip' });
            return;
          }

          const reason = p?.reason || 'Auto-skipped (posting unavailable or wrong group)';
          await recordItemSkipped(currentId, reason);
          await dispatchWebhookEvent('POST_SKIPPED', { itemId: currentId, reason });

          // Keep the dedicated automation window alive and smoothly navigate to the next group!
          if (!state.isPaused) {
            await setQueueState({ ...state, isRunning: true });
            await executeNextQueueItem();
          }

          sendResponse({ success: true });
          break;
        }

        case 'UPDATE_QUEUE_ITEM_CAPTION': {
          const p = message.payload as { itemId?: string; caption?: string } | undefined;
          if (p?.itemId && p.caption !== undefined) {
            const queue = await getQueue();
            const updated = queue.map(item => item.id === p.itemId ? { ...item, caption: p.caption } : item);
            await setQueue(updated);
          }
          sendResponse({ success: true });
          break;
        }

        case 'FB_PAGE_DETECTED': {
          const state = await getQueueState();
          if (state.currentItemId) {
            try {
              await updateItemStatus(state.currentItemId, 'IN_PROGRESS');
            } catch (err) {
              // Ignore
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'GET_ACTIVE_POST_FOR_TAB': {
          // STRICT TAB ISOLATION:
          // Check if sender tab is inside our dedicated posting automation window.
          // Never run queue automation / post injection on the user's personal Facebook tabs in their regular window!
          const isAutomationTab = Boolean(
            sender.tab && (
              sender.tab.id === activePostingTabId ||
              (activePostingWindowId && sender.tab.windowId === activePostingWindowId) ||
              sender.tab.id === (await getQueueState()).activeTabId
            )
          );

          if (!isAutomationTab) {
            // User opened Facebook on their own in another window/tab. Do NOT touch it!
            sendResponse({ success: true, payload: null, isUserTab: true });
            return;
          }

          const [queue, state, groups, posts, templates] = await Promise.all([
            getQueue(),
            getQueueState(),
            getGroups(),
            getPosts(),
            getTemplates(),
          ]);

          let activeItem = state.currentItemId
            ? queue.find(q => q.id === state.currentItemId) || null
            : null;

          const senderUrl = sender.tab?.url || (message.payload as { url?: string })?.url || '';

          if (!activeItem && senderUrl) {
            const matchedGroup = groups.find(g => senderUrl.includes(g.groupId || '') || (g.url && senderUrl.includes(g.url)));
            if (matchedGroup) {
              activeItem = queue.find(q => q.groupId === matchedGroup.id && (q.status === 'READY' || q.status === 'IN_PROGRESS' || q.status === 'WAITING_FOR_USER')) || null;
            }
          }

          if (!activeItem) {
            sendResponse({ success: true, payload: null });
            return;
          }

          const group = groups.find(g => g.id === activeItem!.groupId) || null;
          const post = posts.find(p => p.id === activeItem!.postId) || null;

          let cleanCaption = '';
          if (activeItem.caption) {
            cleanCaption = resolveSpintax(activeItem.caption);
          } else if (post?.caption) {
            cleanCaption = resolveSpintax(post.caption);
          } else if (post?.description) {
            cleanCaption = resolveSpintax(post.description);
          } else if (post) {
            const template = post.templateId ? templates.find(t => t.id === post.templateId) : undefined;
            cleanCaption = resolveSpintax(formatPostWithTemplate(post, template?.content));
          }
          cleanCaption = deduplicateRepeatedCaption(cleanCaption);

          // Robust Group Match Verification
          let isGroupMatch = true;
          if (group && senderUrl) {
            const isOurTab = Boolean(sender.tab && (sender.tab.id === state.activeTabId || sender.tab.id === activePostingTabId));
            if (isOurTab) {
              isGroupMatch = true;
            } else {
              const rawId = (group.groupId || '').replace(/^grp_/, '').toLowerCase().trim();
              const cleanExpectedUrl = (group.url || '').toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, '').replace(/\/$/, '');
              const cleanSenderUrl = senderUrl.toLowerCase().replace(/^https?:\/\/(www\.|m\.|web\.)?/, '').replace(/\/$/, '');

              const idInUrl = rawId ? cleanSenderUrl.includes(rawId) : false;
              const urlMatches = cleanExpectedUrl ? (cleanSenderUrl.includes(cleanExpectedUrl) || cleanExpectedUrl.includes(cleanSenderUrl)) : false;

              if (rawId || cleanExpectedUrl) {
                isGroupMatch = Boolean(idInUrl || urlMatches);
              }
            }
          }

          const queueIndex = queue.findIndex(q => q.id === activeItem!.id) + 1;
          const postedCount = queue.filter(q => q.status === 'POSTED').length;
          const payload: ActivePostTabPayload = {
            queueItem: activeItem,
            group,
            post,
            caption: cleanCaption,
            formattedPost: cleanCaption,
            media: activeItem.media || post?.images || [],
            queueIndex: queueIndex > 0 ? queueIndex : 1,
            totalQueueItems: queue.length,
            postedCount,
            isGroupMatch,
            expectedGroupName: group ? group.name : 'Expected Group',
            expectedGroupUrl: group ? group.url : '',
          };

          sendResponse({ success: true, payload });
          break;
        }

        case 'OPEN_DASHBOARD': {
          const dashboardUrl = chrome.runtime.getURL('src/pages/dashboard/index.html');
          const existingTabs = await chrome.tabs.query({ url: dashboardUrl });
          if (existingTabs.length > 0 && existingTabs[0].id) {
            await chrome.tabs.update(existingTabs[0].id, { active: true });
          } else {
            await chrome.tabs.create({ url: dashboardUrl, active: true });
          }
          sendResponse({ success: true });
          break;
        }

        case 'FOCUS_POSTING_TAB':
        case 'FOCUS_ACTIVE_POSTING_TAB': {
          if (activePostingWindowId) {
            try {
              await chrome.windows.update(activePostingWindowId, { focused: true });
            } catch {}
          }
          if (activePostingTabId) {
            try {
              await chrome.tabs.update(activePostingTabId, { active: true });
              const tab = await chrome.tabs.get(activePostingTabId);
              if (tab.windowId) {
                await chrome.windows.update(tab.windowId, { focused: true });
              }
            } catch {}
          }
          sendResponse({ success: true });
          break;
        }

        case 'GET_DEBUG_METRICS': {
          const progress = await getDiscoveryProgress();
          sendResponse({ success: true, debugMetrics: progress.debugMetrics || null });
          break;
        }

        /* ================= AUTO-JOINER HANDLERS ================= */
        case 'START_AUTO_JOIN': {
          const rawConfig = (message.payload || {}) as AutoJoinConfig;
          const searchUrl = normalizeSearchUrl(rawConfig.searchUrl || '');
          const config: AutoJoinConfig = {
            searchUrl,
            delaySec: typeof rawConfig.delaySec === 'number' ? Math.max(0, rawConfig.delaySec) : 0,
            maxGroups: typeof rawConfig.maxGroups === 'number' ? rawConfig.maxGroups : 0,
            autoAnswerQuestions: rawConfig.autoAnswerQuestions !== false,
            defaultAnswer: rawConfig.defaultAnswer || 'Yes, I agree to the group rules and guidelines.',
            saveToGroups: rawConfig.saveToGroups !== false,
            selectedCategory: rawConfig.selectedCategory || 'Auto Joined',
          };

          await setAutoJoinConfig(config);
          await setAutoJoinState({
            status: 'SEARCHING',
            searchUrl,
            query: '',
            totalFound: 0,
            joinedCount: 0,
            requestedCount: 0,
            alreadyJoinedCount: 0,
            failedCount: 0,
            skippedCount: 0,
            currentIndex: 0,
            currentGroupName: '',
            countdownSec: 0,
            message: 'Navigating to Facebook search page...',
            groups: [],
            startedAt: Date.now(),
          });

          // Set pending auto-join flag so content script starts immediately
          await chrome.storage.local.set({
            agp_pending_auto_join: {
              active: true,
              config,
              requestedAt: Date.now(),
            },
          });

          // Open or focus Facebook tab
          const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });
          let targetTab: chrome.tabs.Tab | undefined = tabs.find(t => t.url && t.url.includes('/search'));
          if (!targetTab && tabs.length > 0) {
            targetTab = tabs[0];
          }

          if (targetTab && targetTab.id) {
            await chrome.tabs.update(targetTab.id, { url: searchUrl, active: true });
            if (targetTab.windowId) {
              try { await chrome.windows.update(targetTab.windowId, { focused: true }); } catch (_) {}
            }
          } else {
            targetTab = await chrome.tabs.create({ url: searchUrl, active: true });
          }

          await logger.info('background', `Started Auto-Join on: ${searchUrl}`);
          sendResponse({ success: true, tabId: targetTab?.id, searchUrl });
          break;
        }

        case 'PAUSE_AUTO_JOIN': {
          const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'PAUSE_AUTO_JOIN' }).catch(() => {});
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'RESUME_AUTO_JOIN': {
          const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'RESUME_AUTO_JOIN' }).catch(() => {});
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'STOP_AUTO_JOIN': {
          await chrome.storage.local.remove('agp_pending_auto_join');
          const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'STOP_AUTO_JOIN' }).catch(() => {});
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'GET_AUTO_JOIN_STATE': {
          const autoState = await getAutoJoinState();
          sendResponse({ success: true, state: autoState });
          break;
        }

        case 'AUTO_JOIN_PROGRESS': {
          const pState = message.payload as AutoJoinState;
          if (pState) {
            await setAutoJoinState(pState);
          }
          sendResponse({ success: true });
          break;
        }

        case 'AUTO_JOIN_SAVE_GROUPS': {
          const p = message.payload as { group: Group };
          if (p && p.group) {
            const currentGroups = await getGroups();
            const exists = currentGroups.some(
              g => (g.groupId && g.groupId.toLowerCase() === p.group.groupId?.toLowerCase()) ||
                   (g.url && p.group.url && g.url.toLowerCase() === p.group.url.toLowerCase())
            );
            if (!exists) {
              const updatedGroups = [...currentGroups, p.group];
              await setGroups(updatedGroups);
              await logger.success('background', `Auto-joined group saved: "${p.group.name}" (Ready for posting)`);
              showNotification('Facebook Group Added', `"${p.group.name}" is now saved and ready for posting.`);
            }
          }
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[AGP:Background] Handler error:', message);
      sendResponse({ success: false, error: message });
    }
  })();

  return true; // Keep message channel open for async response
});

// Auto-pause queue if user manually closes the dedicated automation window
chrome.windows.onRemoved.addListener(async (windowId) => {
  if (windowId === activePostingWindowId) {
    console.log('[AGP:Worker] Dedicated posting automation window closed by user.');
    activePostingWindowId = null;
    activePostingTabId = null;
    const state = await getQueueState();
    if (state.isRunning && !state.isPaused) {
      await setQueueState({
        ...state,
        isRunning: false,
        isPaused: true,
        activeTabId: null,
      });
      await logger.info('queue', 'Automation window closed. Queue automatically paused.');
    }
  } else if (windowId === activeDiscoveryWindowId) {
    console.log('[AGP:Worker] Dedicated discovery window closed.');
    activeDiscoveryWindowId = null;
  }
});

