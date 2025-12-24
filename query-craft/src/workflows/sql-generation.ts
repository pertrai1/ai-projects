import type {
  QueryExecutorOutput,
  SqlGenerationInput,
  SqlGenerationOutput,
} from "../types/index.js";
import { SchemaLoader } from "../agents/schema-loader.js";
import { QueryGenerator } from "../agents/query-generator.js";
import { SqlValidator } from "../agents/sql-validator.js";
import { QueryExecutor } from "../agents/query-executor.js";
import { ResultFormatter } from "../utils/result-formatter.js";

export class SqlGenerationWorkflow {
  private schemaLoader: SchemaLoader;
  private queryGenerator: QueryGenerator;
  private sqlValidator: SqlValidator;
  private queryExecutor: QueryExecutor;
  private executeQueries: boolean;

  constructor(
    schemaLoader: SchemaLoader,
    queryGenerator: QueryGenerator,
    sqlValidator: SqlValidator,
    queryExecutor: QueryExecutor,
    options: { executeQueries?: boolean } = {},
  ) {
    this.schemaLoader = schemaLoader;
    this.queryGenerator = queryGenerator;
    this.sqlValidator = sqlValidator;
    this.queryExecutor = queryExecutor;
    this.executeQueries = options.executeQueries ?? true;
  }

  /**
   * Execute the complete SQL generation workflow
   *
   * Steps:
   * 1. Load and validate database schema
   * 2. Generate SQL query from natural language
   * 3. Validate the generated SQL
   * 4. Execute the query (if validation passes)
   *
   * Guardrails:
   * - Abort if schema validation fails
   * - Abort if safety validation fails
   * - Only execute if all validation passes
   */
  async execute(input: SqlGenerationInput): Promise<SqlGenerationOutput> {
    console.log(`\n${"=".repeat(60)}`);
    console.log("SQL Generation Workflow");
    console.log(`${"=".repeat(60)}\n`);

    // STEP 1: Load Schema
    console.log("Step 1: Loading schema...");
    const schemaResult = await this.schemaLoader.execute({
      database: input.database,
    });

    // GUARDRAIL: Schema must be valid
    if (schemaResult.validationStatus !== "valid") {
      console.error("❌ Schema validation failed - aborting workflow");

      return {
        query: "",
        explanation: "Schema validation failed - cannot proceed",
        confidence: "low",
        isValid: false,
        safetyChecks: false,
        errors: ["Schema validation failed"],
        warnings: [],
        canExecute: false,
        schemaUsed: input.database,
      };
    }

    console.log(`Schema loaded: ${schemaResult.schemaName}`);
    console.log(`   Tables: ${schemaResult.tables.join(", ")}\n`);

    // STEP 2: Generate SQL Query
    console.log("Step 2: Generating SQL query...");
    const generatorResult = await this.queryGenerator.execute({
      question: input.question,
      schema: schemaResult.schema,
      database: input.database,
    });

    console.log("Query generated");
    console.log(`   Confidence: ${generatorResult.confidence}`);
    console.log(`   Tables used: ${generatorResult.tablesUsed.join(", ")}`);

    // Log RAG metadata if available
    if (generatorResult.retrievalMetadata) {
      console.log(`   Retrieval strategy: ${generatorResult.retrievalMetadata.strategy}`);
      if (generatorResult.retrievalMetadata.strategy === "rag") {
        console.log(`   Chunks retrieved: ${generatorResult.retrievalMetadata.chunksRetrieved}`);
        console.log(`   Tables in context: ${generatorResult.retrievalMetadata.tablesIncluded.join(", ")}`);
      }
    }
    console.log("");

    // STEP 3: Validate SQL Query
    console.log("Step 3: Validating SQL query...");
    const validatorResult = await this.sqlValidator.execute({
      query: generatorResult.query,
      schema: schemaResult.schema,
    });

    // GUARDRAIL: Safety checks must pass
    if (!validatorResult.safetyValid) {
      console.error("❌ Query failed safety validation - execution blocked");

      return {
        query: generatorResult.query,
        explanation: generatorResult.explanation,
        confidence: generatorResult.confidence,
        isValid: false,
        safetyChecks: false,
        errors: validatorResult.errors,
        warnings: validatorResult.warnings,
        canExecute: false,
        schemaUsed: schemaResult.schemaName,
      };
    }

    // GUARDRAIL: Warn if query has validation errors
    if (!validatorResult.isValid) {
      console.warn("Query has validation errors");
    } else {
      console.log("Query validated successfully");
    }

    console.log(`   Syntax valid: ${validatorResult.syntaxValid}`);
    console.log(`   Schema valid: ${validatorResult.schemaValid}`);
    console.log(`   Safety valid: ${validatorResult.safetyValid}`);
    console.log(`   Complexity: ${validatorResult.complexityScore}\n`);

    // Determine if query can be executed
    const canExecute = validatorResult.isValid && validatorResult.safetyValid;

    // STEP 4: Execute Query
    let executionResult: QueryExecutorOutput | undefined;

    if (this.executeQueries && canExecute) {
      console.log("Step 4: Executing query...");

      executionResult = await this.queryExecutor.execute({
        query: generatorResult.query,
        validationResult: {
          isValid: validatorResult.isValid,
          safetyValid: validatorResult.safetyValid,
        },
        database: input.database,
      });

      if (executionResult.success) {
        console.log("Query executed successfully");
        console.log(`Execution time: ${executionResult.executionTime}ms`);
        console.log(`Rows returned: ${executionResult.rowCount}`);
        if (executionResult.truncated) {
          console.log(
            `Results truncated to ${executionResult.data?.length} rows`,
          );
        }
      } else {
        console.error("Query execution failed");
        console.error(`Error: ${executionResult.error}`);
      }
      console.log("");
    } else if (this.executeQueries && !canExecute) {
      console.log("Step 4: Skipping execution (validation failed)\n");
    }

    // Build final output
    const output: SqlGenerationOutput = {
      query: generatorResult.query,
      explanation: generatorResult.explanation,
      confidence: generatorResult.confidence,
      isValid: validatorResult.isValid,
      safetyChecks: validatorResult.safetyValid,
      errors: validatorResult.errors,
      warnings: validatorResult.warnings || [],
      canExecute,
      schemaUsed: schemaResult.schemaName,
    };

    // Add suggestions if present
    if (validatorResult.suggestions && validatorResult.suggestions.length > 0) {
      output.warnings = [
        ...(output.warnings || []),
        ...validatorResult.suggestions.map((s) => `Suggestion: ${s}`),
      ];
    }

    console.log(`${"=".repeat(60)}`);
    console.log(
      `Workflow Complete: ${canExecute ? "Ready to Execute" : "❌ Cannot Execute"}`,
    );
    console.log(`${"=".repeat(60)}\n`);

    return output;
  }

