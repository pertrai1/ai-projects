/**
 * Ask Synthesized Command - Uses Multi-Source Retrieval + Response Synthesis
 *
 * This command demonstrates the full intelligence stack:
 * 1. Query Routing (Step 1) - Select specialized agent
 * 2. Adaptive Retrieval (Step 2) - Optimize search parameters
 * 3. Multi-Source Retrieval (Step 3) - Combine multiple search strategies
 * 4. Response Synthesis (Step 3) - Synthesize comprehensive answer
 */

import chalk from "chalk";
import ora, { type Ora } from "ora";
import { agentRouter } from "../utils/agent-router.js";
import { adaptiveRetrieval } from "../utils/adaptive-retrieval.js";
import { multiSourceRetrieval } from "../utils/multi-source-retrieval.js";
import { specLoader } from "../utils/spec-loader.js";
import { specExecutor } from "../agents/spec-executor.js";

export interface AskSynthesizedOptions {
  verbose?: boolean;
  showSources?: boolean; // Show which sources contributed
  fusionMethod?: "RRF" | "score-based" | "simple";
}

/**
 * Ask Synthesized Command
 * Full Multi-Agent Pipeline
 */
export async function askSynthesizedCommand(
  question: string,
  options: AskSynthesizedOptions = {},
): Promise<void> {
  const spinner = ora("Processing your question...").start();

  try {
    // Query Routing
    spinner.text = "Analyzing query type...";
    const routing = await agentRouter.getRouting(question);

    if (options.verbose) {
      console.log(`\n[Pipeline] Routed to: ${routing.agentType}`);
    }

    // Adaptive Retrieval Strategy
    spinner.text = "Determining retrieval strategy...";
    const strategy = await adaptiveRetrieval.getStrategy(
      question,
      routing,
      false,
    );

    if (options.verbose) {
      console.log(
        `[Pipeline] Strategy: k=${strategy.k}, expandQuery=${strategy.expandQuery}`,
      );
    }

    // Multi-Source Retrieval
    spinner.text = "Executing multi-source search...";
    const multiSourceResults = await multiSourceRetrieval.search({
      query: question,
      primaryStrategy: strategy,
      useKeywordBoost: true,
      useSectionFilter: !!(strategy.sections && strategy.sections.length > 0),
      useQueryExpansion: strategy.expandQuery,
      fusionMethod: options.fusionMethod || "RRF",
      verbose: options.verbose || false,
    });

    if (options.verbose) {
      console.log(
        `[Pipeline] Retrieved ${multiSourceResults.results.length} results from ${multiSourceResults.totalSources} sources`,
      );
      console.log(
        `[Pipeline] Fusion method: ${multiSourceResults.fusionMethod}`,
      );
    }

    // Response Synthesis
    spinner.text = "Synthesizing answer...";
    const synthesizerSpec = await specLoader.loadAgent("response-synthesizer");

    // Prepare input for synthesizer
    const synthesizerInput = {
      question,
      primaryResults: multiSourceResults.results.filter(
        (r) => r.source === "primary",
      ),
      alternativeResults: multiSourceResults.results.filter(
        (r) => r.source !== "primary",
      ),
      strategies: multiSourceResults.strategies,
      fusionMethod: multiSourceResults.fusionMethod,
    };

    const synthesisResult = await specExecutor.executeAgent(synthesizerSpec, {
      input: synthesizerInput,
      verbose: options.verbose || false,
    });

    spinner.succeed("Answer synthesized");

    displayResults(
      question,
      routing,
      strategy,
      multiSourceResults,
      synthesisResult.output,
      options,
    );
  } catch (error) {
    spinner.fail("Failed to answer question");

    if (error instanceof Error) {
      console.error(chalk.red("\nError:"), error.message);

      if (error.message.includes("Vector store not found")) {
        console.log(
          chalk.yellow(
            '\nTip: Run "fieldguide index" first to index the documentation\n',
          ),
        );
      }

      if (options.verbose) {
        console.error(chalk.dim("\nStack trace:"));
        console.error(chalk.dim(error.stack));
      }
    }

    process.exit(1);
  }
}

/**
 * Display synthesized results
 */
