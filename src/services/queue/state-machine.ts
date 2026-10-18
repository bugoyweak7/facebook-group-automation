import { QueueItem, QueueStatus } from '../../types/queue';

export class QueueTransitionError extends Error {
  constructor(
    public readonly from: QueueStatus,
    public readonly to: QueueStatus,
    message?: string
  ) {
    super(message || `Invalid queue transition from ${from} to ${to}`);
    this.name = 'QueueTransitionError';
  }
}

/**
 * Valid allowed transitions map.
 */
const VALID_TRANSITIONS: Record<QueueStatus, QueueStatus[]> = {
  PENDING: ['READY', 'IN_PROGRESS', 'SKIPPED', 'FAILED', 'POSTED'],
  READY: ['IN_PROGRESS', 'SKIPPED', 'PENDING', 'FAILED', 'POSTED'],
  IN_PROGRESS: ['WAITING_FOR_USER', 'FAILED', 'SKIPPED', 'READY', 'POSTED'],
  WAITING_FOR_USER: ['POSTED', 'SKIPPED', 'FAILED', 'READY', 'IN_PROGRESS'],
  POSTED: ['READY'], // Can reset/retry to ready
  SKIPPED: ['READY', 'PENDING'], // Can un-skip or retry
  FAILED: ['READY', 'PENDING', 'SKIPPED'], // Can retry
};

/**
 * Checks if a transition between two states is valid.
 */
export function isValidTransition(from: QueueStatus, to: QueueStatus): boolean {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

/**
 * Validates and applies a state transition to a QueueItem.
 * Returns a new immutable copy of the QueueItem.
 */
export function transitionQueueItem(
  item: QueueItem,
  newStatus: QueueStatus,
  errorMessage?: string
): QueueItem {
  if (!isValidTransition(item.status, newStatus)) {
    throw new QueueTransitionError(item.status, newStatus);
  }

  const now = Date.now();
  const updated: QueueItem = {
    ...item,
    status: newStatus,
  };

  if (newStatus === 'IN_PROGRESS' && !item.startedAt) {
    updated.startedAt = now;
  }

  if (newStatus === 'POSTED' || newStatus === 'SKIPPED' || newStatus === 'FAILED') {
    updated.completedAt = now;
  }

  if (newStatus === 'FAILED') {
    updated.errorMessage = errorMessage || 'Operation failed';
    updated.retryCount = (item.retryCount || 0) + 1;
  } else if (newStatus === 'READY' && item.status === 'FAILED') {
    // Retrying
    updated.errorMessage = undefined;
  }

  return updated;
}
