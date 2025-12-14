/**
 * Smart Ask Command - Uses Intelligent Query Routing
 *
 * This file implements a CLI command. Commands are entry points that:
 * 1. Accept user input (arguments and options)
 * 2. Call business logic (agent routing)
 * 3. Display results to the user
 */

import chalk from "chalk";
import ora, { type Ora } from "ora";
import { agentRouter } from "../utils/agent-router.js";

export interface AskSmartOptions {
  verbose?: boolean; // Show detailed routing information
  showRouting?: boolean; // Show routing decision without executing
}

/**
 * Ask Smart Command
 * Instead of using the same workflow for all questions, this command:
 * 1. Analyzes the question type
 * 2. Routes to a specialized agent
 * 3. Shows you which agent was used and why
 *
 * @param question - The user's question
 * @param options - Command options (verbose, showRouting, etc.)
 */
export async function askSmartCommand(
  question: string,
  options: AskSmartOptions = {},
): Promise<void> {
  const spinner = ora("Analyzing your question...").start();

  try {
    // Just show the routing decision (debugging/educational mode)
    if (options.showRouting) {
      await showRoutingOnly(question, spinner);
      return;
    }

    // Full routing + execution
    await routeAndAnswer(question, options, spinner);
  } catch (error) {
    spinner.fail("Failed to answer question");

    if (error instanceof Error) {
      console.error(chalk.red("\nError:"), error.message);

      // Provide helpful tips for common errors
      if (error.message.includes("Vector store not found")) {
        console.log(
          chalk.yellow(
            '\nTip: Run "fieldguide index" first to index the documentation\n',
          ),
        );
      }

      if (error.message.includes("Agent spec not found")) {
        console.log(
          chalk.yellow(
            "\nTip: Make sure all agent spec files are in the specs/agents/ directory\n",
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
 * Show only the routing decision (educational mode)
 *
 * - Which agent type was selected
 * - Why it was selected
 * - Confidence level
 * - Extracted keywords
 * - Suggested search strategy
 *
 * Use this to understand how the router thinks!
 *
 * Example:
 *   npm run cli -- ask-smart "What is FACW?" --show-routing
 */
async function showRoutingOnly(question: string, spinner: Ora): Promise<void> {
  spinner.text = "Analyzing query routing...";

  const routing = await agentRouter.getRouting(question);

  if (!routing.agentType || !routing.confidence || !routing.keywords) {
    spinner.fail("Routing failed - invalid response from router");
    console.error(chalk.red("\nRouter returned incomplete data:"));
    console.error(JSON.stringify(routing, null, 2));
    console.log(
      chalk.yellow(
        "\nThis usually means the router agent needs to be configured to return pure JSON.",
      ),
    );
    process.exit(1);
  }

  spinner.succeed("Routing analysis complete");

  console.log(chalk.blue("\nRouting Decision\n"));

  console.log(chalk.bold("Question:"), question);
  console.log();

  // Show which agent was selected
  const agentColor =
    routing.confidence === "high"
      ? chalk.green
      : routing.confidence === "medium"
        ? chalk.yellow
        : chalk.red;

  console.log(
    chalk.bold("Selected Agent:"),
    agentColor(routing.agentType),
    chalk.dim(`(${routing.confidence} confidence)`),
  );
  console.log();

  // Explain why
  console.log(chalk.bold("Reasoning:"));
  console.log(chalk.dim(`  ${routing.reasoning}`));
  console.log();

  // Show extracted information
  console.log(chalk.bold("Keywords:"), routing.keywords.join(", "));
  console.log(chalk.bold("Search Strategy:"), routing.searchStrategy);
  console.log();

  // Educational note
  console.log(chalk.dim("This shows the routing decision only."));
  console.log(
    chalk.dim("   Remove --show-routing to execute the selected agent.\n"),
  );
}

/**
 * Route and execute the appropriate agent
 *
 * 1. Routes the question to the right agent
 * 2. Executes that agent
 * 3. Displays the result with routing context
 */
async function routeAndAnswer(
  question: string,
  options: AskSmartOptions,
  spinner: Ora,
): Promise<void> {
  spinner.text = "Routing to specialized agent...";

  // Execute routing and get answer
  const result = await agentRouter.routeAndExecute(
    question,
    options.verbose || false,
  );

  spinner.succeed("Answer ready");

  console.log(chalk.blue("\nFieldGuide\n"));
  console.log(result.answer);

  if (options.verbose) {
    console.log(chalk.dim("\n" + "─".repeat(60)));
    console.log(chalk.dim("Routing Details"));
    console.log(chalk.dim("─".repeat(60)));

    const confidenceColor =
      result.routingConfidence === "high"
        ? chalk.green
        : result.routingConfidence === "medium"
          ? chalk.yellow
          : chalk.red;

    console.log(
      chalk.dim("Routed to:"),
      confidenceColor(result.routedTo),
      chalk.dim(`(${result.routingConfidence} confidence)`),
    );
    console.log(chalk.dim("Reasoning:"), result.reasoning);
    console.log(chalk.dim("Keywords:"), result.keywords.join(", "));
    console.log(chalk.dim("Search strategy:"), result.searchStrategy);
  } else {
    // Even in non-verbose mode, show which agent was used
    console.log();
    console.log(chalk.dim(`Routed to: ${result.routedTo.replace(/_/g, " ")}`));
  }

  // Show citations (if available)
  if (result.citations && result.citations.length > 0) {
    console.log(chalk.dim("\nSources:"));
    result.citations.forEach((citation: any, idx: number) => {
      console.log(
        chalk.dim(
          `  ${idx + 1}. Page ${citation.page}${citation.section ? `, Section: ${citation.section}` : ""}`,
        ),
      );
    });
  }

  // Show confidence (if available from specialized agent)
  if (result.confidence) {
    const confidenceColor =
      result.confidence === "high"
        ? chalk.green
        : result.confidence === "medium"
          ? chalk.yellow
          : chalk.red;
    console.log(chalk.dim("\nConfidence:"), confidenceColor(result.confidence));
  }

  // Show related terms (if available from definition-lookup agent)
  if (result.relatedTerms && result.relatedTerms.length > 0) {
    console.log(chalk.dim("\nRelated terms:"));
    result.relatedTerms.forEach((term: string) => {
      console.log(chalk.dim(`  • ${term}`));
    });
  }

  // Show related procedures (if available from how-to-guide agent)
  if (result.relatedProcedures && result.relatedProcedures.length > 0) {
    console.log(chalk.dim("\nRelated procedures:"));
    result.relatedProcedures.forEach((proc: string) => {
      console.log(chalk.dim(`  • ${proc}`));
    });
  }

  // Show key differences (if available from comparison agent)
  if (result.keyDifferences && result.keyDifferences.length > 0) {
    console.log(chalk.dim("\nKey differences:"));
    result.keyDifferences.forEach((diff: string, idx: number) => {
      console.log(chalk.dim(`  ${idx + 1}. ${diff}`));
    });
  }

  // Show suggestions (if available)
  if (result.suggestions && result.suggestions.length > 0) {
    console.log(chalk.dim("\nYou might also ask:"));
    result.suggestions.forEach((suggestion: string) => {
      console.log(chalk.dim(`  • ${suggestion}`));
    });
  }

  console.log(); // Empty line for spacing
}
