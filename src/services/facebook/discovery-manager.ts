import { DebugMetrics, DiscoveryProgress, DiscoveryState, Group } from '../../types/group';
import { generateId } from '../../utils/helpers';
import { getGroups, setGroups, isInvalidNotificationGroup, normalizeAccountKey, getFacebookAccount } from '../storage/chrome-storage';
import { logger } from '../logger/logger';
import { DiscoveredGroupItem, cleanGroupName } from './detectors/group-discovery';

const DISCOVERY_STORAGE_KEY = 'agp_discovery_progress';
const DEBUG_METRICS_STORAGE_KEY = 'agp_discovery_debug_metrics';

export function createInitialDebugMetrics(): DebugMetrics {
  return {
    candidateCount: 0,
    verifiedCount: 0,
    duplicatesRemoved: 0,
    rejectedCount: 0,
    scrollIterations: 0,
    mutationEvents: 0,
    targetCount: null,
    targetCountStatus: 'UNAVAILABLE',
    completionReason: null,
    scanDurationMs: 0,
    lastNewGroupTimestamp: null,
  };
}

export const INITIAL_DISCOVERY_PROGRESS: DiscoveryProgress = {
  state: 'NOT_CONNECTED',
  foundCount: 0,
  importedCount: 0,
  duplicateCount: 0,
  errorCount: 0,
  message: 'Click "Sync Facebook Groups" to discover all joined groups.',
  debugMetrics: createInitialDebugMetrics(),
};

export async function getDiscoveryProgress(): Promise<DiscoveryProgress> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise(resolve => {
      chrome.storage.local.get([DISCOVERY_STORAGE_KEY], result => {
        resolve(result[DISCOVERY_STORAGE_KEY] || INITIAL_DISCOVERY_PROGRESS);
      });
    });
  }
  return INITIAL_DISCOVERY_PROGRESS;
}

export async function setDiscoveryProgress(progress: DiscoveryProgress): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [DISCOVERY_STORAGE_KEY]: progress });
  }
}

export async function getDebugMetrics(): Promise<DebugMetrics> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise(resolve => {
      chrome.storage.local.get([DEBUG_METRICS_STORAGE_KEY], result => {
        resolve(result[DEBUG_METRICS_STORAGE_KEY] || createInitialDebugMetrics());
      });
    });
  }
  return createInitialDebugMetrics();
}

export async function setDebugMetrics(metrics: DebugMetrics): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [DEBUG_METRICS_STORAGE_KEY]: metrics });
  }
}

export interface MergeGroupsOptions {
  syncMode?: 'merge' | 'exact';
  accountContext?: string;
}

/**
 * Merges newly discovered groups with existing stored groups using 3-tier canonical deduplication.
 * Tier 1: Facebook Group ID / Slug
 * Tier 2: Canonical Group URL
 * Tier 3: Normalized Group Name + Clean URL
 */
