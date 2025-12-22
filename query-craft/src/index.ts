#!/usr/bin/env node

import { Command } from "commander";
import { config } from "dotenv";
import chalk from "chalk";
import ora from "ora";
import { SqlGenerationWorkflow } from "./workflows/sql-generation.js";
import { SchemaLoader } from "./agents/schema-loader.js";
import { QueryGenerator } from "./agents/query-generator.js";
import { SqlValidator } from "./agents/sql-validator.js";
import { LLMClient } from "./utils/llm-client.js";
import { SpecLoader } from "./tools/spec-loader.js";
import { QueryExecutor } from "./agents/query-executor.js";
import { ResultFormatter } from "./utils/result-formatter.js";

config();

const program = new Command();

program
  .name("querycraft")
  .description("Natural language to SQL query generator with validation")
  .version("0.1.0");

/**
 * Main command: generate SQL from natural language
 */
program
  .command("generate")
  .description("Generate SQL query from natural language question")
  .argument("<question>", "Natural language question")
  .option("-d, --database <name>", "Database schema to use", "ecommerce")
  .option("-v, --verbose", "Show detailed workflow steps", false)
  .option("--no-validate", "Skip validation step", false)
  .option("--no-execute", "Skip query execution", false)
  .option("-f, --format <type>", "Output format: table, json, csv", "table")
  .option("-l, --limit <number>", "Max rows to display", "10")
  .action(async (question: string, options) => {
    try {
      // Check for API key
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error(
          chalk.red("\n❌ Error: ANTHROPIC_API_KEY not found in environment"),
        );
        console.error(chalk.yellow("\nPlease create a .env file with:"));
        console.error(chalk.gray("ANTHROPIC_API_KEY=your_api_key_here\n"));
        process.exit(1);
      }

      // Initialize components
      const spinner = ora("Initializing QueryCraft...").start();

      const llmClient = new LLMClient({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const specLoader = new SpecLoader("./specs");
      const schemaLoader = new SchemaLoader("./data/schemas");
      const queryGenerator = new QueryGenerator(llmClient, specLoader);
      const sqlValidator = new SqlValidator(llmClient, specLoader);
      const queryExecutor = new QueryExecutor({
        dbPath: "./data/databases",
      });

      const workflow = new SqlGenerationWorkflow(
        schemaLoader,
        queryGenerator,
        sqlValidator,
        queryExecutor,
        { executeQueries: options.execute },
      );

      spinner.succeed("QueryCraft initialized");

      // Execute workflow
      if (options.verbose) {
        console.log("\n" + chalk.bold.blue("═".repeat(60)));
        console.log(chalk.bold.blue("SQL Generation Workflow"));
        console.log(chalk.bold.blue("═".repeat(60)) + "\n");
      }

      const result = await workflow.execute({
        question,
        database: options.database,
      });

      if (result.executionResult?.success && result.executionResult.data) {
        switch (options.format) {
          case "json":
            console.log("\nResults (JSON):");
            console.log(
              ResultFormatter.formatAsJSON(result.executionResult.data),
            );
            break;
          case "csv":
            console.log("\nResults (CSV):");
            console.log(
              ResultFormatter.formatAsCSV(
                result.executionResult.data,
                result.executionResult.columns || [],
              ),
            );
            break;
          case "table":
          default:
            // Already formatted in executeAndFormat
            break;
        }
      }

      // Display results
      if (!options.verbose) {
        displayCompactResult(question, result);
      } else {
        displayVerboseResult(question, result);
      }

      // Exit with appropriate code
      process.exit(result.canExecute ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error}\n`));
      process.exit(1);
    }
  });

/**
 * List available database schemas
 */
program
  .command("schemas")
  .description("List available database schemas")
  .action(async () => {
    const schemaLoader = new SchemaLoader("./data/schemas");

    console.log(chalk.bold("\nAvailable Database Schemas:\n"));

    // Try loading known schemas
    const schemas = ["ecommerce"];

    for (const schemaName of schemas) {
      const spinner = ora(`Loading ${schemaName}...`).start();

      const result = await schemaLoader.execute({ database: schemaName });

      if (result.validationStatus === "valid") {
        spinner.succeed(chalk.green(`${schemaName}`));
        console.log(chalk.gray(`  Tables: ${result.tables.join(", ")}`));
        console.log(
          chalk.gray(`  Relationships: ${result.relationships.length}\n`),
        );
      } else {
        spinner.fail(chalk.red(`${schemaName} (invalid)`));
      }
    }
  });

/**
 * Show schema details
 */
program
  .command("schema")
  .description("Show detailed schema information")
  .argument("<database>", "Database schema name")
  .action(async (database: string) => {
    const schemaLoader = new SchemaLoader("./data/schemas");

    const spinner = ora(`Loading ${database} schema...`).start();

    const result = await schemaLoader.execute({ database });

    if (result.validationStatus !== "valid") {
      spinner.fail(chalk.red(`Schema ${database} not found or invalid`));
      process.exit(1);
    }

    spinner.succeed(`Schema ${database} loaded`);

    console.log("\n" + chalk.bold.blue("═".repeat(60)));
    console.log(chalk.bold.blue(`Database Schema: ${result.schemaName}`));
    console.log(chalk.bold.blue("═".repeat(60)) + "\n");

    const formatted = schemaLoader.getFormattedSchema(result.schema);
    console.log(formatted);
  });

/**
 * Interactive mode
 */
program
  .command("interactive")
  .alias("i")
  .description("Start interactive query mode")
  .option("-d, --database <name>", "Database schema to use", "ecommerce")
  .action(async (options) => {
    console.log(chalk.bold.cyan("\nQueryCraft Interactive Mode\n"));
    console.log(chalk.gray("Type your questions in natural language."));
    console.log(chalk.gray('Type "exit" or "quit" to leave.\n'));

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(
        chalk.red("❌ ANTHROPIC_API_KEY not found in environment\n"),
      );
      process.exit(1);
    }

    // Initialize components
    const llmClient = new LLMClient({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const specLoader = new SpecLoader("./specs");
    const schemaLoader = new SchemaLoader("./data/schemas");
    const queryGenerator = new QueryGenerator(llmClient, specLoader);
    const sqlValidator = new SqlValidator(llmClient, specLoader);
    const queryExecutor = new QueryExecutor({
      dbPath: "./data/databases",
    });

    const workflow = new SqlGenerationWorkflow(
      schemaLoader,
      queryGenerator,
      sqlValidator,
      queryExecutor,
      { executeQueries: true },
    );

    console.log(chalk.gray(`Using database: ${options.database}\n`));

    // Load schema once
    const spinner = ora("Loading schema...").start();
    const schemaResult = await schemaLoader.execute({
      database: options.database,
    });

    if (schemaResult.validationStatus !== "valid") {
      spinner.fail(chalk.red("Failed to load schema"));
      process.exit(1);
    }

    spinner.succeed(`Schema loaded: ${schemaResult.tables.join(", ")}`);

    // Simple REPL
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan("querycraft> "),
    });

    rl.prompt();

    rl.on("line", async (line) => {
      const question = line.trim();

      if (!question) {
        rl.prompt();
        return;
      }

      if (question === "exit" || question === "quit") {
        console.log(chalk.gray("\nGoodbye!\n"));
        process.exit(0);
      }

      try {
        const result = await workflow.execute({
          question,
          database: options.database,
        });

        displayCompactResult(question, result);
      } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error}\n`));
      }

      rl.prompt();
    });
  });

