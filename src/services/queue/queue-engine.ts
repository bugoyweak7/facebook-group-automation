import { QueueItem, QueueState, QueueStatistics, QueueStatus } from '../../types/queue';
import { HistoryRecord } from '../../types/history';
import { Group } from '../../types/group';
import { Post } from '../../types/post';
import { generateId } from '../../utils/helpers';
import {
  getQueue,
  setQueue,
  getQueueState,
  setQueueState,
  getGroups,
  setGroups,
  getPosts,
  addHistory,
} from '../storage/chrome-storage';
import { transitionQueueItem } from './state-machine';
import { logger } from '../logger/logger';

/**
 * Calculates statistics across a queue list.
 */
export function calculateQueueStats(items: QueueItem[]): QueueStatistics {
  const stats: QueueStatistics = {
    total: items.length,
    pending: 0,
    ready: 0,
    inProgress: 0,
    waitingForUser: 0,
    posted: 0,
    skipped: 0,
    failed: 0,
  };

  items.forEach(item => {
    switch (item.status) {
      case 'PENDING':
        stats.pending++;
        break;
      case 'READY':
        stats.ready++;
        break;
      case 'IN_PROGRESS':
        stats.inProgress++;
        break;
      case 'WAITING_FOR_USER':
        stats.waitingForUser++;
        break;
      case 'POSTED':
        stats.posted++;
        break;
      case 'SKIPPED':
        stats.skipped++;
        break;
      case 'FAILED':
        stats.failed++;
        break;
    }
  });

  return stats;
}

export async function createQueueItems(
  groupIds: string[],
  postId: string,
  initialStatus: QueueStatus = 'READY'
): Promise<QueueItem[]> {
  const [groups, posts] = await Promise.all([getGroups(), getPosts()]);
  const post = posts.find(p => p.id === postId);

  let order = 0;
  const newItems: QueueItem[] = groupIds.map(groupId => {
    order++;
    const grp = groups.find(
      g => g.id === groupId || g.groupId === groupId || (g.url && g.url.includes(groupId))
    );
    const fallbackUrl = grp?.url || (groupId.startsWith('http') ? groupId : `https://www.facebook.com/groups/${groupId}/`);

    return {
      id: generateId('queue'),
      groupId,
      groupName: grp ? grp.name : 'Facebook Group',
      groupUrl: fallbackUrl,
      postId,
      caption: post?.caption || post?.description || undefined,
      media: undefined, // Lean: post.images will be used directly to avoid gigabytes of duplicate base64
      status: initialStatus,
      order,
      createdAt: Date.now(),
    };
  });

  await setQueue(newItems);
  await logger.info('queue', `Created clean posting queue for ${newItems.length} groups`);
  return newItems;
}

/**
 * Reorders a queue item up or down.
 */
export async function moveQueueItem(itemId: string, direction: 'UP' | 'DOWN'): Promise<QueueItem[]> {
  const queue = await getQueue();
  const index = queue.findIndex(q => q.id === itemId);
  if (index === -1) return queue;

  const targetIndex = direction === 'UP' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= queue.length) return queue;

  const temp = queue[index];
  queue[index] = queue[targetIndex];
  queue[targetIndex] = temp;

  // Re-assign normalized sequential orders
  queue.forEach((item, idx) => {
    item.order = idx + 1;
  });

  await setQueue(queue);
  return queue;
}

/**
 * Finds the next executable item in the queue (READY or PENDING).
 */
export function findNextExecutableItem(queue: QueueItem[]): QueueItem | null {
  const readyItem = queue.find(q => q.status === 'READY');
  if (readyItem) return readyItem;
  return queue.find(q => q.status === 'PENDING') || null;
}

/**
 * Transitions an item in the queue by ID and updates storage.
 */
export async function updateItemStatus(
  itemId: string,
  newStatus: QueueStatus,
  errorMessage?: string
): Promise<{ queue: QueueItem[]; updatedItem: QueueItem }> {
  const queue = await getQueue();
  const index = queue.findIndex(q => q.id === itemId);
  if (index === -1) {
    throw new Error(`Queue item ${itemId} not found`);
  }

  const updatedItem = transitionQueueItem(queue[index], newStatus, errorMessage);
  queue[index] = updatedItem;
  await setQueue(queue);

  return { queue, updatedItem };
}

