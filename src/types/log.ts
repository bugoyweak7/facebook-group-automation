export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type LogSource = 'background' | 'popup' | 'dashboard' | 'content' | 'queue' | 'ai';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: Record<string, unknown> | string;
}

export interface LogFilter {
  level?: LogLevel | 'ALL';
  source?: LogSource | 'ALL';
  search?: string;
}
