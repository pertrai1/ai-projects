import type { QueryRefinerInput, QueryRefinerOutput } from "../types/index.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";

export class QueryRefiner {
  private llmClient: LLMClient;
  private specLoader: SpecLoader;
  private systemPrompt: string | null = null;

  constructor(llmClient: LLMClient, specLoader: SpecLoader) {
    this.llmClient = llmClient;
    this.specLoader = specLoader;
  }

  /**
   * Load the system prompt from the spec file
   */
  private async loadSystemPrompt(): Promise<string> {
    if (this.systemPrompt) {
      return this.systemPrompt;
    }

    const spec = await this.specLoader.loadAgentSpec("query-refiner");

    if (!spec.systemPrompt) {
      throw new Error("query-refiner spec missing systemPrompt");
    }

    this.systemPrompt = spec.systemPrompt;
    return this.systemPrompt;
  }

  /**
   * Refine a query based on user feedback
   */
  async execute(input: QueryRefinerInput): Promise<QueryRefinerOutput> {
    const systemPrompt = await this.loadSystemPrompt();

    // Build context message
    const userMessage = this.buildUserMessage(input);

    try {
      const response = await this.llmClient.generateJSON<QueryRefinerOutput>(
        systemPrompt,
        userMessage,
        {
          temperature: 0.3,
          maxTokens: 2048,
        },
      );

      // Validate response
      this.validateResponse(response);

      return response;
    } catch (error) {
      console.error("Query refinement failed:", error);

      return {
        refinedQuery: input.currentQuery, // Return original if failed
        changes: "No changes made",
        reasoning: `Refinement failed: ${error}`,
        confidence: "low",
      };
    }
  }

  /**
   * Build user message with all context
   */
  private buildUserMessage(input: QueryRefinerInput): string {
    let message = `# Original Question\n${input.originalQuestion}\n\n`;

    message += `# Current Query\n\`\`\`sql\n${input.currentQuery}\n\`\`\`\n\n`;

    // Include schema context
    message += `# Database Schema\n`;
    for (const table of input.schema.tables) {
      message += `${table.name}: `;
      message += table.columns.map((c) => `${c.name} (${c.type})`).join(", ");
      message += "\n";
    }
    message += "\n";

    // Include previous results if available
    if (input.previousResults && input.previousResults.data) {
      message += `# Previous Results\n`;
      message += `Rows returned: ${input.previousResults.rowCount}\n`;

      if (input.previousResults.data.length > 0) {
        message += `Sample data (first 3 rows):\n`;
        message += JSON.stringify(
          input.previousResults.data.slice(0, 3),
          null,
          2,
        );
        message += "\n\n";
      }
    }

    message += `# User Feedback\n${input.feedback}\n\n`;
    message += `Generate a refined query that addresses this feedback.`;

    return message;
  }

  /**
   * Validate response structure
   */
  private validateResponse(response: any): void {
    const required = ["refinedQuery", "changes", "reasoning", "confidence"];

    for (const field of required) {
      if (!(field in response)) {
        throw new Error(`Response missing required field: ${field}`);
      }
    }

    const validConfidence = ["high", "medium", "low"];
    if (!validConfidence.includes(response.confidence)) {
      throw new Error(`Invalid confidence: ${response.confidence}`);
    }
  }
}