function displayResults(
  question: string,
  routing: any,
  strategy: any,
  multiSourceResults: any,
  synthesis: any,
  options: AskSynthesizedOptions,
): void {
  console.log(chalk.blue("\nFieldGuide (Synthesized Mode)\n"));

  // Display the answer
  console.log(synthesis.answer);
  console.log();

  // Show confidence
  const confidenceColor =
    synthesis.confidence === "high"
      ? chalk.green
      : synthesis.confidence === "medium"
        ? chalk.yellow
        : chalk.red;

  console.log(chalk.dim("Confidence:"), confidenceColor(synthesis.confidence));

  // Show coverage
  if (synthesis.coverage) {
    const coverageItems = [];
    if (synthesis.coverage.definition) coverageItems.push("Definition");
    if (synthesis.coverage.examples) coverageItems.push("Examples");
    if (synthesis.coverage.usage) coverageItems.push("Usage");
    if (synthesis.coverage.procedures) coverageItems.push("Procedures");

    if (coverageItems.length > 0) {
      console.log(chalk.dim("Coverage:"), coverageItems.join(", "));
    }
  }

  console.log();

  // Show synthesis info
  if (synthesis.synthesis) {
    const synthTypes = [];
    if (synthesis.synthesis.complementary)
      synthTypes.push("Complementary sources");
    if (synthesis.synthesis.redundant)
      synthTypes.push("Redundant confirmation");
    if (synthesis.synthesis.conflicting)
      synthTypes.push(chalk.yellow("⚠ Conflicting info"));

    if (synthTypes.length > 0) {
      console.log(chalk.dim("Synthesis:"), synthTypes.join(", "));
    }
  }

  // Show sources used
  if (synthesis.sourcesUsed) {
    console.log(
      chalk.dim("Sources:"),
      `${synthesis.sourcesUsed.primary} primary + ${synthesis.sourcesUsed.alternative} alternative = ${synthesis.sourcesUsed.total} total`,
    );
  }

  // Show which retrieval strategies contributed (if requested)
  if (options.showSources && multiSourceResults.strategies) {
    console.log();
    console.log(chalk.bold("Retrieval Strategies:"));
    multiSourceResults.strategies.forEach((strat: any) => {
      console.log(
        chalk.dim(`  • ${strat.type}:`),
        `${strat.count} results (avg score: ${(strat.avgScore * 100).toFixed(1)}%)`,
      );
    });
  }

  // Show citations
  if (synthesis.citations && synthesis.citations.length > 0) {
    console.log();
    console.log(chalk.dim("Citations:"));
    synthesis.citations.forEach((citation: any, idx: number) => {
      const relevanceColor =
        citation.relevance === "high"
          ? chalk.green
          : citation.relevance === "medium"
            ? chalk.yellow
            : chalk.gray;

      console.log(
        chalk.dim(`  ${idx + 1}.`),
        `Page ${citation.page}`,
        citation.section ? chalk.dim(`- ${citation.section}`) : "",
        relevanceColor(`[${citation.relevance}]`),
        citation.strategy ? chalk.dim(`(${citation.strategy})`) : "",
      );
    });
  }

  // Show suggestions
  if (synthesis.suggestions && synthesis.suggestions.length > 0) {
    console.log();
    console.log(chalk.dim("You might also ask:"));
    synthesis.suggestions.forEach((suggestion: string) => {
      console.log(chalk.dim(`  • ${suggestion}`));
    });
  }

  // Show pipeline info in verbose mode
  if (options.verbose) {
    console.log();
    console.log(chalk.dim("─".repeat(60)));
    console.log(chalk.dim("Pipeline Details"));
    console.log(chalk.dim("─".repeat(60)));
    console.log(chalk.dim("Query Type:"), routing.agentType);
    console.log(chalk.dim("Routing Confidence:"), routing.confidence);
    console.log(
      chalk.dim("Retrieval Strategy:"),
      `k=${strategy.k}, expandQuery=${strategy.expandQuery}`,
    );
    console.log(chalk.dim("Search Sources:"), multiSourceResults.totalSources);
    console.log(chalk.dim("Fusion Method:"), multiSourceResults.fusionMethod);
    console.log(
      chalk.dim("Results Retrieved:"),
      multiSourceResults.results.length,
    );
  } else {
    // Show simplified pipeline info
    console.log();
    console.log(
      chalk.dim(
        `${routing.agentType.replace(/_/g, " ")} | ${multiSourceResults.totalSources} sources | ${multiSourceResults.fusionMethod} fusion`,
      ),
    );
  }

  console.log();
}
