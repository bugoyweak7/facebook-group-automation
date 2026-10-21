export type AutoJoinStatus =
  | 'IDLE'
  | 'SEARCHING'
  | 'JOINING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'STOPPED'
  | 'ERROR';

export type AutoJoinItemStatus =
  | 'READY_TO_JOIN'
  | 'JOINING'
  | 'JOINED'
  | 'REQUESTED'
  | 'ALREADY_JOINED'
  | 'FAILED'
  | 'SKIPPED';

export interface AutoJoinConfig {
  searchUrl: string;
  delaySec: number;
  maxGroups: number;
  autoAnswerQuestions: boolean;
  defaultAnswer: string;
  saveToGroups: boolean;
  selectedCategory?: string;
}

export interface AutoJoinGroupItem {
  id: string;
  groupId: string;
  name: string;
  url: string;
  privacy: 'PUBLIC' | 'PRIVATE' | 'UNKNOWN';
  membersText?: string;
  status: AutoJoinItemStatus;
  error?: string;
  joinedAt?: number;
}

export interface AutoJoinState {
  status: AutoJoinStatus;
  searchUrl: string;
  query: string;
  totalFound: number;
  joinedCount: number;
  requestedCount: number;
  alreadyJoinedCount: number;
  failedCount: number;
  skippedCount: number;
  currentIndex: number;
  currentGroupName: string;
  countdownSec: number;
  message: string;
  groups: AutoJoinGroupItem[];
  startedAt?: number;
  finishedAt?: number;
}

export const INITIAL_AUTO_JOIN_STATE: AutoJoinState = {
  status: 'IDLE',
  searchUrl: '',
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
  message: 'Enter any Facebook search link to start auto-joining.',
  groups: [],
};

export const DEFAULT_AUTO_JOIN_CONFIG: AutoJoinConfig = {
  searchUrl: '',
  delaySec: 0,
  maxGroups: 0, // 0 = all
  autoAnswerQuestions: true,
  defaultAnswer: 'Yes, I agree to the group rules and guidelines.',
  saveToGroups: true,
  selectedCategory: 'Auto Joined',
};
