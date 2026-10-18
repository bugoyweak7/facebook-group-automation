import { Group, FacebookAccountInfo } from '../../types/group';
import { Post, PostTemplate } from '../../types/post';
import { QueueItem, QueueState } from '../../types/queue';
import { HistoryRecord } from '../../types/history';
import { LogEntry } from '../../types/log';
import { AppSettings } from '../../types/settings';
import { DEFAULT_SETTINGS, DEFAULT_TEMPLATES } from '../../utils/constants';

const STORAGE_KEYS = {
  GROUPS: 'agp_groups',
  ACCOUNT_GROUPS: 'agp_facebook_groups_by_account',
  POSTS: 'agp_posts',
  TEMPLATES: 'agp_templates',
  QUEUE: 'agp_queue',
  QUEUE_STATE: 'agp_queue_state',
  HISTORY: 'agp_history',
  LOGS: 'agp_logs',
  SETTINGS: 'agp_settings',
  FACEBOOK_ACCOUNT: 'agp_facebook_account',
} as const;

// Detect Chrome extension storage availability
const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
};

// In-memory cache for fast access & non-extension fallback
const memoryCache: Record<string, unknown> = {};

/**
 * Generic storage get with fallback.
 */
async function storageGet<T>(key: string, defaultValue: T): Promise<T> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.warn(`Storage get error for ${key}:`, chrome.runtime.lastError);
          resolve(memoryCache[key] !== undefined ? (memoryCache[key] as T) : defaultValue);
          return;
        }
        if (result && result[key] !== undefined) {
          resolve(result[key] as T);
        } else {
          resolve(defaultValue);
        }
      });
    });
  }

  // Fallback to localStorage or in-memory
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    }
  } catch (err) {
    console.warn('LocalStorage access failed:', err);
  }

  return memoryCache[key] !== undefined ? (memoryCache[key] as T) : defaultValue;
}

/**
 * Generic storage set with fallback.
 */
async function storageSet<T>(key: string, value: T): Promise<void> {
  memoryCache[key] = value;

  if (isChromeStorageAvailable()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  // Fallback to localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn('LocalStorage set failed:', err);
  }
}

/* ================= ACCOUNT SCOPED GROUPS ================= */

/**
 * Normalizes account context key (e.g. "Nahid" or userId "10001234").
 */
export function normalizeAccountKey(nameOrId?: string): string {
  if (!nameOrId) return 'default_account';
  const clean = nameOrId.trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi, '_');
  return clean || 'default_account';
}

/**
 * Retrieves the full account-scoped groups map.
 */
export async function getAccountGroupsMap(): Promise<Record<string, AccountGroupStorage>> {
  return storageGet<Record<string, AccountGroupStorage>>(STORAGE_KEYS.ACCOUNT_GROUPS, {});
}

/**
 * Retrieves groups for the active or specified account context.
 */
export async function getGroups(accountContext?: string): Promise<Group[]> {
  const currentAcc = await getFacebookAccount();
  const targetKey = normalizeAccountKey(accountContext || currentAcc?.userId || currentAcc?.name);

  const accountMap = await getAccountGroupsMap();
  if (accountMap[targetKey] && Array.isArray(accountMap[targetKey].groups) && accountMap[targetKey].groups.length > 0) {
    const raw = accountMap[targetKey].groups;
    const cleaned = raw.filter(g => !isInvalidNotificationGroup(g));
    if (cleaned.length > 0) return cleaned;
  }

  // Fallback to global GROUPS key if account-scoped key not initialized yet
  const raw = await storageGet<Group[]>(STORAGE_KEYS.GROUPS, []);
  const cleaned = raw.filter(g => !isInvalidNotificationGroup(g));
  if (cleaned.length > 0) {
    return cleaned;
  }

  // Fallback to any account in accountMap with stored groups
  for (const key of Object.keys(accountMap)) {
    if (accountMap[key] && Array.isArray(accountMap[key].groups) && accountMap[key].groups.length > 0) {
      const accRaw = accountMap[key].groups.filter(g => !isInvalidNotificationGroup(g));
      if (accRaw.length > 0) return accRaw;
    }
  }

  return [];
}

/**
 * Saves groups scoped to the active or specified account context.
 */
export async function setGroups(groups: Group[], accountContext?: string): Promise<void> {
  const cleaned = (groups || []).filter(g => !isInvalidNotificationGroup(g));
  const currentAcc = await getFacebookAccount();
  const targetKey = normalizeAccountKey(accountContext || currentAcc?.userId || currentAcc?.name);

  // 1. Update account-scoped map
  const accountMap = await getAccountGroupsMap();
  const existingStorage = accountMap[targetKey] || {
    accountContext: targetKey,
    accountInfo: currentAcc || { isLoggedIn: true, name: 'Facebook User', lastSyncedAt: Date.now() },
    groups: [],
    lastSyncedAt: Date.now(),
  };

  accountMap[targetKey] = {
    ...existingStorage,
    groups: cleaned,
    lastSyncedAt: Date.now(),
  };

  await storageSet(STORAGE_KEYS.ACCOUNT_GROUPS, accountMap);

  // 2. Also keep global GROUPS in sync for active account views
  await storageSet(STORAGE_KEYS.GROUPS, cleaned);
}

