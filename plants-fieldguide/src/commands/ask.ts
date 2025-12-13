import chalk from "chalk";
import ora, { type Ora } from "ora";
import { specLoader } from "../utils/spec-loader";
import { specExecutor } from "../agents/spec-executor";
import { workflowExecutor } from "../agents/workflow-executor";
import { vectorSearchTool } from "../tools/vector-search-tool";

export interface AskOptions {
  verbose?: boolean;
  agent?: string;
  workflow?: string;
  direct?: boolean;
}

export async function askCommand(
  question: string,
  options: AskOptions = {},
): Promise<void> {
  const spinner = ora("Thinking...").start();

  try {
    if (options.direct) {
      // Direct search mode - just show search results
      await directSearchMode(question, options.verbose || false, spinner);
    } else if (options.workflow) {
      // Workflow mode - use a complete workflow
      await workflowMode(question, options, spinner);
    } else if (options.agent) {
      // Agent mode - use a single agent
      await agentMode(question, options, spinner);
    } else {
      // Default: use the question-answering workflow
      await workflowMode(
        question,
        { ...options, workflow: "question-answering" },
        spinner,
      );
    }
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

async function workflowMode(
  question: string,
  options: AskOptions,
  spinner: Ora,
): Promise<void> {
  const workflowName = options.workflow || "question-answering";

  spinner.text = "Loading workflow...";
  const workflowSpec = await specLoader.loadWorkflow(workflowName);

  spinner.text = `Executing ${workflowSpec.metadata.description}...`;

  const result = await workflowExecutor.executeWorkflow(
    workflowSpec,
    { question },
    options.verbose,
  );

  spinner.succeed("Answer ready");

  // Display the result
  console.log(chalk.blue("\nFieldGuide:\n"));

  if (result.output.answer) {
    console.log(result.output.answer);

    // Show query type if available
    if (result.output.queryType) {
      console.log(chalk.dim(`\nQuery Type: ${result.output.queryType}`));
    }

    // Show citations if available
    if (result.output.citations && result.output.citations.length > 0) {
      console.log(chalk.dim("\nSources:"));
      result.output.citations.forEach((citation: any, idx: number) => {
        console.log(
          chalk.dim(
            `  ${idx + 1}. Page ${citation.page}${citation.section ? `, Section: ${citation.section}` : ""}`,
          ),
        );
      });
    }

    // Show confidence if available
    if (result.output.confidence) {
      const confidenceColor =
        result.output.confidence === "high"
          ? chalk.green
          : result.output.confidence === "medium"
            ? chalk.yellow
            : chalk.red;
      console.log(
        chalk.dim("\nConfidence:"),
        confidenceColor(result.output.confidence),
      );
    }

    // Show suggestions if available
    if (result.output.suggestions && result.output.suggestions.length > 0) {
      console.log(chalk.dim("\nYou might also ask:"));
      result.output.suggestions.forEach((suggestion: string) => {
        console.log(chalk.dim(`  • ${suggestion}`));
      });
    }
  } else {
    console.log(JSON.stringify(result.output, null, 2));
  }

  // Show workflow steps if verbose
  if (options.verbose) {
    console.log(chalk.dim("\n---"));
    console.log(chalk.dim(`Workflow: ${workflowSpec.metadata.name}`));
    console.log(
      chalk.dim(`Steps executed: ${result.stepsExecuted.join(" → ")}`),
    );
  }

  console.log(); // Empty line for spacing
}

async function agentMode(
  question: string,
  options: AskOptions,
  spinner: Ora,
): Promise<void> {
  const agentName = options.agent || "document-retriever";

  spinner.text = "Loading agent...";
  const agentSpec = await specLoader.loadAgent(agentName);

  spinner.text = "Searching documentation...";

  // Execute the agent
  const result = await specExecutor.executeAgent(agentSpec, {
    input: { question },
    verbose: options.verbose,
  });

  spinner.succeed("Answer ready");

  // Display the result
  console.log(chalk.blue("\nFieldGuide:\n"));

  if (result.output.answer) {
    console.log(result.output.answer);

    // Show citations if available
    if (result.output.citations && result.output.citations.length > 0) {
      console.log(chalk.dim("\nSources:"));
      result.output.citations.forEach((citation: any, idx: number) => {
        console.log(
          chalk.dim(
            `  ${idx + 1}. Page ${citation.page}${citation.section ? `, Section: ${citation.section}` : ""}`,
          ),
        );
      });
    }

    // Show confidence if available
    if (result.output.confidence) {
      const confidenceColor =
        result.output.confidence === "high"
          ? chalk.green
          : result.output.confidence === "medium"
            ? chalk.yellow
            : chalk.red;
      console.log(
        chalk.dim("\nConfidence:"),
        confidenceColor(result.output.confidence),
      );
    }

    // Show suggestions if available
    if (result.output.suggestions && result.output.suggestions.length > 0) {
      console.log(chalk.dim("\nYou might also ask:"));
      result.output.suggestions.forEach((suggestion: string) => {
        console.log(chalk.dim(`  • ${suggestion}`));
      });
    }
  } else if (result.output.text) {
    console.log(result.output.text);
  } else {
    console.log(JSON.stringify(result.output, null, 2));
  }

  // Show usage if verbose
  if (options.verbose && result.usage) {
    console.log(chalk.dim("\n---"));
    console.log(chalk.dim(`Model: ${result.model}`));
    console.log(chalk.dim(`Input tokens: ${result.usage.inputTokens}`));
    console.log(chalk.dim(`Output tokens: ${result.usage.outputTokens}`));
    if (result.toolsUsed) {
      console.log(chalk.dim(`Tools used: ${result.toolsUsed.join(", ")}`));
    }
  }

  console.log(); // Empty line for spacing
}

async function directSearchMode(
  question: string,
  verbose: boolean,
  spinner: Ora,
): Promise<void> {
  spinner.text = "Searching documentation...";

  // Search directly
  const results = await vectorSearchTool({ query: question, k: 5 });

  spinner.succeed(`Found ${results.length} relevant sections`);

  console.log(chalk.blue("\nSearch Results:\n"));

  results.forEach((result, idx) => {
    console.log(
      chalk.bold(
        `${idx + 1}. Page ${result.chunk.metadata.page}${result.chunk.metadata.section ? ` - ${result.chunk.metadata.section}` : ""}`,
      ),
    );
    console.log(chalk.dim(`   Relevance: ${(result.score * 100).toFixed(1)}%`));
    console.log(`   ${result.chunk.content.substring(0, 200)}...`);
    console.log();
  });
}