  /**
   * Execute workflow and return formatted result for display
   */
  async executeAndFormat(input: SqlGenerationInput): Promise<string> {
    const result = await this.execute(input);

    let output = "\n";
    output += "┌─────────────────────────────────────────────────────────┐\n";
    output += "│                    QUERY RESULT                         │\n";
    output += "└─────────────────────────────────────────────────────────┘\n\n";

    output += `Question: ${input.question}\n\n`;

    output += "Generated SQL:\n";
    output += "```sql\n";
    output += result.query;
    output += "\n```\n\n";

    output += `Explanation: ${result.explanation}\n\n`;

    output += "─────────────────────────────────────────────────────────\n";
    output += "Validation Status:\n";
    output += `  ✓ Confidence:     ${result.confidence}\n`;
    output += `  ${result.isValid ? "✓" : "✗"} Valid:          ${result.isValid}\n`;
    output += `  ${result.safetyChecks ? "✓" : "✗"} Safety Checks:  ${result.safetyChecks}\n`;
    output += `  ${result.canExecute ? "✓" : "✗"} Can Execute:    ${result.canExecute}\n`;
    output += `  ✓ Schema Used:    ${result.schemaUsed}\n`;

    if (result.executionResult) {
      output += "\n─────────────────────────────────────────────────────────\n";
      output += "Execution Results:\n\n";

      if (result.executionResult.success) {
        output += ResultFormatter.formatExecutionSummary(
          result.executionResult,
        );

        // Show data as table
        if (
          result.executionResult.data &&
          result.executionResult.data.length > 0
        ) {
          output += "\nResults:\n";
          output += ResultFormatter.formatAsTable(
            result.executionResult.data,
            result.executionResult.columns || [],
            { maxRows: 10 },
          );
        } else {
          output += "\nNo rows returned.\n";
        }
      } else {
        output += `✗ Execution failed\n`;
        output += `✗ Error: ${result.executionResult.error}\n`;
      }
    }

    if (result.errors.length > 0) {
      output += "\n❌ Errors:\n";
      result.errors.forEach((err) => {
        output += `  • ${err}\n`;
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      output += "\nWarnings:\n";
      result.warnings.forEach((warn) => {
        output += `  • ${warn}\n`;
      });
    }

    output += "─────────────────────────────────────────────────────────\n";

    if (!result.canExecute) {
      output += "\nThis query cannot be executed due to validation failures.\n";
    }

    return output;
  }
}
