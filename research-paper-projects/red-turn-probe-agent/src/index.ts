/**
 * RedTurn - Entry Point
 *
 * Routes execution between static baseline and adaptive loop.
 *
 * Modes:
 * - static: Fixed 2-turn conversation (default)
 * - adaptive: Multi-run adaptive prompting with strategy selection
 *
 * Usage:
 *   npm start                    # Static baseline (1 run)
 *   npm run start:adaptive       # Adaptive loop (10 runs default)
 *   npm run start:adaptive -- --runs 20  # Adaptive loop (custom runs)
 */

import "dotenv/config";
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

/**
 * Parse command line arguments.
 *
 * @returns Parsed arguments
 */
function parseArgs(): {
  mode: "static" | "adaptive";
  runs: number;
} {
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
 * Main execution function for the static baseline.
 *
 * Runs a single 2-turn conversation and logs the results.
 * No loops, no adaptation, no learning - just a fixed sequence.
 */
async function runStaticBaseline(): Promise<void> {
  console.log("RedTurn - Static Baseline");
  console.log("=========================================\n");
  console.log(`Objective: ${BEHAVIOR_DESCRIPTION}\n`);

  try {
    // Initialize LLM client
    const client = createLLMClient();
    console.log("✓ LLM client initialized\n");

    // Prepare conversation history
    const conversation: ChatMessage[] = [];

    // Turn 1: Elicit position
    console.log("Turn 1: Eliciting initial position...");
    console.log(`Prompt: "${TURN_1_PROMPT.slice(0, 80)}..."\n`);

    conversation.push({ role: "user", content: TURN_1_PROMPT });
    const turn1Response = await sendMessage(client, conversation);
    conversation.push({ role: "assistant", content: turn1Response });

    console.log(`Response: ${turn1Response}\n`);
    console.log("---\n");

    // Turn 2: Challenge position
    console.log("Turn 2: Challenging position...");
    console.log(`Prompt: "${TURN_2_PROMPT.slice(0, 80)}..."\n`);

    conversation.push({ role: "user", content: TURN_2_PROMPT });
    const turn2Response = await sendMessage(client, conversation);
    conversation.push({ role: "assistant", content: turn2Response });

    console.log(`Response: ${turn2Response}\n`);
    console.log("---\n");

    // Detect potential contradiction using rubric
    const contradictionDetected = evaluateContradiction(conversation);

    // Log conversation
    logConversation(conversation, contradictionDetected);

    // Display results
    console.log("Results:");
    console.log(
      `  Contradiction detected: ${contradictionDetected ? "YES" : "NO"}`,
    );
    console.log(`  Log file: ${getLogFilePath()}`);
    console.log("\nNote: Detection uses rubric-based evaluation.");
  } catch (error) {
    console.error("\nError during execution:");
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error(`  ${String(error)}`);
    }
    process.exit(1);
  }
}

/**
 * Main entry point.
 *
 * Routes to static baseline or adaptive loop based on arguments.
 */
async function main(): Promise<void> {
  const { mode, runs } = parseArgs();

  if (mode === "adaptive") {
    await runAdaptiveLoop(runs);
  } else {
    await runStaticBaseline();
  }
}

// Execute main function
main();
