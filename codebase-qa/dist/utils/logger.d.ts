/**
 * Structured logging utility
 *
 * Learning focus (Phase 0):
 * - Structured logging helps debug and understand system behavior
 * - Different log levels for different situations
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    data?: unknown;
}
export declare class Logger {
    private entries;
    private minLevel;
    private printToConsole;
    constructor(minLevel?: LogLevel, printToConsole?: boolean);
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    private log;
    getEntries(): LogEntry[];
    clear(): void;
    setMinLevel(level: LogLevel): void;
}
export declare const globalLogger: Logger;
//# sourceMappingURL=logger.d.ts.map