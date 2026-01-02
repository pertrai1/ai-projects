/**
 * Conversation Logger Module
 *
 * Handles logging of conversations to JSON Lines format for Milestone 1.
 * Provides structured, machine-readable logs that can be analyzed in
 * future milestones (especially Milestone 6: Evaluation & Comparison).
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ChatMessage } from "./llm-client.js";
import { TARGET_MODEL } from "./config.js";

/**
 * Structure of a conversation log entry.
 *
 * Follows JSON Lines format where each entry is a complete JSON object
 * on a single line, making it easy to process with standard tools.
 */
export interface ConversationLogEntry {
  readonly timestamp: string;
  readonly model: string;
  readonly conversation: readonly ChatMessage[];
  readonly detectedContradiction: boolean;
  readonly metadata?: {
    readonly turns: number;
    readonly [key: string]: unknown;
  };
}

/**
 * Directory where conversation logs are stored.
 */
const LOGS_DIR = "logs";

/**
 * File name for conversation logs.
 */
const LOG_FILE = "conversations.jsonl";

/**
 * Ensure the logs directory exists.
 *
 * Creates the directory if it doesn't exist. Safe to call multiple times.
 */
export function ensureLogsDirectory(): void {
  try {
    mkdirSync(LOGS_DIR, { recursive: true });
  } catch (error) {
    // Directory likely already exists, which is fine
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Log a conversation to the JSON Lines file.
 *
 * Each conversation is written as a single line of JSON, appended to the file.
 * This allows for easy parsing and analysis of multiple conversation runs.
 *
 * @param conversation - Array of messages in the conversation
 * @param detectedContradiction - Whether contradiction was detected
 */
export function logConversation(
  conversation: readonly ChatMessage[],
  detectedContradiction: boolean
): void {
  ensureLogsDirectory();

  const logEntry: ConversationLogEntry = {
    timestamp: new Date().toISOString(),
    model: TARGET_MODEL,
    conversation,
    detectedContradiction,
    metadata: {
      turns: Math.floor(conversation.length / 2), // Each turn = user + assistant
    },
  };

  const logLine = JSON.stringify(logEntry) + "\n";
  const logPath = join(LOGS_DIR, LOG_FILE);

  appendFileSync(logPath, logLine, "utf-8");
}

/**
 * Get the path to the conversation log file.
 *
 * Useful for informing users where logs are stored.
 *
 * @returns Relative path to log file
 */
export function getLogFilePath(): string {
  return join(LOGS_DIR, LOG_FILE);
}
