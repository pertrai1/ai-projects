#!/usr/bin/env node

import { Command } from "commander";
import { config } from "dotenv";
import chalk from "chalk";
import ora from "ora";
import { SqlGenerationWorkflow } from "./workflows/sql-generation.js";
import { SqlRefinementWorkflow } from "./workflows/sql-refinement.js";
import { InteractiveRefinementWorkflow } from "./workflows/interactive-refinement.js";
import { SchemaLoader } from "./agents/schema-loader.js";
import { QueryGenerator } from "./agents/query-generator.js";
import { SqlValidator } from "./agents/sql-validator.js";
import { QueryRefiner } from "./agents/query-refiner.js";
import { DialogManager } from "./agents/dialog-manager.js";
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
  .description("Start interactive query mode with conversational refinement")
  .option("-d, --database <name>", "Database schema to use", "ecommerce")
  .action(async (options) => {
    console.log(chalk.bold.cyan("\nQueryCraft Interactive Mode\n"));
    console.log(chalk.gray("Type your questions in natural language."));
    console.log(
      chalk.gray("Refine queries by providing feedback: 'only last month', 'sort by name', etc."),
    );
    console.log(chalk.gray('Commands: /new, /history, /clear, /help, exit/quit\n'));

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
    const queryRefiner = new QueryRefiner(llmClient, specLoader);
    const sqlValidator = new SqlValidator(llmClient, specLoader);
    const queryExecutor = new QueryExecutor({
      dbPath: "./data/databases",
    });

    const sqlWorkflow = new SqlGenerationWorkflow(
      schemaLoader,
      queryGenerator,
      sqlValidator,
      queryExecutor,
      { executeQueries: true },
    );

    const refinementWorkflow = new SqlRefinementWorkflow(
      sqlWorkflow,
      queryRefiner,
    );

    const dialogManager = new DialogManager(options.database);

    const interactiveWorkflow = new InteractiveRefinementWorkflow(
      dialogManager,
      sqlWorkflow,
      refinementWorkflow,
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
      const input = line.trim();

      if (!input) {
        rl.prompt();
        return;
      }

      if (input === "exit" || input === "quit") {
        console.log(chalk.gray("\nGoodbye!\n"));
        process.exit(0);
      }

      // Handle commands
      if (input.startsWith("/")) {
        handleCommand(input, interactiveWorkflow, rl);
        return;
      }

      try {
        const turnResult = await interactiveWorkflow.handleTurn(input);

        // Update prompt with turn number
        rl.setPrompt(chalk.cyan(`querycraft [${turnResult.turnNumber}]> `));

        displayInteractiveResult(input, turnResult);
      } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error}\n`));
      }

      rl.prompt();
    });
  });

/**
 * Handle interactive commands
 */
function handleCommand(
  command: string,
  workflow: InteractiveRefinementWorkflow,
  rl: any,
) {
  const cmd = command.toLowerCase();

  switch (cmd) {
    case "/new":
      workflow.resetConversation();
      console.log(chalk.green("\n✓ Conversation reset. Starting new query.\n"));
      rl.setPrompt(chalk.cyan("querycraft> "));
      rl.prompt();
      break;

    case "/clear":
      workflow.resetConversation();
      console.log(chalk.green("\n✓ Conversation cleared.\n"));
      rl.setPrompt(chalk.cyan("querycraft> "));
      rl.prompt();
      break;

    case "/history":
      const history = workflow.getHistory();
      if (history.length === 0) {
        console.log(chalk.gray("\nNo conversation history yet.\n"));
      } else {
        console.log(chalk.bold.cyan("\nConversation History:\n"));
        history.forEach((turn, idx) => {
          const intentIcon = turn.intent === "new_query" ? "🆕" : "✨";
          console.log(
            chalk.bold(`${idx + 1}. ${intentIcon} ${turn.intent === "new_query" ? "New Query" : "Refinement"}`),
          );
          console.log(chalk.white(`   Input: ${turn.userInput}`));
          if (turn.result?.query) {
            console.log(chalk.gray(`   Query: ${turn.result.query.substring(0, 60)}...`));
          }
          console.log("");
        });
      }
      rl.prompt();
      break;

    case "/help":
      console.log(chalk.bold.cyan("\nAvailable Commands:\n"));
      console.log(chalk.white("  /new      - Start a new query (reset conversation)"));
      console.log(chalk.white("  /history  - Show conversation history"));
      console.log(chalk.white("  /clear    - Clear conversation history"));
      console.log(chalk.white("  /help     - Show this help message"));
      console.log(chalk.white("  exit/quit - Exit interactive mode\n"));
      console.log(chalk.bold.cyan("Refinement Tips:\n"));
      console.log(
        chalk.gray("  • Use short phrases to refine: 'only last month', 'sort by name'"),
      );
      console.log(
        chalk.gray("  • Add filters: 'also show email', 'exclude canceled orders'"),
      );
      console.log(
        chalk.gray("  • Modify results: 'limit to 10', 'group by category'\n"),
      );
      rl.prompt();
      break;

    default:
      console.log(
        chalk.red(`\nUnknown command: ${command}`),
      );
      console.log(chalk.gray("Type /help for available commands\n"));
      rl.prompt();
      break;
  }
}

/**
 * Display interactive result with conversation context
 */
function displayInteractiveResult(
  userInput: string,
  turnResult: any,
) {
  const intentIcon = turnResult.intent === "new_query" ? "🆕" : "✨";
  const intentLabel =
    turnResult.intent === "new_query" ? "New Query" : "Refined Query";

  console.log(
    "\n" +
      chalk.bold("┌─────────────────────────────────────────────────────────┐"),
  );
  console.log(
    chalk.bold(
      `│  ${intentIcon} ${intentLabel.padEnd(48)} │`,
    ),
  );
  console.log(
    chalk.bold("└─────────────────────────────────────────────────────────┘\n"),
  );

  const result = turnResult.result;

  if (turnResult.intent === "refinement") {
    console.log(chalk.bold("Refining based on: ") + chalk.white(userInput) + "\n");
  } else {
    console.log(chalk.bold("Question: ") + chalk.white(userInput) + "\n");
  }

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

  // Show execution results if available
  if (result.executionResult && result.executionResult.success) {
    console.log(
      chalk.bold("\n─────────────────────────────────────────────────────────"),
    );
    console.log(chalk.bold("Execution Results:\n"));
    console.log(
      chalk.gray(
        `  Execution time: ${result.executionResult.executionTime}ms`,
      ),
    );
    console.log(
      chalk.gray(`  Rows returned: ${result.executionResult.rowCount}`),
    );

    if (
      result.executionResult.data &&
      result.executionResult.data.length > 0
    ) {
      console.log("\n" + chalk.bold("Results:"));
      console.log(
        ResultFormatter.formatAsTable(
          result.executionResult.data,
          result.executionResult.columns || [],
          { maxRows: 10 },
        ),
      );
    } else {
      console.log(chalk.gray("\n  No rows returned."));
    }
  }

  if (result.errors && result.errors.length > 0) {
    console.log("\n" + chalk.red.bold("❌ Errors:"));
    result.errors.forEach((err: string) => {
      console.log(chalk.red(`  • ${err}`));
    });
  }

  if (result.warnings && result.warnings.length > 0) {
    console.log("\n" + chalk.yellow.bold("Warnings:"));
    result.warnings.forEach((warn: string) => {
      console.log(chalk.yellow(`  • ${warn}`));
    });
  }

  console.log(
    chalk.bold("─────────────────────────────────────────────────────────"),
  );
  console.log(
    chalk.gray(
      `\nTurn ${turnResult.turnNumber} | Type /help for commands\n`,
    ),
  );
}

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