export async function getAccountStorage(accountContext: string): Promise<AccountGroupStorage | null> {
  const key = normalizeAccountKey(accountContext);
  const map = await getAccountGroupsMap();
  return map[key] || null;
}

export async function saveAccountStorage(storageItem: AccountGroupStorage): Promise<void> {
  const key = normalizeAccountKey(storageItem.accountContext);
  const map = await getAccountGroupsMap();
  map[key] = storageItem;
  await storageSet(STORAGE_KEYS.ACCOUNT_GROUPS, map);
}

export async function getAccountGroups(accountContext: string): Promise<Group[]> {
  return getGroups(accountContext);
}

export async function saveAccountGroups(accountContext: string, groups: Group[]): Promise<void> {
  return setGroups(groups, accountContext);
}

/* ================= GROUPS CRUD ================= */

/**
 * Checks if a group item is an invalid Facebook notification string or post permalink.
 */
export function isInvalidNotificationGroup(g: Partial<Group>): boolean {
  if (!g) return true;
  const name = (g.name || '').trim().toLowerCase();
  const url = (g.url || '').trim().toLowerCase();

  // 1. Name markers from Facebook notification bell
  if (
    name.startsWith('unread') ||
    name.includes('commented on') ||
    name.includes('also commented') ||
    name.includes('likes your') ||
    name.includes('liked your') ||
    name.includes('reacted to') ||
    name.includes('shared a post') ||
    name.includes('shared your post') ||
    name.includes('invited you') ||
    name.includes('mentioned you') ||
    name.includes('requested to join') ||
    name.includes('মন্তব্য করেছেন') ||
    name.includes('মতামত দিয়েছেন') ||
    name.includes('লাইক দিয়েছেন') ||
    name.includes('শেয়ার করেছেন')
  ) {
    return true;
  }

  // 2. URL markers indicating specific post, comment, permalink, or notification
  if (
    url.includes('/permalink/') ||
    url.includes('/posts/') ||
    url.includes('/user/') ||
    url.includes('/profile.php') ||
    url.includes('/friends/') ||
    url.includes('/people/') ||
    url.includes('/photos/') ||
    url.includes('/videos/') ||
    url.includes('/events/') ||
    url.includes('/files/') ||
    url.includes('comment_id=') ||
    url.includes('notif_id=') ||
    url.includes('notif_t=') ||
    url.includes('reply_comment_id=')
  ) {
    return true;
  }

  // 3. Non-group names or system slugs (e.g. "About", "Settings", "Feed", "Discover")
  const INVALID_NAMES_OR_SLUGS = new Set([
    'about',
    'about group',
    'feed',
    'discover',
    'create',
    'notifications',
    'search',
    'categories',
    'joins',
    'settings',
    'help',
    'privacy',
    'terms',
    'policies',
    'support',
    'messages',
    'marketplace',
  ]);

  const cleanName = name.replace(/\s*group\s*$/i, '').trim();
  if (INVALID_NAMES_OR_SLUGS.has(name) || INVALID_NAMES_OR_SLUGS.has(cleanName)) {
    return true;
  }
  if (g.groupId && INVALID_NAMES_OR_SLUGS.has(g.groupId.toLowerCase())) {
    return true;
  }

  return false;
}

export async function saveGroup(group: Group): Promise<void> {
  if (isInvalidNotificationGroup(group)) {
    console.warn(`[AGP:Storage] Blocked invalid notification group from being saved: ${group.name}`);
    return;
  }
  const groups = await getGroups();
  const existingIndex = groups.findIndex(g => g.id === group.id);
  if (existingIndex >= 0) {
    groups[existingIndex] = group;
  } else {
    groups.unshift(group);
  }
  await setGroups(groups);
}

export async function updateGroup(group: Group): Promise<void> {
  await saveGroup(group);
}

export async function deleteGroup(id: string): Promise<void> {
  const groups = await getGroups();
  const filtered = groups.filter(g => g.id !== id);
  await setGroups(filtered);
}

export async function clearAllGroups(): Promise<void> {
  await setGroups([]);
}

/* ================= POSTS ================= */

export async function getPosts(): Promise<Post[]> {
  return storageGet<Post[]>(STORAGE_KEYS.POSTS, []);
}

export async function setPosts(posts: Post[]): Promise<void> {
  await storageSet(STORAGE_KEYS.POSTS, posts);
}

export async function savePost(post: Post): Promise<void> {
  const posts = await getPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post);
  }
  await setPosts(posts);
}

export async function updatePost(post: Post): Promise<void> {
  await savePost(post);
}

export async function deletePost(id: string): Promise<void> {
  const posts = await getPosts();
  const filtered = posts.filter(p => p.id !== id);
  await setPosts(filtered);
}

/* ================= TEMPLATES ================= */

