import type {
  SqlValidatorInput,
  SqlValidatorOutput,
  DatabaseSchema,
} from "../types/index.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";

export class SqlValidator {
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

    const spec = await this.specLoader.loadAgentSpec("sql-validator");

    if (!spec.systemPrompt) {
      throw new Error("sql-validator spec missing systemPrompt");
    }

    this.systemPrompt = spec.systemPrompt;
    return this.systemPrompt;
  }

  /**
   * Execute SQL validation
   * Combines deterministic checks + LLM semantic validation
   */
  async execute(input: SqlValidatorInput): Promise<SqlValidatorOutput> {
    // First: Run deterministic safety checks (fast, no LLM needed)
    const safetyCheck = this.deterministicSafetyCheck(input.query);

    if (!safetyCheck.passed) {
      // If safety check fails, don't even call the LLM
      return {
        isValid: false,
        syntaxValid: true, // We can't determine this without parsing
        schemaValid: false,
        safetyValid: false,
        complexityScore: "low",
        errors: safetyCheck.errors,
        warnings: [],
        suggestions: ["Remove dangerous SQL operations"],
      };
    }

    // Second: Use LLM for deeper validation
    try {
      const systemPrompt = await this.loadSystemPrompt();
      const userMessage = this.buildUserMessage(input.query, input.schema);

      const response = await this.llmClient.generateJSON<SqlValidatorOutput>(
        systemPrompt,
        userMessage,
        {
          temperature: 0.1, // Very low - we want consistent validation
          maxTokens: 1024,
        },
      );

      // Validate response structure
      this.validateResponse(response);

      // Override safetyValid if our deterministic check found issues
      if (!safetyCheck.passed) {
        response.safetyValid = false;
        response.isValid = false;
        response.errors = [...response.errors, ...safetyCheck.errors];
      }

      return response;
    } catch (error) {
      console.error("SQL validation failed:", error);

      return {
        isValid: false,
        syntaxValid: false,
        schemaValid: false,
        safetyValid: safetyCheck.passed,
        complexityScore: "low",
        errors: [`Validation error: ${error}`],
        warnings: [],
        suggestions: [],
      };
    }
  }

  /**
   * Deterministic safety check (no LLM needed)
   * This is a CRITICAL guardrail - blocks dangerous operations
   */
  private deterministicSafetyCheck(query: string): {
    passed: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!query || typeof query !== "string") {
      errors.push("VALIDATION ERROR: Query is null or not a string");
      return {
        passed: false,
        errors,
      };
    }

    const queryUpper = query.toUpperCase();

    // Check 1: Must be SELECT only
    const dangerousKeywords = [
      "INSERT",
      "UPDATE",
      "DELETE",
      "DROP",
      "TRUNCATE",
      "ALTER",
      "CREATE",
      "GRANT",
      "REVOKE",
      "EXECUTE",
      "EXEC",
      "COPY",
      "LOAD",
      "IMPORT",
    ];

    for (const keyword of dangerousKeywords) {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(query)) {
        errors.push(
          `SECURITY VIOLATION: ${keyword} statement detected. Only SELECT queries are allowed.`,
        );
      }
    }

    // Check 2: No system table access
    const systemTables = [
      "pg_user",
      "pg_shadow",
      "pg_authid",
      "information_schema",
      "pg_catalog",
      "pg_roles",
      "pg_database",
    ];

    for (const table of systemTables) {
      if (queryUpper.includes(table.toUpperCase())) {
        errors.push(
          `SECURITY VIOLATION: Access to system table ${table} is not allowed.`,
        );
      }
    }

    // Check 3: No file operations
    const fileOperations = [
      "pg_read_file",
      "pg_write_file",
      "pg_ls_dir",
      "COPY",
      "INTO OUTFILE",
      "LOAD_FILE",
    ];

    for (const operation of fileOperations) {
      if (queryUpper.includes(operation.toUpperCase())) {
        errors.push(
          `SECURITY VIOLATION: File operation ${operation} is not allowed.`,
        );
      }
    }

    // Check 4: No SQL injection patterns
    const injectionPatterns = [
      /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
      /--.*?(DROP|DELETE|UPDATE)/i,
      /\/\*.*?(DROP|DELETE|UPDATE)/i,
      /UNION.*?SELECT.*?FROM/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        errors.push(
          "SECURITY VIOLATION: Potential SQL injection pattern detected.",
        );
        break;
      }
    }

    return {
      passed: errors.length === 0,
      errors,
    };
  }

  /**
   * Build user message for LLM validation
   */
  private buildUserMessage(query: string, schema: DatabaseSchema): string {
    // Format schema info
    const tables = schema.tables
      .map((t) => {
        const columns = t.columns
          .map((c) => `${c.name} (${c.type})`)
          .join(", ");
        return `- ${t.name}: ${columns}`;
      })
      .join("\n");

    return `# Schema

${tables}

# Query to Validate

\`\`\`sql
${query}
\`\`\`

Validate this query against the schema above.`;
  }

  /**
   * Validate the LLM response structure
   */
  private validateResponse(response: any): void {
    const required = [
      "isValid",
      "syntaxValid",
      "schemaValid",
      "safetyValid",
      "complexityScore",
      "errors",
    ];

    for (const field of required) {
      if (!(field in response)) {
        throw new Error(`Response missing required field: ${field}`);
      }
    }

    // Validate boolean fields
    const booleans = ["isValid", "syntaxValid", "schemaValid", "safetyValid"];
    for (const field of booleans) {
      if (typeof response[field] !== "boolean") {
        throw new Error(`${field} must be a boolean`);
      }
    }

    // Validate complexityScore
    const validComplexity = ["low", "medium", "high"];
    if (!validComplexity.includes(response.complexityScore)) {
      throw new Error(`Invalid complexityScore: ${response.complexityScore}`);
    }

    // Validate arrays
    if (!Array.isArray(response.errors)) {
      throw new Error("errors must be an array");
    }
  }
}
