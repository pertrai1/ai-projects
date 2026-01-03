/**
 * Conversation Logger Module
 *
 * Handles logging of conversations to JSON Lines format.
 * Extended to support adaptive metadata.
 * Provides structured, machine-readable logs that can be analyzed in
 * future milestones (especially Milestone 6: Evaluation & Comparison).
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ChatMessage } from "./llm-client.js";
import { TARGET_MODEL } from "./config.js";
import type { ResponseCategory } from "./classifier.js";
import type { StrategyName } from "./templates.js";

/**
 * Adaptive metadata.
 *
 * Optional fields that are only present in adaptive mode logs.
 * Static baseline logs won't have these fields (backward compatible).
 *
 */
export interface AdaptiveMetadata {
  readonly runId: number;
  readonly responseCategory: ResponseCategory;
  readonly selectedStrategy: StrategyName;
  readonly strategyRationale: string;
  readonly classificationRationale: string;
  readonly matchedPatterns: readonly string[];
  readonly tacticsUsed?: readonly string[];
  readonly contentTopicId?: string;
  readonly strategyIntent?: string;
}

/**
 * Structure of a conversation log entry.
 *
 * Follows JSON Lines format where each entry is a complete JSON object
 * on a single line, making it easy to process with standard tools.
 *
 */
export interface ConversationLogEntry {
  readonly timestamp: string;
  readonly model: string;
  readonly conversation: readonly ChatMessage[];
  readonly detectedContradiction: boolean;
  readonly metadata?: {
    readonly turns: number;
    readonly adaptive?: AdaptiveMetadata;
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
 * Log a conversation to the JSON Lines file (static baseline mode).
 *
 * Each conversation is written as a single line of JSON, appended to the file.
 * This allows for easy parsing and analysis of multiple conversation runs.
 *
 * @param conversation - Array of messages in the conversation
 * @param detectedContradiction - Whether contradiction was detected
 */
export function logConversation(
  conversation: readonly ChatMessage[],
  detectedContradiction: boolean,
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
 * Log a conversation with adaptive metadata (adaptive mode).
 *
 * Extended version that includes classification and
 * strategy selection metadata.
 *
 * @param conversation - Array of messages in the conversation
 * @param detectedContradiction - Whether contradiction was detected
 * @param adaptiveMetadata - Metadata from adaptive execution
 */
export function logAdaptiveConversation(
  conversation: readonly ChatMessage[],
  detectedContradiction: boolean,
  adaptiveMetadata: AdaptiveMetadata,
): void {
  ensureLogsDirectory();

  const logEntry: ConversationLogEntry = {
    timestamp: new Date().toISOString(),
    model: TARGET_MODEL,
    conversation,
    detectedContradiction,
    metadata: {
      turns: Math.floor(conversation.length / 2),
      adaptive: adaptiveMetadata,
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
