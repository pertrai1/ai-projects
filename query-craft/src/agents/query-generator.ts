import type {
  QueryGeneratorInput,
  QueryGeneratorOutput,
  DatabaseSchema,
  ScoredChunk,
  RetrievalMetadata,
} from "../types/index.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";
import { SchemaDocRetriever } from "../tools/schema-doc-retriever.js";
import { loadRAGConfig, shouldUseRetrieval } from "../utils/rag-config.js";

export class QueryGenerator {
  private llmClient: LLMClient;
  private specLoader: SpecLoader;
  private systemPrompt: string | null = null;
  private retriever: SchemaDocRetriever;

  constructor(llmClient: LLMClient, specLoader: SpecLoader, docsBaseDir: string = "./data/schemas") {
    this.llmClient = llmClient;
    this.specLoader = specLoader;
    this.retriever = new SchemaDocRetriever(docsBaseDir);
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

    // Determine whether to use retrieval
    const ragConfig = loadRAGConfig();
    const useRetrieval = input.useRetrieval !== undefined
      ? input.useRetrieval
      : shouldUseRetrieval(input.schema.tables.length, ragConfig);

    let formattedSchema: string;
    let retrievalMetadata: RetrievalMetadata | undefined;

    if (useRetrieval && input.database) {
      // Use RAG retrieval for large schemas
      try {
        const retrievedChunks = await this.retriever.retrieve(
          input.question,
          input.database,
          ragConfig.topK
        );

        if (retrievedChunks.length > 0) {
          formattedSchema = this.formatFocusedSchema(input.schema, retrievedChunks);
          retrievalMetadata = {
            strategy: "rag",
            chunksRetrieved: retrievedChunks.length,
            tablesIncluded: [...new Set(retrievedChunks.map((c) => c.chunk.table))],
            avgRelevanceScore: retrievedChunks.reduce((sum, c) => sum + c.score, 0) / retrievedChunks.length,
          };

          if (ragConfig.debugMode) {
            console.log("RAG Retrieval:", {
              chunksRetrieved: retrievedChunks.length,
              tables: retrievalMetadata.tablesIncluded,
              avgScore: retrievalMetadata.avgRelevanceScore,
            });
          }
        } else {
          // Fall back to full schema if no chunks retrieved
          formattedSchema = this.formatSchemaForLLM(input.schema);
          retrievalMetadata = {
            strategy: "full",
            tablesIncluded: input.schema.tables.map((t) => t.name),
          };

          if (ragConfig.debugMode) {
            console.log("RAG: No chunks retrieved, falling back to full schema");
          }
        }
      } catch (error) {
        console.warn("Retrieval failed, falling back to full schema:", error);
        formattedSchema = this.formatSchemaForLLM(input.schema);
        retrievalMetadata = {
          strategy: "full",
          tablesIncluded: input.schema.tables.map((t) => t.name),
        };
      }
    } else {
      // Use full schema for small databases or when retrieval is disabled
      formattedSchema = this.formatSchemaForLLM(input.schema);
      retrievalMetadata = {
        strategy: "full",
        tablesIncluded: input.schema.tables.map((t) => t.name),
      };
    }

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

      if (!response.query || response.query === null) {
        return {
          query: "",
          explanation:
            response.explanation ||
            "Could not generate a query for this question",
          confidence: "low",
          tablesUsed: response.tablesUsed || [],
          assumptions: response.assumptions || [
            "Unable to map question to available schema",
          ],
          retrievalMetadata,
        };
      }

      // Validate response structure
      this.validateResponse(response);

      if (!response.query || typeof response.query !== "string") {
        throw new Error("LLM returned null or invalid query string");
      }

      // Add retrieval metadata to response
      return {
        ...response,
        retrievalMetadata,
      };
    } catch (error) {
      console.error("Query generation failed:", error);

      // Return error response
      return {
        query: "",
        explanation: `Failed to generate query: ${error}`,
        confidence: "low",
        tablesUsed: [],
        assumptions: ["Query generation failed due to error"],
        retrievalMetadata,
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
   * Format focused schema from retrieved chunks (RAG mode)
   * Only includes tables and columns that are relevant to the query
   */
  private formatFocusedSchema(
    schema: DatabaseSchema,
    retrievedChunks: ScoredChunk[]
  ): string {
    // Extract unique tables from retrieved chunks
    const relevantTables = new Set(retrievedChunks.map((c) => c.chunk.table));

    // Expand with related tables (from foreign key relationships)
    const expandedTables = this.expandWithRelationships(schema, Array.from(relevantTables));

    // Start with database header
    let formatted = `# Database Schema: ${schema.name}\n\n`;

    if (schema.description) {
      formatted += `${schema.description}\n\n`;
    }

    // Add note about focused schema
    formatted += `*Note: This is a focused schema showing only tables relevant to your question.*\n\n`;

    formatted += "## Tables\n\n";

    // Format only the relevant tables
    for (const table of schema.tables) {
      if (!expandedTables.has(table.name)) continue;

      formatted += `## ${table.name}`;

      if (table.description) {
        formatted += ` - ${table.description}\n\n`;
      } else {
        formatted += "\n\n";
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
            `FK -> ${column.foreignKey.table}.${column.foreignKey.column}`
          );
        }

        if (attributes.length > 0) {
          columnInfo += ` [${attributes.join(", ")}]`;
        }

        if (column.description) {
          columnInfo += `\n  ${column.description}`;
        }

        formatted += columnInfo + "\n";
      }

      formatted += "\n";
    }

    // Add relationships for relevant tables
    if (schema.relationships && schema.relationships.length > 0) {
      const relevantRels = schema.relationships.filter(
        (rel) =>
          expandedTables.has(rel.fromTable) || expandedTables.has(rel.toTable)
      );

      if (relevantRels.length > 0) {
        formatted += "## Relationships\n\n";

        for (const rel of relevantRels) {
          formatted += `- **${rel.name}**: ${rel.fromTable}.${rel.fromColumn} -> ${rel.toTable}.${rel.toColumn} (${rel.type})\n`;

          if (rel.description) {
            formatted += `  ${rel.description}\n`;
          }
        }

        formatted += "\n";
      }
    }

    // Add retrieved documentation context
    formatted += "## Retrieved Documentation\n\n";
    formatted += "*Additional context about the relevant tables:*\n\n";

    for (const { chunk, score } of retrievedChunks) {
      // Only include high-scoring chunks in the context
      if (score < 0.1) continue;

      formatted += `### ${chunk.table}`;
      if (chunk.column) {
        formatted += `.${chunk.column}`;
      }
      if (chunk.chunkType) {
        formatted += ` (${chunk.chunkType})`;
      }
      formatted += `\n\n${chunk.content}\n\n`;
    }

    return formatted;
  }

  /**
   * Expand table set to include related tables via foreign keys
   */
  private expandWithRelationships(
    schema: DatabaseSchema,
    tables: string[]
  ): Set<string> {
    const expanded = new Set(tables);

    // Add tables referenced by foreign keys
    for (const tableName of tables) {
      const table = schema.tables.find((t) => t.name === tableName);
      if (!table) continue;

      for (const column of table.columns) {
        if (column.foreignKey) {
          expanded.add(column.foreignKey.table);
        }
      }
    }

    return expanded;
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
