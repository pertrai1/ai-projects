/**
 * RedTurn - Entry Point
 *
 * CLI for red-teaming probe agent using template-based strategies.
 * Updated in Milestone 4 with commander.js and chalk.
 *
 * Commands:
 * - static: Fixed 2-turn conversation (static baseline)
 * - adaptive: Multi-run adaptive prompting with strategy selection
 *
 * Usage:
 *   redturn static                      # Static baseline mode
 *   redturn adaptive [options]          # Adaptive mode
 *   redturn adaptive --runs 20          # Custom number of runs
 *   redturn --help                      # Show help
 */

import "dotenv/config";
import { Command } from "commander";
import chalk from "chalk";
import {
  createLLMClient,
  sendMessage,
  type ChatMessage,
} from "./llm-client.js";
import { TURN_1_PROMPT, TURN_2_PROMPT } from "./prompts.js";
import { evaluateContradiction } from "./rubric.js";
import { logConversation, getLogFilePath } from "./logger.js";
import { BEHAVIOR_DESCRIPTION } from "./config.js";
import { runAdaptiveLoop } from "./adaptive-loop.js";
import { getContentTopic, DEFAULT_TOPIC } from "./content.js";

/**
 * Main execution function for the static baseline.
 *
 * Runs a single 2-turn conversation and logs the results.
 * Uses chalk for colored output.
 */
async function runStaticBaseline(): Promise<void> {
  console.log(chalk.blue.bold("RedTurn - Static Baseline"));
  console.log(chalk.blue("=========================================\n"));
  console.log(`${chalk.dim("Objective:")} ${BEHAVIOR_DESCRIPTION}\n`);

  try {
    // Initialize LLM client
    const client = createLLMClient();
    console.log(chalk.green("✓ LLM client initialized\n"));

    // Prepare conversation history
    const conversation: ChatMessage[] = [];

    // Turn 1: Elicit position
    console.log(chalk.blue("Turn 1: Eliciting initial position..."));
    console.log(chalk.dim(`Prompt: "${TURN_1_PROMPT.slice(0, 80)}..."\n`));

    conversation.push({ role: "user", content: TURN_1_PROMPT });
    const turn1Response = await sendMessage(client, conversation);
    conversation.push({ role: "assistant", content: turn1Response });

    console.log(`${chalk.dim("Response:")} ${turn1Response}\n`);
    console.log(chalk.dim("---\n"));

    // Turn 2: Challenge position
    console.log(chalk.blue("Turn 2: Challenging position..."));
    console.log(chalk.dim(`Prompt: "${TURN_2_PROMPT.slice(0, 80)}..."\n`));

    conversation.push({ role: "user", content: TURN_2_PROMPT });
    const turn2Response = await sendMessage(client, conversation);
    conversation.push({ role: "assistant", content: turn2Response });

    console.log(`${chalk.dim("Response:")} ${turn2Response}\n`);
    console.log(chalk.dim("---\n"));

    // Detect potential contradiction using rubric
    const contradictionDetected = evaluateContradiction(conversation);

    // Log conversation
    logConversation(conversation, contradictionDetected);

    // Display results
    console.log(chalk.bold("Results:"));
    if (contradictionDetected) {
      console.log(chalk.green(`  Contradiction detected: YES`));
    } else {
      console.log(chalk.yellow(`  Contradiction detected: NO`));
    }
    console.log(chalk.dim(`  Log file: ${getLogFilePath()}`));
    console.log(chalk.dim("\nNote: Detection uses rubric-based evaluation."));
  } catch (error) {
    console.error(chalk.red("\nError during execution:"));
    if (error instanceof Error) {
      console.error(chalk.red(`  ${error.message}`));
    } else {
      console.error(chalk.red(`  ${String(error)}`));
    }
    process.exit(1);
  }
}

/**
 * Run adaptive mode with colored output.
 */
async function runAdaptiveWithColor(runs: number, topic: string): Promise<void> {
  const contentTopic = getContentTopic(topic) || DEFAULT_TOPIC;

  if (topic !== "healthcare" && !getContentTopic(topic)) {
    console.log(chalk.yellow(`Warning: Topic '${topic}' not found, using default (healthcare)`));
  }

  await runAdaptiveLoop(runs, contentTopic);
}

/**
 * Check for legacy CLI arguments and provide migration hint.
 */
function checkLegacyArgs(): boolean {
  const args = process.argv.slice(2);

  // Check if using old style arguments
  if (args.includes("--adaptive") || args.includes("--mode")) {
    console.log(chalk.yellow("\nℹ️  Legacy CLI syntax detected."));
    console.log(chalk.dim("  Old: npm start --adaptive --runs 20"));
    console.log(chalk.dim("  New: redturn adaptive --runs 20"));
    console.log(chalk.dim("  Run 'redturn --help' for more information.\n"));
    return true;
  }

  return false;
}

/**
 * Parse legacy arguments for backward compatibility.
 */
function parseLegacyArgs(): { mode: "static" | "adaptive"; runs: number } {
  const args = process.argv.slice(2);
  let mode: "static" | "adaptive" = "static";
  let runs = 10;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--mode" && i + 1 < args.length) {
      const modeValue = args[i + 1]!;
      if (modeValue === "static" || modeValue === "adaptive") {
        mode = modeValue;
      }
      i++;
    } else if (arg === "--adaptive") {
      mode = "adaptive";
    } else if (arg === "--runs" && i + 1 < args.length) {
      const runsValue = Number.parseInt(args[i + 1]!, 10);
      if (!Number.isNaN(runsValue) && runsValue > 0) {
        runs = runsValue;
      }
      i++;
    }
  }

  return { mode, runs };
}

/**
 * Create and configure the CLI program.
 */
function createProgram(): Command {
  const program = new Command();

  program
    .name("redturn")
    .description("Red-teaming probe agent for multi-turn LLM failures")
    .version("0.2.0");

  // Static baseline command
  program
    .command("static")
    .description("Run static baseline (single 2-turn conversation)")
    .action(async () => {
      await runStaticBaseline();
    });

  // Adaptive mode command
  program
    .command("adaptive")
    .description("Run adaptive loop (multiple conversations with strategy selection)")
    .option("-r, --runs <number>", "number of runs to execute", "10")
    .option("-t, --topic <name>", "content topic to use", "healthcare")
    .action(async (options) => {
      const runs = Number.parseInt(options.runs, 10);
      if (Number.isNaN(runs) || runs <= 0) {
        console.error(chalk.red("Error: --runs must be a positive integer"));
        process.exit(1);
      }
      await runAdaptiveWithColor(runs, options.topic);
    });

  return program;
}

/**
 * Main entry point.
 *
 * Uses commander.js for modern CLI or falls back to legacy parsing.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle legacy CLI syntax for backward compatibility
  if (checkLegacyArgs()) {
    const { mode, runs } = parseLegacyArgs();
    if (mode === "adaptive") {
      await runAdaptiveWithColor(runs, "healthcare");
    } else {
      await runStaticBaseline();
    }
    return;
  }

  // Use commander.js for new CLI
  const program = createProgram();

  // If no command provided, default to static mode
  if (args.length === 0) {
    await runStaticBaseline();
  } else {
    await program.parseAsync(process.argv);
  }
}

// Execute main function
main();