export async function getTemplates(): Promise<PostTemplate[]> {
  return storageGet<PostTemplate[]>(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
}

export async function setTemplates(templates: PostTemplate[]): Promise<void> {
  await storageSet(STORAGE_KEYS.TEMPLATES, templates);
}

export async function saveTemplate(template: PostTemplate): Promise<void> {
  const templates = await getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  await setTemplates(templates);
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  await setTemplates(filtered);
}

/* ================= QUEUE ================= */

export async function getQueue(): Promise<QueueItem[]> {
  return storageGet<QueueItem[]>(STORAGE_KEYS.QUEUE, []);
}

export async function setQueue(queue: QueueItem[]): Promise<void> {
  await storageSet(STORAGE_KEYS.QUEUE, queue);
}

export async function saveQueueItem(item: QueueItem): Promise<void> {
  const queue = await getQueue();
  const existingIndex = queue.findIndex(q => q.id === item.id);
  if (existingIndex >= 0) {
    queue[existingIndex] = item;
  } else {
    queue.push(item);
  }
  await setQueue(queue);
}

export async function clearCompletedQueue(): Promise<void> {
  const queue = await getQueue();
  const activeOnly = queue.filter(q => q.status !== 'POSTED' && q.status !== 'SKIPPED');
  await setQueue(activeOnly);
}

export const INITIAL_QUEUE_STATE: QueueState = {
  isRunning: false,
  isPaused: false,
  currentItemId: null,
  activeTabId: null,
  sessionStartedAt: null,
  pacingDelayRemaining: 0,
};

export async function getQueueState(): Promise<QueueState> {
  return storageGet<QueueState>(STORAGE_KEYS.QUEUE_STATE, INITIAL_QUEUE_STATE);
}

export async function setQueueState(state: QueueState): Promise<void> {
  await storageSet(STORAGE_KEYS.QUEUE_STATE, state);
}

/* ================= HISTORY ================= */

export async function getHistory(): Promise<HistoryRecord[]> {
  return storageGet<HistoryRecord[]>(STORAGE_KEYS.HISTORY, []);
}

export async function setHistory(history: HistoryRecord[]): Promise<void> {
  await storageSet(STORAGE_KEYS.HISTORY, history);
}

export async function addHistory(record: HistoryRecord): Promise<void> {
  const history = await getHistory();
  history.unshift(record);
  // Keep max 500 records
  if (history.length > 500) {
    history.length = 500;
  }
  await setHistory(history);
}

export async function clearHistory(): Promise<void> {
  await setHistory([]);
}

/* ================= LOGS ================= */

export async function getLogs(): Promise<LogEntry[]> {
  return storageGet<LogEntry[]>(STORAGE_KEYS.LOGS, []);
}

export async function setLogs(logs: LogEntry[]): Promise<void> {
  await storageSet(STORAGE_KEYS.LOGS, logs);
}

export async function addLogEntry(entry: LogEntry): Promise<void> {
  const logs = await getLogs();
  logs.unshift(entry);
  if (logs.length > 300) {
    logs.length = 300;
  }
  await setLogs(logs);
}

export async function clearLogs(): Promise<void> {
  await setLogs([]);
}

/* ================= SETTINGS ================= */

export async function getSettings(): Promise<AppSettings> {
  const loaded = await storageGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  // Deep merge to ensure newly added properties in DEFAULT_SETTINGS exist
  return {
    ...DEFAULT_SETTINGS,
    ...loaded,
    general: { ...DEFAULT_SETTINGS.general, ...(loaded?.general || {}) },
    queue: { ...DEFAULT_SETTINGS.queue, ...(loaded?.queue || {}) },
    ai: { ...DEFAULT_SETTINGS.ai, ...(loaded?.ai || {}) },
    facebook: { ...DEFAULT_SETTINGS.facebook, ...(loaded?.facebook || {}) },
    webhook: { ...DEFAULT_SETTINGS.webhook, ...(loaded?.webhook || {}) },
  };
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated: AppSettings = {
    ...current,
    ...partial,
    general: { ...current.general, ...(partial.general || {}) },
    queue: { ...current.queue, ...(partial.queue || {}) },
    ai: { ...current.ai, ...(partial.ai || {}) },
    facebook: { ...current.facebook, ...(partial.facebook || {}) },
    webhook: { ...current.webhook, ...(partial.webhook || {}) },
  };
  await storageSet(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

/* ================= FACEBOOK ACCOUNT ================= */

export async function getFacebookAccount(): Promise<FacebookAccountInfo | null> {
  return storageGet<FacebookAccountInfo | null>(STORAGE_KEYS.FACEBOOK_ACCOUNT, null);
}

export async function setFacebookAccount(account: FacebookAccountInfo | null): Promise<void> {
  await storageSet(STORAGE_KEYS.FACEBOOK_ACCOUNT, account);
}

/* ================= RESET ================= */

export async function resetAllData(): Promise<void> {
  await setGroups([]);
  await setPosts([]);
  await setTemplates(DEFAULT_TEMPLATES);
  await setQueue([]);
  await setQueueState(INITIAL_QUEUE_STATE);
  await setHistory([]);
  await setLogs([]);
  await updateSettings(DEFAULT_SETTINGS);
}
