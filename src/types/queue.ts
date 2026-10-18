export type QueueStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'POSTED'
  | 'SKIPPED'
  | 'FAILED';

export interface QueueItem {
  id: string;
  groupId: string;
  groupName?: string;
  groupUrl?: string;
  expectedGroupId?: string;
  postId: string;
  caption?: string;
  media?: string[];            // Images / video references associated with this item
  status: QueueStatus;
  order: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  errorMessage?: string;
  retryCount?: number;
}

export interface QueueState {
  isRunning: boolean;
  isPaused: boolean;
  currentItemId: string | null;
  activeTabId?: number | null;
  expectedGroupId?: string | null;
  expectedGroupName?: string | null;
  expectedGroupUrl?: string | null;
  currentGroupMatch?: boolean;
  mismatchWarning?: string | null;
  sessionStartedAt?: number | null;
  sessionTotalItems?: number;
  sessionCompletedItems?: number;
  pacingDelayRemaining?: number; // seconds remaining before next item
}

export interface QueueStatistics {
  total: number;
  pending: number;
  ready: number;
  inProgress: number;
  waitingForUser: number;
  posted: number;
  skipped: number;
  failed: number;
}
