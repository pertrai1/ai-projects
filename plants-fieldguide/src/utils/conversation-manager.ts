/**
 * Conversation Manager - Session State and Context Tracking
 * In a multi-turn conversation, we need to remember:
 * 1. Previous questions asked
 * 2. Answers provided
 * 3. Context from the conversation
 * 4. Follow-up relationships
 *
 * EXAMPLE CONVERSATION:
 * User: "What is FACW?"
 * Bot: "FACW stands for Facultative Wetland..."
 * User: "What about OBL?"  ← Needs to understand "about" refers to wetland codes
 * Bot: "OBL stands for Obligate..."
 * User: "Compare them"     ← Needs to know "them" = FACW and OBL
 *
 * Without memory, the bot wouldn't understand follow-ups!
 */

import type { RoutingDecision } from "./agent-router.js";
import type { RetrievalStrategy } from "./adaptive-retrieval.js";

// A single turn in the conversation
export interface ConversationTurn {
  id: string;
  timestamp: Date;
  question: string;
  answer: string;
  routing?: RoutingDecision;
  strategy?: RetrievalStrategy;
  confidence?: string;
  sourcesUsed?: number;
}

// Complete conversation session
export interface ConversationSession {
  id: string;
  startedAt: Date;
  lastActiveAt: Date;
  turns: ConversationTurn[];
  context: ConversationContext;
}

// Contextual information extracted from conversation
export interface ConversationContext {
  topics: string[]; // Topics discussed (e.g., ["wetland indicators", "FACW"])
  entities: string[]; // Named entities mentioned (e.g., ["FACW", "OBL"])
  lastAgentType?: string; // Last agent used
  followUpContext?: string; // Context for understanding follow-ups
}

/**
 * ConversationManager Class
 * This class maintains conversation state across multiple turns.
 * Think of it as short-term memory.
 */
export class ConversationManager {
  private session: ConversationSession;

  constructor(sessionId?: string) {
    this.session = {
      id: sessionId || this.generateSessionId(),
      startedAt: new Date(),
      lastActiveAt: new Date(),
      turns: [],
      context: {
        topics: [],
        entities: [],
      },
    };
  }

  /**
   * Add a turn to the conversation
   * Each interaction updates the session state:
   * 1. Add the Q&A turn
   * 2. Update context (topics, entities)
   * 3. Update timestamp
   */
  addTurn(turn: Omit<ConversationTurn, "id" | "timestamp">): void {
    const completeTurn: ConversationTurn = {
      id: this.generateTurnId(),
      timestamp: new Date(),
      ...turn,
    };

    this.session.turns.push(completeTurn);
    this.session.lastActiveAt = new Date();

    // Update context based on this turn
    this.updateContext(completeTurn);
  }

  /**
   * Get conversation history formatted for context
   * Context Window Management
   * We can't send ALL history to the LLM (token limits!).
   * We send the most recent N turns for context.
   *
   * @param maxTurns - Maximum number of recent turns to include (default: 3)
   */
  getRecentHistory(maxTurns: number = 3): string {
    const recentTurns = this.session.turns.slice(-maxTurns);

    if (recentTurns.length === 0) {
      return "";
    }

    return recentTurns
      .map((turn, index) => {
        return `Turn ${index + 1}:\nQ: ${turn.question}\nA: ${turn.answer.substring(0, 200)}...`;
      })
      .join("\n\n");
  }

  /**
   * Get contextual summary for the current conversation
   * Context Compression
   * Instead of sending full history, we can send a summary.
   * This saves tokens while preserving important context.
   */
  getContextSummary(): string {
    const { topics, entities } = this.session.context;

    const parts = [];

    if (topics.length > 0) {
      parts.push(`Topics discussed: ${topics.join(", ")}`);
    }

    if (entities.length > 0) {
      parts.push(`Entities mentioned: ${entities.join(", ")}`);
    }

    if (this.session.turns.length > 0) {
      parts.push(`Conversation turns: ${this.session.turns.length}`);
    }

    return parts.join(". ");
  }

