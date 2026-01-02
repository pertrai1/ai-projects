/**
 * RedTurn - Milestone 1: Static Baseline
 *
 * This script executes a fixed 2-turn conversation to test for self-contradiction.
 * It represents a non-adaptive baseline that will be compared against adaptive
 * strategies in future milestones.
 *
 * Execution flow:
 * 1. Initialize LLM client
 * 2. Execute Turn 1 (elicit position)
 * 3. Execute Turn 2 (challenge position)
 * 4. Detect potential contradiction
 * 5. Log full conversation
 * 6. Display results
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

/**
 * Main execution function for the static baseline.
 *
 * Runs a single 2-turn conversation and logs the results.
 * No loops, no adaptation, no learning - just a fixed sequence.
 */
async function main(): Promise<void> {
  console.log("RedTurn - Static Baseline (Milestone 1)");
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
    console.log(
      "\nNote: Detection uses rubric-based evaluation (Milestone 2).",
    );
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

// Execute main function
main();
