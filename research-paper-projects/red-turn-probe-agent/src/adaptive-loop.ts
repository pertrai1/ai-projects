/**
 * Adaptive Loop Module
 *
 * Orchestrates multi-run execution of adaptive prompting strategy.
 * Updated in Milestone 4 to use template-based prompt generation.
 *
 * Each run:
 * 1. Executes Turn 1 with fixed prompt
 * 2. Classifies Turn 1 response
 * 3. Selects Turn 2 strategy based on classification
 * 4. Generates Turn 2 prompt using template system
 * 5. Executes Turn 2 with generated prompt
 * 6. Evaluates for contradiction using rubric
 * 7. Logs all metadata including template information
 *
 * No learning across runs - each conversation is independent.
 */

import {
  createLLMClient,
  sendMessage,
  type ChatMessage,
} from "./llm-client.js";
import { classifyResponse, type ResponseCategory } from "./classifier.js";
import { selectStrategy } from "./strategies.js";
import { evaluateContradiction } from "./rubric.js";
import {
  logAdaptiveConversation,
  getLogFilePath,
  type AdaptiveMetadata,
} from "./logger.js";
import {
  applyTemplate,
  type StrategyName,
  type TacticContext,
} from "./templates.js";
import { DEFAULT_TOPIC, type ContentTopic } from "./content.js";

/**
 * Result of a single adaptive run.
 */
export interface AdaptiveRunResult {
  readonly runId: number;
  readonly category: ResponseCategory;
  readonly strategy: StrategyName;
  readonly contradictionDetected: boolean;
  readonly conversation: readonly ChatMessage[];
}

/**
 * Aggregated statistics across all runs.
 */
export interface AdaptiveStatistics {
  readonly totalRuns: number;
  readonly contradictionsDetected: number;
  readonly successRate: number;
  readonly categoryCounts: Record<ResponseCategory, number>;
  readonly strategyCounts: Record<StrategyName, number>;
  readonly successByCategory: Record<ResponseCategory, number>;
  readonly successByStrategy: Record<StrategyName, number>;
}

/**
 * Execute a single adaptive conversation run.
 *
 * @param runId - Unique identifier for this run
 * @param contentTopic - Content topic to use for template generation
 * @returns Result of the run including metadata
 */
async function executeAdaptiveRun(
  runId: number,
  contentTopic: ContentTopic = DEFAULT_TOPIC
): Promise<AdaptiveRunResult> {
  const client = createLLMClient();
  const conversation: ChatMessage[] = [];

  // Turn 1: Elicit position (use topic's question)
  const turn1Prompt = contentTopic.question;
  conversation.push({ role: "user", content: turn1Prompt });
  const turn1Response = await sendMessage(client, conversation);
  conversation.push({ role: "assistant", content: turn1Response });

  // Classify Turn 1 response
  const classification = classifyResponse(turn1Response);
  const category = classification.category;

  // Select Turn 2 strategy based on category
  const selection = selectStrategy(category);
  const strategyName = selection.strategyName;

  // Generate Turn 2 prompt using template system
  const tacticContext: TacticContext = {
    turn1Response,
    contentTopic,
    responseCategory: category,
  };

  const templateResult = applyTemplate(strategyName, tacticContext);
  const turn2Prompt = templateResult.prompt;

  // Turn 2: Challenge with template-generated prompt
  conversation.push({ role: "user", content: turn2Prompt });
  const turn2Response = await sendMessage(client, conversation);
  conversation.push({ role: "assistant", content: turn2Response });

  // Evaluate for contradiction
  const contradictionDetected = evaluateContradiction(conversation);

  // Log conversation with adaptive metadata including template info
  const metadata: AdaptiveMetadata = {
    runId,
    responseCategory: category,
    selectedStrategy: strategyName,
    strategyRationale: selection.selectionRationale,
    classificationRationale: classification.rationale,
    matchedPatterns: classification.matchedPatterns,
    tacticsUsed: templateResult.tacticsUsed,
    contentTopicId: templateResult.metadata.contentTopicId,
    strategyIntent: templateResult.metadata.strategyIntent,
  };

  logAdaptiveConversation(conversation, contradictionDetected, metadata);

  return {
    runId,
    category,
    strategy: strategyName,
    contradictionDetected,
    conversation,
  };
}

/**
 * Calculate aggregate statistics from run results.
 *
 * @param results - Array of run results
 * @returns Aggregated statistics
 */
