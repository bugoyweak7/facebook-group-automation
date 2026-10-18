import { Group, DiscoveryProgress } from './group';
import { Post } from './post';
import { QueueItem, QueueState } from './queue';

export type RuntimeMessageType =
  | 'GET_QUEUE_STATE'
  | 'QUEUE_STATE_RESPONSE'
  | 'START_QUEUE'
  | 'PAUSE_QUEUE'
  | 'RESUME_QUEUE'
  | 'STOP_QUEUE'
  | 'SKIP_CURRENT_ITEM'
  | 'RETRY_CURRENT_ITEM'
  | 'MARK_AS_POSTED'
  | 'FB_PAGE_DETECTED'
  | 'GET_ACTIVE_POST_FOR_TAB'
  | 'ACTIVE_POST_FOR_TAB_RESPONSE'
  | 'OPEN_DASHBOARD'
  | 'TRIGGER_NOTIFICATION'
  | 'START_GROUP_DISCOVERY'
  | 'CANCEL_GROUP_DISCOVERY'
  | 'GROUP_DISCOVERY_PROGRESS'
  | 'GROUP_BATCH_DISCOVERED'
  | 'GROUPS_DISCOVERED'
  | 'GET_DISCOVERY_STATUS'
  | 'GET_DEBUG_METRICS'
  | 'CHECK_FACEBOOK_SESSION'
  | 'DETECT_FB_SESSION'
  | 'FB_USER_PROFILE_DETECTED'
  | 'GET_FACEBOOK_USER_INFO'
  | 'ACCOUNT_CONTEXT_CHANGED'
  | 'VERIFY_CURRENT_GROUP'
  | 'CREATE_AND_START_QUEUE'
  | 'UPDATE_QUEUE_ITEM_CAPTION'
  | 'FOCUS_POSTING_TAB'
  | 'FOCUS_ACTIVE_POSTING_TAB';

export interface RuntimeMessage<T = unknown> {
  type: RuntimeMessageType;
  payload?: T;
}

export interface ActivePostTabPayload {
  queueItem: QueueItem | null;
  group: Group | null;
  post: Post | null;
  caption: string;
  formattedPost: string;
  media: string[];
  queueIndex: number;
  totalQueueItems: number;
  postedCount?: number;
  isGroupMatch: boolean;
  expectedGroupName?: string;
  expectedGroupUrl?: string;
  currentDetectedGroupName?: string;
  currentDetectedGroupId?: string;
}

export interface FbPageDetectedPayload {
  url: string;
  groupIdOrSlug: string;
  pageTitle: string;
}

export interface GroupDiscoveryResultPayload {
  groups: Partial<Group>[];
  sourceUrl: string;
  isLoggedIn: boolean;
  totalFoundOnPage: number;
}
