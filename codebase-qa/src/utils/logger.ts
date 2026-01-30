/**
 * Structured logging utility
 *
 * Learning focus (Phase 0):
 * - Structured logging helps debug and understand system behavior
 * - Different log levels for different situations
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
}

export class Logger {
  private entries: LogEntry[] = [];
  private minLevel: LogLevel;
  private printToConsole: boolean;

  constructor(minLevel: LogLevel = LogLevel.INFO, printToConsole: boolean = true) {
    this.minLevel = minLevel;
    this.printToConsole = printToConsole;
  }

  debug(message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: unknown) {
    this.log(LogLevel.ERROR, message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.entries.push(entry);

    if (this.printToConsole) {
      const levelName = LogLevel[level];
      const timestamp = new Date(entry.timestamp).toISOString();
      console.log(`[${timestamp}] ${levelName}: ${message}`, data ?? '');
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear() {
    this.entries = [];
  }

  setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }
}

// Global logger instance
export const globalLogger = new Logger(LogLevel.INFO);
