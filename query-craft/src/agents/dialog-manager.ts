import {
  ConversationState,
  ConversationTurn,
  ConversationContext,
  IntentType,
  SqlGenerationOutput,
} from "../types/index.js";
import { randomUUID } from "crypto";

/**
 * Dialog Manager Agent
 *
 * Manages conversation state and intent detection for interactive query refinement.
 * Implements rule-based intent classification for fast, deterministic behavior.
 */
export class DialogManager {
  private state: ConversationState;
  private maxTurns: number;

  // Refinement indicators - these suggest the user is refining an existing query
  private static readonly REFINEMENT_KEYWORDS = [
    "only",
    "also",
    "add",
    "remove",
    "change",
    "instead",
    "but",
    "actually",
    "sort by",
    "limit to",
    "filter",
    "exclude",
    "too many",
    "too few",
    "wrong",
    "missing",
    "order by",
    "group by",
    "without",
    "except",
    "and ",
    "or ",
  ];

  // New query indicators - these suggest a new, independent query
  private static readonly NEW_QUERY_KEYWORDS = [
    "show",
    "find",
    "get",
    "list",
    "what",
    "which",
    "who",
    "how many",
    "count",
    "select",
    "give me",
    "i want",
    "display",
  ];

  // Reset commands - explicit user request for new query
  private static readonly RESET_COMMANDS = ["/new", "new query", "start over"];

  constructor(database: string, sessionId?: string, maxTurns: number = 10) {
    this.maxTurns = maxTurns;
    this.state = {
      sessionId: sessionId || randomUUID(),
      database,
      turns: [],
    };
  }

  /**
   * Detect user intent based on input and conversation history
   */
  detectIntent(userInput: string): IntentType {
    const input = userInput.toLowerCase().trim();

    // First turn is always a new query
    if (this.state.turns.length === 0) {
      return "new_query";
    }

    // Check for explicit reset commands
    if (this.isResetCommand(input)) {
      return "new_query";
    }

    // No previous query means new query
    if (!this.state.currentQuery) {
      return "new_query";
    }

    // Check for refinement indicators
    const hasRefinementKeywords = this.containsKeywords(
      input,
      DialogManager.REFINEMENT_KEYWORDS
    );

    // Check for new query indicators
    const hasNewQueryKeywords = this.containsKeywords(
      input,
      DialogManager.NEW_QUERY_KEYWORDS
    );

    // Short input after successful query likely a refinement
    const isShortInput = input.split(/\s+/).length < 5;

    // Decision logic
    if (hasRefinementKeywords && !hasNewQueryKeywords) {
      return "refinement";
    }

    if (hasNewQueryKeywords && !hasRefinementKeywords) {
      return "new_query";
    }

    // Ambiguous case: has both or neither
    // Default to refinement if short input, otherwise new query
    if (isShortInput && this.state.currentQuery) {
      return "refinement";
    }

    return "new_query";
  }

  /**
   * Add a turn to the conversation
   */
  addTurn(
    userInput: string,
    intent: IntentType,
    result?: SqlGenerationOutput
  ): void {
    const turn: ConversationTurn = {
      id: randomUUID(),
      timestamp: new Date(),
      userInput,
      intent,
      result,
    };

    this.state.turns.push(turn);

    // Update current query and result
    if (result && result.query) {
      this.state.currentQuery = result.query;
      this.state.currentResult = result;
    }

    // Prune old turns if exceeding max
    if (this.state.turns.length > this.maxTurns) {
      const excess = this.state.turns.length - this.maxTurns;
      this.state.turns.splice(0, excess);
    }
  }

  /**
   * Get conversation context for workflows
   */
  getContext(): ConversationContext {
    return {
      sessionId: this.state.sessionId,
      database: this.state.database,
      turnCount: this.state.turns.length,
      lastQuery: this.state.currentQuery,
      lastResult: this.state.currentResult,
      recentTurns: [...this.state.turns],
    };
  }

  /**
   * Get the last query from conversation
   */
  getLastQuery(): string | undefined {
    return this.state.currentQuery;
  }

  /**
   * Get the last result from conversation
   */
  getLastResult(): SqlGenerationOutput | undefined {
    return this.state.currentResult;
  }

  /**
   * Get the original question (first turn)
   */
  getOriginalQuestion(): string | undefined {
    return this.state.turns.length > 0
      ? this.state.turns[0].userInput
      : undefined;
  }

  /**
   * Clear conversation state
   */
  clear(): void {
    const { sessionId, database } = this.state;
    this.state = {
      sessionId,
      database,
      turns: [],
    };
  }

  /**
   * Get conversation history for display
   */
  getHistory(): ConversationTurn[] {
    return [...this.state.turns];
  }

  /**
   * Get turn count
   */
  getTurnCount(): number {
    return this.state.turns.length;
  }

  /**
   * Check if input contains reset command
   */
  private isResetCommand(input: string): boolean {
    return DialogManager.RESET_COMMANDS.some((cmd) => input.includes(cmd));
  }

  /**
   * Check if input contains any keywords from list
   */
  private containsKeywords(input: string, keywords: string[]): boolean {
    return keywords.some((keyword) => {
      // Check for word boundaries to avoid partial matches
      const pattern = new RegExp(`\\b${keyword}`, "i");
      return pattern.test(input);
    });
  }
}
