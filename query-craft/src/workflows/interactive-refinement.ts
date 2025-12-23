import type { IntentType, SqlGenerationOutput } from "../types/index.js";
import { DialogManager } from "../agents/dialog-manager.js";
import { SqlGenerationWorkflow } from "./sql-generation.js";
import { SqlRefinementWorkflow, RefinementContext } from "./sql-refinement.js";

/**
 * Result of an interactive turn with metadata
 */
export interface InteractiveTurnResult {
  result: SqlGenerationOutput;
  intent: IntentType;
  turnNumber: number;
  sessionId: string;
}

/**
 * Interactive Refinement Workflow
 *
 * Orchestrates dialog flow in interactive mode by:
 * 1. Detecting user intent (new query vs refinement)
 * 2. Routing to appropriate workflow
 * 3. Updating conversation state
 * 4. Returning results with metadata
 */
export class InteractiveRefinementWorkflow {
  private dialogManager: DialogManager;
  private sqlGenerationWorkflow: SqlGenerationWorkflow;
  private sqlRefinementWorkflow: SqlRefinementWorkflow;

  constructor(
    dialogManager: DialogManager,
    sqlGenerationWorkflow: SqlGenerationWorkflow,
    sqlRefinementWorkflow: SqlRefinementWorkflow
  ) {
    this.dialogManager = dialogManager;
    this.sqlGenerationWorkflow = sqlGenerationWorkflow;
    this.sqlRefinementWorkflow = sqlRefinementWorkflow;
  }

  /**
   * Handle a user turn in the conversation
   */
  async handleTurn(userInput: string): Promise<InteractiveTurnResult> {
    // 1. Detect intent
    const intent = this.dialogManager.detectIntent(userInput);

    // 2. Route to appropriate workflow
    let result: SqlGenerationOutput;

    if (intent === "new_query") {
      // Generate new query
      const context = this.dialogManager.getContext();
      result = await this.sqlGenerationWorkflow.execute({
        question: userInput,
        database: context.database,
      });
    } else {
      // Refinement
      const lastQuery = this.dialogManager.getLastQuery();
      const lastResult = this.dialogManager.getLastResult();
      const originalQuestion = this.dialogManager.getOriginalQuestion();

      // Safety check: ensure we have previous query to refine
      if (!lastQuery || !lastResult || !originalQuestion) {
        console.warn(
          "Refinement intent detected but no previous query found. Starting new query."
        );
        // Fallback to new query
        const context = this.dialogManager.getContext();
        result = await this.sqlGenerationWorkflow.execute({
          question: userInput,
          database: context.database,
        });
      } else {
        // Execute refinement workflow
        const refinementContext: RefinementContext = {
          originalQuestion,
          currentQuery: lastQuery,
          currentResult: lastResult,
          feedback: userInput,
        };

        result = await this.sqlRefinementWorkflow.refine(refinementContext);
      }
    }

    // 3. Update conversation state
    this.dialogManager.addTurn(userInput, intent, result);

    // 4. Return result with metadata
    const context = this.dialogManager.getContext();
    return {
      result,
      intent,
      turnNumber: context.turnCount,
      sessionId: context.sessionId,
    };
  }

  /**
   * Get conversation state for UI display
   */
  getConversationState() {
    return this.dialogManager.getContext();
  }

  /**
   * Reset conversation
   */
  resetConversation(): void {
    this.dialogManager.clear();
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.dialogManager.getHistory();
  }

  /**
   * Get turn count
   */
  getTurnCount(): number {
    return this.dialogManager.getTurnCount();
  }
}