/**
 * Marks an item as POSTED, creates History record, and updates group statistics.
 */
export async function recordItemPosted(itemId: string, notes?: string): Promise<QueueItem> {
  const { queue, updatedItem } = await updateItemStatus(itemId, 'POSTED');

  // Load group and post for history
  const [groups, posts] = await Promise.all([getGroups(), getPosts()]);
  const group = groups.find(g => g.id === updatedItem.groupId);
  const post = posts.find(p => p.id === updatedItem.postId);

  const durationSeconds = updatedItem.startedAt
    ? Math.max(1, Math.round((Date.now() - updatedItem.startedAt) / 1000))
    : undefined;

  const historyRecord: HistoryRecord = {
    id: generateId('hist'),
    queueItemId: updatedItem.id,
    groupId: updatedItem.groupId,
    groupName: group ? group.name : 'Unknown Group',
    groupUrl: group ? group.url : '',
    postId: updatedItem.postId,
    postTitle: post ? post.title : 'Untitled Post',
    productName: post ? post.productName : '',
    status: 'POSTED',
    postedAt: Date.now(),
    notes: notes || 'User confirmed posting on Facebook',
    durationSeconds,
  };

  await addHistory(historyRecord);

  // Update group post count and lastPostedAt
  if (group) {
    group.postCount = (group.postCount || 0) + 1;
    group.lastPostedAt = Date.now();
    group.status = 'POSTED';
    await setGroups(groups);
  }

  await logger.success('queue', `Post marked as POSTED for group: ${group ? group.name : updatedItem.groupId}`);

  return updatedItem;
}

/**
 * Marks an item as SKIPPED and records history.
 */
export async function recordItemSkipped(itemId: string, reason = 'User skipped'): Promise<QueueItem> {
  const { updatedItem } = await updateItemStatus(itemId, 'SKIPPED');

  const [groups, posts] = await Promise.all([getGroups(), getPosts()]);
  const group = groups.find(g => g.id === updatedItem.groupId);
  const post = posts.find(p => p.id === updatedItem.postId);

  const historyRecord: HistoryRecord = {
    id: generateId('hist'),
    queueItemId: updatedItem.id,
    groupId: updatedItem.groupId,
    groupName: group ? group.name : 'Unknown Group',
    groupUrl: group ? group.url : '',
    postId: updatedItem.postId,
    postTitle: post ? post.title : 'Untitled Post',
    productName: post ? post.productName : '',
    status: 'SKIPPED',
    postedAt: Date.now(),
    notes: reason,
  };

  await addHistory(historyRecord);
  await logger.info('queue', `Post marked as SKIPPED for group: ${group ? group.name : updatedItem.groupId}`);

  return updatedItem;
}

/**
 * Marks an item as FAILED and records history.
 */
export async function recordItemFailed(itemId: string, error: string): Promise<QueueItem> {
  const { updatedItem } = await updateItemStatus(itemId, 'FAILED', error);

  const [groups, posts] = await Promise.all([getGroups(), getPosts()]);
  const group = groups.find(g => g.id === updatedItem.groupId);
  const post = posts.find(p => p.id === updatedItem.postId);

  const historyRecord: HistoryRecord = {
    id: generateId('hist'),
    queueItemId: updatedItem.id,
    groupId: updatedItem.groupId,
    groupName: group ? group.name : 'Unknown Group',
    groupUrl: group ? group.url : '',
    postId: updatedItem.postId,
    postTitle: post ? post.title : 'Untitled Post',
    productName: post ? post.productName : '',
    status: 'FAILED',
    postedAt: Date.now(),
    notes: `Error: ${error}`,
  };

  await addHistory(historyRecord);
  await logger.error('queue', `Post FAILED for group: ${group ? group.name : updatedItem.groupId}`, { error });

  return updatedItem;
}