/**
 * Display compact result (default mode)
 */
function displayCompactResult(question: string, result: any) {
  console.log(
    "\n" +
      chalk.bold("┌─────────────────────────────────────────────────────────┐"),
  );
  console.log(
    chalk.bold("│                    QUERY RESULT                         │"),
  );
  console.log(
    chalk.bold("└─────────────────────────────────────────────────────────┘\n"),
  );

  console.log(chalk.bold("Question: ") + chalk.white(question) + "\n");

  console.log(chalk.bold("Generated SQL:"));
  console.log(chalk.gray("```sql"));
  console.log(chalk.cyan(result.query));
  console.log(chalk.gray("```\n"));

  console.log(
    chalk.bold("Explanation: ") + chalk.white(result.explanation) + "\n",
  );

  console.log(
    chalk.bold("─────────────────────────────────────────────────────────"),
  );
  console.log(chalk.bold("Validation Status:"));
  console.log(
    `  ${result.confidence === "high" ? "✓" : result.confidence === "medium" ? "○" : "✗"} Confidence:     ${getConfidenceColor(result.confidence)}`,
  );
  console.log(
    `  ${result.isValid ? chalk.green("✓") : chalk.red("✗")} Valid:          ${result.isValid ? chalk.green("true") : chalk.red("false")}`,
  );
  console.log(
    `  ${result.safetyChecks ? chalk.green("✓") : chalk.red("✗")} Safety Checks:  ${result.safetyChecks ? chalk.green("true") : chalk.red("false")}`,
  );
  console.log(
    `  ${result.canExecute ? chalk.green("✓") : chalk.red("✗")} Can Execute:    ${result.canExecute ? chalk.green("true") : chalk.red("false")}`,
  );
  console.log(
    `  ${chalk.gray("✓")} Schema Used:    ${chalk.gray(result.schemaUsed)}`,
  );

  if (result.errors.length > 0) {
    console.log("\n" + chalk.red.bold("❌ Errors:"));
    result.errors.forEach((err: string) => {
      console.log(chalk.red(`  • ${err}`));
    });
  }

  if (result.warnings.length > 0) {
    console.log("\n" + chalk.yellow.bold("Warnings:"));
    result.warnings.forEach((warn: string) => {
      console.log(chalk.yellow(`  • ${warn}`));
    });
  }

  console.log(
    chalk.bold("─────────────────────────────────────────────────────────"),
  );

  if (!result.canExecute) {
    console.log(
      "\n" +
        chalk.red.bold(
          "This query cannot be executed due to validation failures.",
        ),
    );
  } else {
    console.log("\n" + chalk.green.bold("Query is safe to execute!"));
  }

  console.log("");
}

/**
 * Display verbose result
 */
function displayVerboseResult(question: string, result: any) {
  displayCompactResult(question, result);
}

/**
 * Get colored confidence level
 */
function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case "high":
      return chalk.green("high");
    case "medium":
      return chalk.yellow("medium");
    case "low":
      return chalk.red("low");
    default:
      return confidence;
  }
}

program.parse();
