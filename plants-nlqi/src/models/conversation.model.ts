/**
 * Conversation Model
 * Structures for managing conversation history and context
 */

import { QueryIntent } from './intent.model';
import { QueryResult } from './query-result.model';

export interface ConversationContext {
  conversationId: string;
  turns: ConversationTurn[];
  currentTurn: number;
  startTime: Date;
  lastUpdateTime: Date;
  metadata?: ConversationMetadata;
}

export interface ConversationTurn {
  turnNumber: number;
  userQuery: string;
  intent: QueryIntent;
  result: QueryResult;
  timestamp: Date;
}

export interface ConversationMetadata {
  userId?: string;
  sessionId?: string;
  // Track cumulative context
  allMentionedPlants?: string[]; // Plant IDs mentioned across conversation
  allStatesDiscussed?: string[]; // States discussed
  topicsDiscussed?: string[]; // General topics
}

/**
 * Conversation memory for context-aware responses
 */
export interface ConversationMemory {
  // Recent context (last N turns)
  recentTurns: ConversationTurn[];

  // Aggregated information
  mentionedPlants: Set<string>; // Plant IDs
  discussedTopics: Set<string>; // Topics like "drought-tolerant", "pollinators"
  discussedStates: Set<string>; // State codes

  // Last filters applied
  lastFilters?: QueryIntent['filters'];

  // Conversation summary
  summary?: string;
}

/**
 * Reference resolution for follow-up queries
 */
export interface ReferenceContext {
  // "it", "that plant", "those" → what do they refer to?
  lastPlants?: string[]; // Plant IDs from last result
  lastQuery?: string; // Previous query text
  lastIntent?: QueryIntent; // Previous intent

  // Pronoun and reference resolution
  resolutions: Map<string, ResolvedReference>;
}

export interface ResolvedReference {
  type: 'plant' | 'state' | 'characteristic' | 'query';
  value: any;
  confidence: number;
}

/**
 * Context-aware query with conversation history
 */
export interface ContextualQuery {
  currentQuery: string;
  conversationHistory: ConversationTurn[];
  referenceContext: ReferenceContext;
}

/**
 * Conversation state management
 */
export interface ConversationState {
  isActive: boolean;
  turnCount: number;

  // Flags for conversation flow
  isFollowUp: boolean; // Is this a follow-up to previous query?
  needsReferenceResolution: boolean; // Contains "it", "those", etc.?

  // Context window
  maxTurnsToKeep: number; // How many turns to remember
}

/**
 * Conversation initialization config
 */
export interface ConversationConfig {
  conversationId?: string;
  maxTurnsInMemory?: number; // Default: 5
  enableAutoSummarization?: boolean; // Summarize after N turns
  summarizationThreshold?: number; // Default: 10 turns
}

/**
 * Conversation summary for long conversations
 */
export interface ConversationSummary {
  conversationId: string;
  totalTurns: number;
  summary: string; // Generated summary of conversation
  keyTopics: string[];
  keyPlants: string[]; // Most discussed plants
  generatedAt: Date;
}