export async function mergeDiscoveredGroups(
  discovered: DiscoveredGroupItem[],
  options?: MergeGroupsOptions
): Promise<{ imported: number; duplicates: number; totalStored: number; verifiedCount: number }> {
  const accountContext = options?.accountContext || (await getFacebookAccount())?.name || 'default_account';
  const existing = await getGroups(accountContext);
  
  const idMap = new Map<string, Group>();
  const urlMap = new Map<string, Group>();
  const nameMap = new Map<string, Group>();

  const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

  existing.forEach(g => {
    if (g.groupId) idMap.set(g.groupId.toLowerCase(), g);
    if (g.url) urlMap.set(g.url.toLowerCase().replace(/\/$/, ''), g);
    if (g.name) nameMap.set(normalizeName(g.name), g);
  });

  let importedCount = 0;
  let duplicateCount = 0;
  const now = Date.now();
  const toAdd: Group[] = [];
  const matchedExistingIds = new Set<string>();

  for (const item of discovered) {
    if (isInvalidNotificationGroup(item as any)) continue;

    const slugKey = (item.groupId || '').toLowerCase();
    const cleanUrl = (item.url || '').toLowerCase().replace(/\/$/, '');
    const normName = normalizeName(item.name || '');

    // Check 3-tier identity match
    let existingMatch = (slugKey ? idMap.get(slugKey) : undefined) ||
                        (cleanUrl ? urlMap.get(cleanUrl) : undefined) ||
                        (normName && normName.length >= 3 ? nameMap.get(normName) : undefined);

    const cleanName = cleanGroupName(item.name || '', item.groupId);

    if (existingMatch) {
      duplicateCount++;
      matchedExistingIds.add(existingMatch.id);
      
      // Enhance existing record with discovered properties
      if (cleanName && (!existingMatch.name || existingMatch.name.includes('·') || existingMatch.name.length < cleanName.length)) {
        existingMatch.name = cleanName;
      }
      if (item.imageUrl && !existingMatch.imageUrl) {
        existingMatch.imageUrl = item.imageUrl;
      }
      if (item.privacy && item.privacy !== 'UNKNOWN') {
        existingMatch.privacy = item.privacy;
      }
      existingMatch.verified = true;
      existingMatch.source = 'facebook-ui';
      existingMatch.accountContext = accountContext;
      existingMatch.discoveredAt = now;
      existingMatch.updatedAt = now;
    } else {
      importedCount++;
      const canonicalId = item.groupId
        ? `grp_${item.groupId.replace(/[^a-zA-Z0-9_-]/g, '')}`
        : generateId('grp');
      const canonicalUrl = item.url.startsWith('http')
        ? item.url
        : `https://www.facebook.com/groups/${item.groupId}/`;

      const newGroup: Group = {
        id: canonicalId,
        name: cleanName,
        url: canonicalUrl,
        groupId: item.groupId,
        privacy: item.privacy || 'UNKNOWN',
        imageUrl: item.imageUrl,
        category: 'Discovered',
        enabled: true,
        selected: true, // Selected by default for convenient queue creation
        status: 'READY',
        postCount: 0,
        verified: true,
        source: 'facebook-ui',
        accountContext,
        discoveredAt: now,
        createdAt: now,
        updatedAt: now,
      };

      toAdd.push(newGroup);
      if (slugKey) idMap.set(slugKey, newGroup);
      if (cleanUrl) urlMap.set(cleanUrl, newGroup);
      if (normName) nameMap.set(normName, newGroup);
      matchedExistingIds.add(newGroup.id);
    }
  }

  let updatedGroups: Group[];
  if (options?.syncMode === 'exact') {
    // Exact sync: only keep groups verified in this session or manually added by user
    const isManualGroup = (g: Group) => g.source === 'manual' || (g.category && g.category !== 'Discovered');
    const keptExisting = existing.filter(g => matchedExistingIds.has(g.id) || isManualGroup(g));
    updatedGroups = [...toAdd, ...keptExisting];
  } else {
    updatedGroups = [...toAdd, ...existing];
  }

  // Final deduplication by internal ID and by Canonical URL
  const deduped: Group[] = [];
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();

  for (const g of updatedGroups) {
    const uKey = g.url.toLowerCase().replace(/\/$/, '');
    if (!seenIds.has(g.id) && !seenUrls.has(uKey)) {
      seenIds.add(g.id);
      seenUrls.add(uKey);
      deduped.push(g);
    }
  }

  await setGroups(deduped, accountContext);

  await logger.info(
    'dashboard',
    `Group discovery merged (${options?.syncMode || 'merge'}): ${importedCount} imported, ${duplicateCount} duplicates, total ${deduped.length}`
  );

  return {
    imported: importedCount,
    duplicates: duplicateCount,
    totalStored: deduped.length,
    verifiedCount: deduped.filter(g => g.verified).length,
  };
}

