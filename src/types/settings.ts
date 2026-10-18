import { AILanguage, AIProviderType, AIStyle } from './ai';

export interface GeneralSettings {
  extensionName: string;
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  defaultLanguage: AILanguage;
}

export interface QueueSettings {
  autoOpenNextGroup: boolean;
  requireConfirmation: boolean;
  delayBetweenItemsSec: number;     // Human pacing delay between posts (e.g. 15s)
  maxItemsPerSession: number;        // Prevent runaway sessions
}

export interface AISettings {
  provider: AIProviderType;
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
  defaultLanguage: AILanguage;
  defaultStyle: AIStyle;
}

export interface FacebookSettings {
  supportedDomains: string[];
  pageDetectionIntervalMs: number;
  helperDockEnabled: boolean;
  helperDockCollapsedDefault: boolean;
}

export interface WebhookSettings {
  enabled: boolean;
  endpoint: string;
  secret: string;
}

export interface AppSettings {
  general: GeneralSettings;
  queue: QueueSettings;
  ai: AISettings;
  facebook: FacebookSettings;
  webhook: WebhookSettings;
  hasCompletedOnboarding: boolean;
}

export interface BackupData {
  version: string;
  exportedAt: number;
  groups: unknown[];
  posts: unknown[];
  templates: unknown[];
  queue: unknown[];
  history: unknown[];
  settings: AppSettings;
}
