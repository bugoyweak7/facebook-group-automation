export type GroupStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'POSTED'
  | 'SKIPPED'
  | 'FAILED'
  | 'DISABLED';

export type GroupPrivacy = 'PUBLIC' | 'PRIVATE' | 'UNKNOWN';

export interface Group {
  id: string;
  name: string;
  url: string;
  groupId?: string;             // Canonical Facebook group ID or slug (never fabricated)
  privacy?: GroupPrivacy;
  imageUrl?: string;            // Real group photo or cover thumbnail
  category?: string;
  location?: string;
  notes?: string;
  enabled: boolean;
  selected?: boolean;           // Multi-selection state for queue creation
  status: GroupStatus;
  postCount: number;
  lastPostedAt?: number;
  verified?: boolean;           // True only when confirmed by verification pipeline
  source?: 'facebook-ui' | 'manual' | 'import';
  accountContext?: string;      // Scoped Facebook Account Identifier (e.g. user ID or name)
  discoveredAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface FacebookUserProfile {
  isLoggedIn: boolean;
  name: string;
  profileUrl?: string;
  avatarUrl?: string;
  userId?: string;
}

export interface DiscoveryScanResult {
  isLoggedIn: boolean;
  groups: any[];
  totalFound: number;
  targetCount: number | null;
  isPartial: boolean;
  outcome: ScanOutcome;
  completionReason: CompletionReason | null;
  debugMetrics: DebugMetrics;
}

export interface DiscoveredGroupCandidate {
  name: string;
  url: string;
  groupId: string;
  privacy: GroupPrivacy;
  imageUrl?: string;
  verified?: boolean;
}

export type DiscoveryState =
  | 'NOT_CONNECTED'
  | 'FACEBOOK_NOT_OPEN'
  | 'DISCOVERING'
  | 'DISCOVERY_COMPLETE'
  | 'DISCOVERY_PARTIAL'
  | 'DISCOVERY_FAILED';

export type ScanOutcome =
  | 'COMPLETE'
  | 'PARTIAL'
  | 'FAILED'
  | 'CANCELLED';

export type CompletionReason =
  | 'TARGET_REACHED'
  | 'LIST_END'
  | 'STAGNANT_TIMEOUT'
  | 'USER_CANCELLED'
  | 'FACEBOOK_UI_LIMIT'
  | 'NOT_LOGGED_IN'
  | 'NO_JOINED_GROUP_INTERFACE';

export type TargetCountStatus =
  | 'CONFIRMED'
  | 'UNCERTAIN'
  | 'UNAVAILABLE';

export interface DebugMetrics {
  candidateCount: number;
  verifiedCount: number;
  duplicatesRemoved: number;
  rejectedCount: number;
  scrollIterations: number;
  mutationEvents: number;
  targetCount: number | null;
  targetCountStatus: TargetCountStatus;
  completionReason: CompletionReason | null;
  scanDurationMs: number;
  lastNewGroupTimestamp: number | null;
}

export interface DiscoveryProgress {
  state: DiscoveryState;
  outcome?: ScanOutcome;
  completionReason?: CompletionReason;
  targetCountStatus?: TargetCountStatus;
  targetCount?: number | null;
  isPartial?: boolean;
  foundCount: number;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  message?: string;
  accountContext?: string;
  debugMetrics?: DebugMetrics;
  lastDiscoveredAt?: number;
}

export interface GroupFilter {
  search?: string;
  status?: GroupStatus | 'ALL';
  category?: string | 'ALL';
  privacy?: GroupPrivacy | 'ALL';
  location?: string;
  enabledOnly?: boolean;
}

export interface GroupImportRow {
  name: string;
  url: string;
  category?: string;
  location?: string;
  notes?: string;
  privacy?: GroupPrivacy;
}

export interface GroupValidationResult {
  valid: boolean;
  errors: string[];
  cleanUrl?: string;
  groupId?: string;
}

export interface FacebookAccountInfo {
  isLoggedIn: boolean;
  name: string;
  profileUrl?: string;
  avatarUrl?: string;
  userId?: string;
  accountContext?: string;
  totalGroupsCount?: number;
  lastSyncedAt: number;
}

export interface AccountGroupStorage {
  accountContext: string;
  accountInfo: FacebookAccountInfo;
  groups: Group[];
  lastSyncedAt: number;
  lastOutcome?: ScanOutcome;
  lastCompletionReason?: CompletionReason;
  debugMetrics?: DebugMetrics;
}

