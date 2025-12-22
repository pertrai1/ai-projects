import type {
  QueryGeneratorInput,
  QueryGeneratorOutput,
  DatabaseSchema,
} from "../types/index.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";

export class QueryGenerator {
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

    const spec = await this.specLoader.loadAgentSpec("query-generator");

    if (!spec.systemPrompt) {
      throw new Error("query-generator spec missing systemPrompt");
    }

    this.systemPrompt = spec.systemPrompt;
    return this.systemPrompt;
  }

  /**
   * Execute the query generator agent
   * Converts natural language question to SQL query
   */
  async execute(input: QueryGeneratorInput): Promise<QueryGeneratorOutput> {
    // Load system prompt from spec
    const systemPrompt = await this.loadSystemPrompt();

    // Format the schema for the LLM
    const formattedSchema = this.formatSchemaForLLM(input.schema);

    // Build the user message
    const userMessage = this.buildUserMessage(input.question, formattedSchema);

    try {
      // Call Claude API with spec-defined prompts
      const response = await this.llmClient.generateJSON<QueryGeneratorOutput>(
        systemPrompt,
        userMessage,
        {
          temperature: 0.3,
          maxTokens: 2048,
        },
      );

      console.log("DEBUG: LLM Response:", JSON.stringify(response, null, 2));

      // Validate response structure
      this.validateResponse(response);

      if (!response.query || typeof response.query !== "string") {
        throw new Error("LLM returned null or invalid query string");
      }

      return response;
    } catch (error) {
      console.error("Query generation failed:", error);

      // Return error response
      return {
        query: "",
        explanation: `Failed to generate query: ${error}`,
        confidence: "low",
        tablesUsed: [],
        assumptions: ["Query generation failed due to error"],
      };
    }
  }

  /**
   * Format database schema for LLM context
   */
  private formatSchemaForLLM(schema: DatabaseSchema): string {
    let formatted = `# Database Schema: ${schema.name}\n\n`;

    if (schema.description) {
      formatted += `${schema.description}\n\n`;
    }

    formatted += "## Tables\n\n";

    for (const table of schema.tables) {
      formatted += `## ${table.name}`;

      if (table.description) {
        formatted += `${table.description}\n\n`;
      }

      formatted += "Columns:\n";

      for (const column of table.columns) {
        let columnInfo = `- **${column.name}** (${column.type})`;

        const attributes: string[] = [];
        if (column.primaryKey) attributes.push("PRIMARY KEY");
        if (column.unique) attributes.push("UNIQUE");
        if (column.nullable === false) attributes.push("NOT NULL");
        if (column.foreignKey) {
          attributes.push(
            `FK -> ${column.foreignKey.table}.${column.foreignKey.column}`,
          );
        }

        if (attributes.length > 0) {
          columnInfo += ` [${attributes.join(", ")}]`;
        }

        if (column.description) {
          columnInfo += `\n ${column.description}`;
        }

        formatted += columnInfo + "\n";
      }

      formatted += "\n";
    }

    // Add relationship
    if (schema.relationships && schema.relationships.length > 0) {
      formatted += "## Relationships\n\n";

      for (const rel of schema.relationships) {
        formatted += `- **${rel.name}**: ${rel.fromTable}.${rel.fromColumn} -> ${rel.toTable}.${rel.toColumn} (${rel.type})\n`;

        if (rel.description) {
          formatted += `  ${rel.description}\n`;
        }
      }
    }

    return formatted;
  }

  /**
   * Build the user message with question and schema
   */
  private buildUserMessage(question: string, formattedSchema: string): string {
    return `${formattedSchema}

## User Question

${question}

Generate a SQL query to answer this question based on the schema above.
`;
  }

  /**
   * Validate the LLM response matches expected structure
   */
  private validateResponse(response: any): void {
    const required = ["query", "explanation", "confidence", "tablesUsed"];

    for (const field of required) {
      if (!(field in response)) {
        throw new Error(`Response missing required field: ${field}`);
      }
    }

    // Validate confidence value
    const validConfidence = ["high", "medium", "low"];
    if (!validConfidence.includes(response.confidence)) {
      throw new Error(
        `Invalid confidence value: ${response.confidence}.  ` +
          `Must be one of: ${validConfidence.join(", ")}`,
      );
    }

    // Validate tablesUsed is an array
    if (!Array.isArray(response.tablesUsed)) {
      throw new Error("tablesUsed must be an array");
    }

    // Validate assumptions is an array if present
    if (response.assumptions && !Array.isArray(response.assumptions)) {
      throw new Error("assumptions must be an array");
    }
  }
}
