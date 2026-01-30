/**
 * Structured logging utility
 *
 * Learning focus (Phase 0):
 * - Structured logging helps debug and understand system behavior
 * - Different log levels for different situations
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class Logger {
    constructor(minLevel = LogLevel.INFO, printToConsole = true) {
        this.entries = [];
        this.minLevel = minLevel;
        this.printToConsole = printToConsole;
    }
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    error(message, data) {
        this.log(LogLevel.ERROR, message, data);
    }
    log(level, message, data) {
        if (level < this.minLevel)
            return;
        const entry = {
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
    getEntries() {
        return [...this.entries];
    }
    clear() {
        this.entries = [];
    }
    setMinLevel(level) {
        this.minLevel = level;
    }
}
// Global logger instance
export const globalLogger = new Logger(LogLevel.INFO);
//# sourceMappingURL=logger.js.map