  /**
   * Enrich a follow-up question with conversation context
   * Query Enrichment Pattern
   * Follow-up questions often lack context:
   * - "What about OBL?" → "What about OBL wetland indicator?"
   * - "Compare them" → "Compare FACW and OBL"
   *
   * We enrich the query by adding relevant context from history.
   */
  enrichQuery(question: string): string {
    // If this is the first question, no enrichment needed
    if (this.session.turns.length === 0) {
      return question;
    }

    const lowercaseQ = question.toLowerCase();

    // Detect follow-up patterns
    const isFollowUp =
      lowercaseQ.startsWith("what about") ||
      lowercaseQ.startsWith("how about") ||
      lowercaseQ.startsWith("and ") ||
      lowercaseQ.includes("compare them") ||
      lowercaseQ.includes("the difference") ||
      lowercaseQ === "more" ||
      lowercaseQ === "continue" ||
      lowercaseQ.length < 15; // Very short questions are likely follow-ups

    if (!isFollowUp) {
      // Standalone question, no enrichment
      return question;
    }

    // Add context from previous turn
    const lastTurn = this.session.turns[this.session.turns.length - 1];
    const context = this.session.context;

    // Build enriched query
    const enrichmentParts = [];

    // Add topic context
    if (context.topics.length > 0) {
      enrichmentParts.push(
        `[Context: discussing ${context.topics[context.topics.length - 1]}]`,
      );
    }

    // Add entity context for pronoun resolution
    if (
      context.entities.length > 0 &&
      (lowercaseQ.includes("them") || lowercaseQ.includes("these"))
    ) {
      enrichmentParts.push(
        `[Referring to: ${context.entities.slice(-2).join(" and ")}]`,
      );
    }

    if (enrichmentParts.length > 0) {
      return `${enrichmentParts.join(" ")} ${question}`;
    }

    return question;
  }

  /**
   * Check if the question is a follow-up
   */
  isFollowUp(question: string): boolean {
    if (this.session.turns.length === 0) {
      return false;
    }

    const lowercaseQ = question.toLowerCase();

    return (
      lowercaseQ.startsWith("what about") ||
      lowercaseQ.startsWith("how about") ||
      lowercaseQ.startsWith("and ") ||
      lowercaseQ.includes("compare them") ||
      lowercaseQ.includes("also") ||
      lowercaseQ.includes("too") ||
      lowercaseQ === "more" ||
      lowercaseQ === "continue" ||
      lowercaseQ.length < 15
    );
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      turns: this.session.turns.length,
      duration: Date.now() - this.session.startedAt.getTime(),
      topics: this.session.context.topics.length,
      entities: this.session.context.entities.length,
    };
  }

  /**
   * Get the full session (for export/debugging)
   */
  getSession(): ConversationSession {
    return this.session;
  }

  /**
   * Clear conversation history (start fresh)
   */
  clear(): void {
    this.session = {
      id: this.generateSessionId(),
      startedAt: new Date(),
      lastActiveAt: new Date(),
      turns: [],
      context: {
        topics: [],
        entities: [],
      },
    };
  }

  /**
   * Update context based on new turn
   * Context Extraction
   * We extract topics and entities from the conversation to build context.
   * This is simplified - in production NER (Named Entity Recognition) would be used.
   */
  private updateContext(turn: ConversationTurn): void {
    const { question, answer, routing } = turn;

    // Extract topics from routing if available
    if (routing?.keywords) {
      routing.keywords.forEach((keyword) => {
        if (!this.session.context.topics.includes(keyword)) {
          this.session.context.topics.push(keyword);
        }
      });
    }

    // Simple entity extraction (look for uppercase acronyms)
    const acronymPattern = /\b[A-Z]{2,}\b/g;
    const questionAcronyms = question.match(acronymPattern) || [];
    const answerAcronyms = answer.substring(0, 500).match(acronymPattern) || [];

    [...questionAcronyms, ...answerAcronyms].forEach((entity) => {
      if (
        !this.session.context.entities.includes(entity) &&
        entity.length <= 10
      ) {
        this.session.context.entities.push(entity);
      }
    });

    // Keep only last 10 topics/entities to prevent unbounded growth
    if (this.session.context.topics.length > 10) {
      this.session.context.topics = this.session.context.topics.slice(-10);
    }
    if (this.session.context.entities.length > 10) {
      this.session.context.entities = this.session.context.entities.slice(-10);
    }

    // Store last agent type
    if (routing?.agentType) {
      this.session.context.lastAgentType = routing.agentType;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate unique turn ID
   */
  private generateTurnId(): string {
    return `turn_${this.session.turns.length + 1}`;
  }
}
