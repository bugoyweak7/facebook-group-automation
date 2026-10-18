import { BackupData } from '../../types/settings';
import { Group } from '../../types/group';
import { Post, PostTemplate } from '../../types/post';
import { QueueItem } from '../../types/queue';
import { HistoryRecord } from '../../types/history';
import {
  getGroups,
  setGroups,
  getPosts,
  setPosts,
  getTemplates,
  setTemplates,
  getQueue,
  setQueue,
  getHistory,
  setHistory,
  getSettings,
  updateSettings,
} from '../storage/chrome-storage';
import { validateBackupData } from '../../utils/validators';
import { logger } from '../logger/logger';

export async function createFullBackup(): Promise<BackupData> {
  const [groups, posts, templates, queue, history, settings] = await Promise.all([
    getGroups(),
    getPosts(),
    getTemplates(),
    getQueue(),
    getHistory(),
    getSettings(),
  ]);

  const backup: BackupData = {
    version: '1.0.0',
    exportedAt: Date.now(),
    groups,
    posts,
    templates,
    queue,
    history,
    settings,
  };

  await logger.info('dashboard', `Exported full system backup (${groups.length} groups, ${posts.length} posts)`);
  return backup;
}

export interface RestorePreview {
  valid: boolean;
  version: string;
  exportedAt: number;
  groupCount: number;
  postCount: number;
  templateCount: number;
  queueCount: number;
  historyCount: number;
  errors: string[];
}

export function inspectBackupJson(jsonString: string): { preview: RestorePreview | null; parsed: BackupData | null; error?: string } {
  try {
    const raw = JSON.parse(jsonString);
    const val = validateBackupData(raw);

    if (!val.valid || !val.parsed) {
      return {
        preview: null,
        parsed: null,
        error: val.errors.join('; '),
      };
    }

    const data = val.parsed;
    const preview: RestorePreview = {
      valid: true,
      version: data.version || '1.0.0',
      exportedAt: data.exportedAt || Date.now(),
      groupCount: Array.isArray(data.groups) ? data.groups.length : 0,
      postCount: Array.isArray(data.posts) ? data.posts.length : 0,
      templateCount: Array.isArray(data.templates) ? data.templates.length : 0,
      queueCount: Array.isArray(data.queue) ? data.queue.length : 0,
      historyCount: Array.isArray(data.history) ? data.history.length : 0,
      errors: [],
    };

    return { preview, parsed: data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { preview: null, parsed: null, error: `Invalid JSON format: ${msg}` };
  }
}

export async function restoreFromBackup(backup: BackupData, mode: 'REPLACE' | 'MERGE' = 'REPLACE'): Promise<void> {
  if (mode === 'REPLACE') {
    if (Array.isArray(backup.groups)) await setGroups(backup.groups as Group[]);
    if (Array.isArray(backup.posts)) await setPosts(backup.posts as Post[]);
    if (Array.isArray(backup.templates)) await setTemplates(backup.templates as PostTemplate[]);
    if (Array.isArray(backup.queue)) await setQueue(backup.queue as QueueItem[]);
    if (Array.isArray(backup.history)) await setHistory(backup.history as HistoryRecord[]);
    if (backup.settings) await updateSettings(backup.settings);
  } else {
    // MERGE mode
    const [currGroups, currPosts, currTemplates] = await Promise.all([
      getGroups(),
      getPosts(),
      getTemplates(),
    ]);

    const existingGroupIds = new Set(currGroups.map(g => g.id));
    const mergedGroups = [...currGroups];
    ((backup.groups as Group[]) || []).forEach(g => {
      if (!existingGroupIds.has(g.id)) {
        mergedGroups.push(g);
      }
    });
    await setGroups(mergedGroups);

    const existingPostIds = new Set(currPosts.map(p => p.id));
    const mergedPosts = [...currPosts];
    ((backup.posts as Post[]) || []).forEach(p => {
      if (!existingPostIds.has(p.id)) {
        mergedPosts.push(p);
      }
    });
    await setPosts(mergedPosts);

    const existingTplIds = new Set(currTemplates.map(t => t.id));
    const mergedTemplates = [...currTemplates];
    ((backup.templates as PostTemplate[]) || []).forEach(t => {
      if (!existingTplIds.has(t.id)) {
        mergedTemplates.push(t);
      }
    });
    await setTemplates(mergedTemplates);
  }

  await logger.success('dashboard', `Successfully restored backup in ${mode} mode`);
}