function calculateStatistics(
  results: readonly AdaptiveRunResult[]
): AdaptiveStatistics {
  const totalRuns = results.length;
  const contradictionsDetected = results.filter(
    (r) => r.contradictionDetected
  ).length;
  const successRate =
    totalRuns > 0 ? contradictionsDetected / totalRuns : 0;

  // Initialize counts
  const categoryCounts: Record<ResponseCategory, number> = {
    confident: 0,
    hesitant: 0,
    hedging: 0,
    unclear: 0,
  };

  const strategyCounts: Record<StrategyName, number> = {
    escalate: 0,
    accuse: 0,
    "exploit-nuance": 0,
    default: 0,
  };

  const successByCategory: Record<ResponseCategory, number> = {
    confident: 0,
    hesitant: 0,
    hedging: 0,
    unclear: 0,
  };

  const successByStrategy: Record<StrategyName, number> = {
    escalate: 0,
    accuse: 0,
    "exploit-nuance": 0,
    default: 0,
  };

  // Count occurrences and successes
  for (const result of results) {
    categoryCounts[result.category]++;
    strategyCounts[result.strategy]++;

    if (result.contradictionDetected) {
      successByCategory[result.category]++;
      successByStrategy[result.strategy]++;
    }
  }

  return {
    totalRuns,
    contradictionsDetected,
    successRate,
    categoryCounts,
    strategyCounts,
    successByCategory,
    successByStrategy,
  };
}

/**
 * Display statistics in a human-readable format.
 *
 * @param stats - Aggregated statistics to display
 */
function displayStatistics(stats: AdaptiveStatistics): void {
  console.log("\n========================================");
  console.log("Adaptive Loop Statistics");
  console.log("========================================\n");

  console.log("Overall Results:");
  console.log(`  Total runs: ${stats.totalRuns}`);
  console.log(`  Contradictions detected: ${stats.contradictionsDetected}`);
  console.log(
    `  Success rate: ${(stats.successRate * 100).toFixed(1)}%\n`
  );

  console.log("Category Distribution:");
  for (const [category, count] of Object.entries(stats.categoryCounts)) {
    const percentage = ((count / stats.totalRuns) * 100).toFixed(1);
    const successes = stats.successByCategory[category as ResponseCategory];
    const rate = count > 0 ? ((successes / count) * 100).toFixed(1) : "0.0";
    console.log(
      `  ${category}: ${count} (${percentage}%) - ${successes} contradictions (${rate}%)`
    );
  }

  console.log("\nStrategy Distribution:");
  for (const [strategy, count] of Object.entries(stats.strategyCounts)) {
    const percentage = ((count / stats.totalRuns) * 100).toFixed(1);
    const successes = stats.successByStrategy[strategy as StrategyName];
    const rate = count > 0 ? ((successes / count) * 100).toFixed(1) : "0.0";
    console.log(
      `  ${strategy}: ${count} (${percentage}%) - ${successes} contradictions (${rate}%)`
    );
  }

  console.log(`\nLog file: ${getLogFilePath()}`);
  console.log(
    "Note: Each run is independent. No learning occurs between runs.\n"
  );
}

/**
 * Execute the adaptive loop for multiple runs.
 *
 * Runs are executed sequentially to avoid API rate limits and to
 * maintain clear logging order.
 *
 * @param numRuns - Number of runs to execute (default: 10)
 * @param contentTopic - Content topic to use (default: healthcare)
 */
export async function runAdaptiveLoop(
  numRuns: number = 10,
  contentTopic: ContentTopic = DEFAULT_TOPIC
): Promise<void> {
  console.log("RedTurn - Adaptive Loop (Milestone 4)");
  console.log("======================================\n");
  console.log(`Executing ${numRuns} adaptive runs...\n`);
  console.log(`Content topic: ${contentTopic.name}\n`);

  const results: AdaptiveRunResult[] = [];

  for (let i = 1; i <= numRuns; i++) {
    console.log(`\n--- Run ${i}/${numRuns} ---`);

    try {
      const result = await executeAdaptiveRun(i, contentTopic);

      console.log(`  Category: ${result.category}`);
      console.log(`  Strategy: ${result.strategy}`);
      console.log(
        `  Contradiction: ${result.contradictionDetected ? "YES" : "NO"}`
      );

      results.push(result);
    } catch (error) {
      console.error(`\n  Error in run ${i}:`);
      if (error instanceof Error) {
        console.error(`    ${error.message}`);
      } else {
        console.error(`    ${String(error)}`);
      }
      console.log("  Continuing with next run...");
    }
  }

  // Calculate and display statistics
  if (results.length > 0) {
    const stats = calculateStatistics(results);
    displayStatistics(stats);
  } else {
    console.error(
      "\nNo runs completed successfully. Check your configuration and API key."
    );
    process.exit(1);
  }
}
