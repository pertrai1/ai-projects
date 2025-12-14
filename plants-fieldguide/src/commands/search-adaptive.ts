/**
 * Adaptive Search Command
 *
 * This command demonstrates adaptive retrieval - how search parameters
 * change based on query characteristics.
 */

import chalk from "chalk";
import ora, { type Ora } from "ora";
import { adaptiveRetrieval } from "../utils/adaptive-retrieval.js";
import { agentRouter } from "../utils/agent-router.js";

export interface SearchAdaptiveOptions {
  verbose?: boolean;
  showStrategy?: boolean; // Show only the strategy, don't execute search
  compare?: boolean; // Compare with fixed k=5 search
}

/**
 * Search Adaptive Command
 *
 * Use --show-strategy to see what strategy would be chosen
 * Use --compare to see adaptive vs fixed search side-by-side
 *
 * @param query - The search query
 * @param options - Command options
 */
export async function searchAdaptiveCommand(
  query: string,
  options: SearchAdaptiveOptions = {},
): Promise<void> {
  const spinner = ora("Analyzing query...").start();

  try {
    // Get routing context (helps with strategy decisions)
    const routing = await agentRouter.getRouting(query);

    if (options.showStrategy) {
      // Mode: Show strategy only
      await showStrategyOnly(query, routing, spinner);
      return;
    }

    if (options.compare) {
      // Mode: Adaptive vs Fixed
      await compareSearches(query, routing, options, spinner);
      return;
    }

    // Mode: Execute adaptive search
    await executeAdaptiveSearch(query, routing, options, spinner);
  } catch (error) {
    spinner.fail("Search failed");

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
 * Show only the retrieval strategy (educational mode)
 * This helps to understand how the system thinks about different queries.
 */
async function showStrategyOnly(
  query: string,
  routing: any,
  spinner: Ora,
): Promise<void> {
  spinner.text = "Determining optimal search strategy...";

  const strategy = await adaptiveRetrieval.getStrategy(query, routing, false);

  spinner.succeed("Strategy determined");

  console.log(chalk.blue("\nAdaptive Retrieval Strategy\n"));

  console.log(chalk.bold("Query:"), query);
  console.log(chalk.bold("Query Type:"), routing.agentType);
  console.log();

  // Show strategy parameters
  console.log(chalk.bold("Search Parameters:"));
  console.log(chalk.dim("  k (results):"), chalk.cyan(strategy.k.toString()));
  console.log(
    chalk.dim("  Exact match:"),
    strategy.exactMatch ? chalk.green("✓ Yes") : chalk.yellow("No"),
  );
  console.log(
    chalk.dim("  Expand query:"),
    strategy.expandQuery ? chalk.green("✓ Yes") : chalk.yellow("No"),
  );
  console.log(
    chalk.dim("  Multi-pass:"),
    strategy.multiPass ? chalk.green("✓ Yes") : chalk.yellow("No"),
  );
  console.log(
    chalk.dim("  Rerank:"),
    strategy.rerank ? chalk.green("✓ Yes") : chalk.yellow("No"),
  );

  if (strategy.sections && strategy.sections.length > 0) {
    console.log(
      chalk.dim("  Target sections:"),
      chalk.cyan(strategy.sections.join(", ")),
    );
  } else {
    console.log(chalk.dim("  Target sections:"), chalk.gray("All sections"));
  }

  console.log();

  // Show reasoning
  console.log(chalk.bold("Reasoning:"));
  console.log(chalk.dim(`  ${strategy.reasoning}`));
  console.log();

  // Show query expansions if any
  if (strategy.queryExpansions && strategy.queryExpansions.length > 0) {
    console.log(chalk.bold("Query Expansions:"));
    strategy.queryExpansions.forEach((expansion) => {
      console.log(chalk.dim(`  • ${expansion}`));
    });
    console.log();
  }

  // Confidence
  const confidenceColor =
    strategy.confidence === "high"
      ? chalk.green
      : strategy.confidence === "medium"
        ? chalk.yellow
        : chalk.red;

  console.log(chalk.bold("Confidence:"), confidenceColor(strategy.confidence));
  console.log();

  // Educational note
  console.log(chalk.dim("This shows the strategy only."));
  console.log(chalk.dim("   Remove --show-strategy to execute the search.\n"));
}

/**
 * Execute adaptive search and show results
 */
async function executeAdaptiveSearch(
  query: string,
  routing: any,
  options: SearchAdaptiveOptions,
  spinner: Ora,
): Promise<void> {
  spinner.text = "Executing adaptive search...";

  const searchResult = await adaptiveRetrieval.search({
    query,
    routingContext: routing,
    verbose: options.verbose,
  });

  spinner.succeed(
    `Found ${searchResult.results.length} results (${searchResult.searchesPerformed} ${searchResult.searchesPerformed === 1 ? "search" : "searches"} performed)`,
  );

  console.log(chalk.blue("\nAdaptive Search Results\n"));

  // Show strategy summary
  console.log(
    chalk.bold("Strategy:"),
    chalk.dim(
      `k=${searchResult.strategy.k}, exactMatch=${searchResult.strategy.exactMatch}, expandQuery=${searchResult.strategy.expandQuery}`,
    ),
  );
  console.log();

  // Show results
  searchResult.results.forEach((result, idx) => {
    console.log(
      chalk.bold(
        `${idx + 1}. Page ${result.chunk.metadata.page}${result.chunk.metadata.section ? ` - ${result.chunk.metadata.section}` : ""}`,
      ),
    );
    console.log(chalk.dim(`   Score: ${(result.score * 100).toFixed(1)}%`));
    console.log(`   ${result.chunk.content.substring(0, 150)}...`);
    console.log();
  });

  if (options.verbose) {
    console.log(chalk.dim("───────────────────────────────────────"));
    console.log(chalk.dim("Strategy Details:"));
    console.log(chalk.dim(`Reasoning: ${searchResult.strategy.reasoning}`));
    console.log(
      chalk.dim(`Searches performed: ${searchResult.searchesPerformed}`),
    );
    console.log();
  }
}

/**
 * Compare adaptive search vs fixed k=5 search
 * See how adaptive retrieval differs from always using k=5
 */
async function compareSearches(
  query: string,
  routing: any,
  options: SearchAdaptiveOptions,
  spinner: Ora,
): Promise<void> {
  spinner.text = "Running comparison...";

  // Run adaptive search
  const adaptiveResult = await adaptiveRetrieval.search({
    query,
    routingContext: routing,
    verbose: false,
  });

  // Run fixed search (simulate traditional RAG)
  const { embeddingsGenerator } = await import("../utils/embeddings.js");
  const { vectorStore } = await import("../utils/vector-store.js");

  const queryEmbedding = await embeddingsGenerator.generateEmbedding(query);
  const fixedResults = await vectorStore.search(queryEmbedding, 5);

  spinner.succeed("Comparison complete");

  console.log(chalk.blue("\nAdaptive vs Fixed Search Comparison\n"));

  console.log(chalk.bold("Query:"), query);
  console.log();

  // Adaptive results
  console.log(chalk.green("ADAPTIVE SEARCH (Smart)"));
  console.log(
    chalk.dim(
      `   Parameters: k=${adaptiveResult.strategy.k}, exactMatch=${adaptiveResult.strategy.exactMatch}`,
    ),
  );
  console.log(chalk.dim(`   Reasoning: ${adaptiveResult.strategy.reasoning}`));
  console.log(chalk.dim(`   Results: ${adaptiveResult.results.length} chunks`));
  console.log();

  adaptiveResult.results.slice(0, 3).forEach((result, idx) => {
    console.log(
      chalk.dim(
        `   ${idx + 1}. [${(result.score * 100).toFixed(1)}%] ${result.chunk.content.substring(0, 100)}...`,
      ),
    );
  });

  console.log();

  // Fixed results
  console.log(chalk.yellow("FIXED SEARCH (Traditional RAG)"));
  console.log(chalk.dim("   Parameters: k=5 (always)"));
  console.log(chalk.dim(`   Results: ${fixedResults.length} chunks`));
  console.log();

  fixedResults.slice(0, 3).forEach((result, idx) => {
    console.log(
      chalk.dim(
        `   ${idx + 1}. [${(result.score * 100).toFixed(1)}%] ${result.chunk.content.substring(0, 100)}...`,
      ),
    );
  });

  console.log();

  // Analysis
  console.log(chalk.bold("Analysis"));

  const efficiencyGain =
    adaptiveResult.strategy.k < 5
      ? `${Math.round(((5 - adaptiveResult.strategy.k) / 5) * 100)}% fewer results retrieved`
      : adaptiveResult.strategy.k > 5
        ? `${Math.round(((adaptiveResult.strategy.k - 5) / 5) * 100)}% more comprehensive`
        : "Same retrieval count";

  console.log(chalk.dim("   Efficiency:"), efficiencyGain);

  if (adaptiveResult.strategy.k !== 5) {
    console.log(
      chalk.dim("   Why different:"),
      adaptiveResult.strategy.reasoning,
    );
  }

  console.log();
}
