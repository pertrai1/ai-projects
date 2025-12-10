/**
 * Conversation Service
 * Manages conversation history, context, and memory across turns
 */

import {
  ConversationContext,
  ConversationTurn,
  ConversationMemory,
  ReferenceContext,
  ConversationConfig,
  QueryIntent,
  QueryResult,
} from '../models';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class ConversationService {
  private conversations: Map<string, ConversationContext>;
  private maxTurnsInMemory: number;

  constructor(config?: ConversationConfig) {
    this.conversations = new Map();
    this.maxTurnsInMemory = config?.maxTurnsInMemory || 5;
    logger.info('Conversation service initialized', { maxTurnsInMemory: this.maxTurnsInMemory });
  }

  /**
   * Start a new conversation
   */
  startConversation(conversationId?: string): string {
    const id = conversationId || uuidv4();

    const context: ConversationContext = {
      conversationId: id,
      turns: [],
      currentTurn: 0,
      startTime: new Date(),
      lastUpdateTime: new Date(),
      metadata: {
        allMentionedPlants: [],
        allStatesDiscussed: [],
        topicsDiscussed: [],
      },
    };

    this.conversations.set(id, context);
    logger.info('Conversation started', { conversationId: id });

    return id;
  }

  /**
   * Add a turn to the conversation
   */
  addTurn(
    conversationId: string,
    userQuery: string,
    intent: QueryIntent,
    result: QueryResult
  ): void {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const turn: ConversationTurn = {
      turnNumber: context.currentTurn + 1,
      userQuery,
      intent,
      result,
      timestamp: new Date(),
    };

    context.turns.push(turn);
    context.currentTurn++;
    context.lastUpdateTime = new Date();

    // Update metadata
    this.updateMetadata(context, turn);

    // Trim old turns if exceeding max
    if (context.turns.length > this.maxTurnsInMemory * 2) {
      context.turns = context.turns.slice(-this.maxTurnsInMemory);
    }

    logger.debug('Turn added', {
      conversationId,
      turnNumber: turn.turnNumber,
      totalTurns: context.turns.length,
    });
  }

  /**
   * Get conversation memory for context
   */
  getMemory(conversationId: string): ConversationMemory {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Get recent turns
    const recentTurns = context.turns.slice(-this.maxTurnsInMemory);

    // Aggregate mentioned plants
    const mentionedPlants = new Set<string>();
    recentTurns.forEach((turn) => {
      turn.result.plants.forEach((match) => {
        mentionedPlants.add(match.plant.id);
      });
    });

    // Aggregate topics
    const topics = new Set<string>();
    recentTurns.forEach((turn) => {
      // Extract topics from filters
      if (turn.intent.filters.growthHabit) {
        turn.intent.filters.growthHabit.forEach((h) => topics.add(h.toLowerCase()));
      }
      if (turn.intent.filters.wildlifeValue) {
        turn.intent.filters.wildlifeValue.forEach((w) => topics.add(w.toLowerCase()));
      }
      if (turn.intent.filters.characteristics?.waterNeeds) {
        topics.add(turn.intent.filters.characteristics.waterNeeds.toLowerCase());
      }
    });

    // Aggregate states
    const states = new Set<string>();
    recentTurns.forEach((turn) => {
      if (turn.intent.filters.states) {
        turn.intent.filters.states.forEach((s) => states.add(s));
      }
    });

    // Get last filters
    const lastFilters =
      recentTurns.length > 0 ? recentTurns[recentTurns.length - 1].intent.filters : undefined;

    return {
      recentTurns,
      mentionedPlants,
      discussedTopics: topics,
      discussedStates: states,
      lastFilters,
    };
  }

  /**
   * Get reference context for resolving pronouns
   */
  getReferenceContext(conversationId: string): ReferenceContext {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const lastTurn = context.turns[context.turns.length - 1];

    if (!lastTurn) {
      return {
        resolutions: new Map(),
      };
    }

    const lastPlants = lastTurn.result.plants.map((match) => match.plant.id);
    const lastQuery = lastTurn.userQuery;
    const lastIntent = lastTurn.intent;

    return {
      lastPlants,
      lastQuery,
      lastIntent,
      resolutions: new Map(),
    };
  }

  /**
   * Check if query likely references previous context
   */
  isFollowUpQuery(query: string): boolean {
    const followUpPatterns = [
      /\b(those|these|them|it|that)\b/i,
      /\b(which of|any of|some of)\b/i,
      /\b(also|too|as well)\b/i,
      /^(what about|how about)/i,
      /\b(instead|rather)\b/i,
      /\b(more|other|another)\b/i,
    ];

    return followUpPatterns.some((pattern) => pattern.test(query));
  }

  /**
   * Get conversation context
   */
  getContext(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * End a conversation
   */
  endConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
    logger.info('Conversation ended', { conversationId });
  }

  /**
   * Clear all conversations
   */
  clearAll(): void {
    this.conversations.clear();
    logger.info('All conversations cleared');
  }

  /**
   * Get all active conversation IDs
   */
  getActiveConversations(): string[] {
    return Array.from(this.conversations.keys());
  }

  /**
   * Update conversation metadata
   */
  private updateMetadata(context: ConversationContext, turn: ConversationTurn): void {
    if (!context.metadata) {
      context.metadata = {
        allMentionedPlants: [],
        allStatesDiscussed: [],
        topicsDiscussed: [],
      };
    }

    // Add mentioned plants
    turn.result.plants.forEach((match) => {
      if (!context.metadata!.allMentionedPlants!.includes(match.plant.id)) {
        context.metadata!.allMentionedPlants!.push(match.plant.id);
      }
    });

    // Add discussed states
    if (turn.intent.filters.states) {
      turn.intent.filters.states.forEach((state) => {
        if (!context.metadata!.allStatesDiscussed!.includes(state)) {
          context.metadata!.allStatesDiscussed!.push(state);
        }
      });
    }

    // Add topics
    if (turn.intent.filters.growthHabit) {
      turn.intent.filters.growthHabit.forEach((habit) => {
        if (!context.metadata!.topicsDiscussed!.includes(habit)) {
          context.metadata!.topicsDiscussed!.push(habit);
        }
      });
    }
  }

  /**
   * Get conversation summary
   */
  getSummary(conversationId: string): string {
    const context = this.conversations.get(conversationId);
    if (!context) {
      return 'No conversation found';
    }

    const parts: string[] = [];
    parts.push(`Conversation: ${context.currentTurn} turns`);

    if (context.metadata?.allMentionedPlants && context.metadata.allMentionedPlants.length > 0) {
      parts.push(`Plants discussed: ${context.metadata.allMentionedPlants.length}`);
    }

    if (context.metadata?.allStatesDiscussed && context.metadata.allStatesDiscussed.length > 0) {
      parts.push(`States: ${context.metadata.allStatesDiscussed.join(', ')}`);
    }

    if (context.metadata?.topicsDiscussed && context.metadata.topicsDiscussed.length > 0) {
      parts.push(`Topics: ${context.metadata.topicsDiscussed.slice(0, 3).join(', ')}`);
    }

    return parts.join(' • ');
  }
}
