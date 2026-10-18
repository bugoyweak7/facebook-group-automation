import { LogEntry, LogLevel, LogSource } from '../../types/log';
import { generateId } from '../../utils/helpers';
import { addLogEntry } from '../storage/chrome-storage';

class LoggerService {
  private async writeLog(
    level: LogLevel,
    source: LogSource,
    message: string,
    details?: Record<string, unknown> | string
  ): Promise<LogEntry> {
    const entry: LogEntry = {
      id: generateId('log'),
      timestamp: Date.now(),
      level,
      source,
      message,
      details,
    };

    // Console output for debugging
    const prefix = `[AGP:${source.toUpperCase()}][${level}]`;
    if (level === 'ERROR') {
      console.error(prefix, message, details || '');
    } else if (level === 'WARNING') {
      console.warn(prefix, message, details || '');
    } else {
      console.log(prefix, message, details || '');
    }

    try {
      await addLogEntry(entry);
    } catch (err) {
      console.warn('Failed to persist log entry:', err);
    }

    return entry;
  }

  info(source: LogSource, message: string, details?: Record<string, unknown> | string): Promise<LogEntry> {
    return this.writeLog('INFO', source, message, details);
  }

  success(source: LogSource, message: string, details?: Record<string, unknown> | string): Promise<LogEntry> {
    return this.writeLog('SUCCESS', source, message, details);
  }

  warning(source: LogSource, message: string, details?: Record<string, unknown> | string): Promise<LogEntry> {
    return this.writeLog('WARNING', source, message, details);
  }

  error(source: LogSource, message: string, details?: Record<string, unknown> | string): Promise<LogEntry> {
    return this.writeLog('ERROR', source, message, details);
  }
}

export const logger = new LoggerService();
