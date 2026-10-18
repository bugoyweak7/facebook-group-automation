export type HistoryStatus = 'POSTED' | 'SKIPPED' | 'FAILED';

export interface HistoryRecord {
  id: string;
  queueItemId?: string;
  groupId: string;
  groupName: string;
  groupUrl: string;
  postId: string;
  postTitle: string;
  productName: string;
  status: HistoryStatus;
  postedAt: number;
  notes?: string;
  durationSeconds?: number;
}

export interface HistoryFilter {
  status?: HistoryStatus | 'ALL';
  search?: string;
  startDate?: number;
  endDate?: number;
}
