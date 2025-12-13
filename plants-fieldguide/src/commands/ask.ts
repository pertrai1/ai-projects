import chalk from "chalk";
import ora from "ora";
import { specLoader } from "../utils/spec-loader.js";
import { specExecutor } from "../agents/spec-executor.js";

export interface AskOptions {
  verbose?: boolean;
  agent?: string;
}

export async function askCommand(
  question: string,
  options: AskOptions = {},
): Promise<void> {
  const spinner = ora("Loading agent specification...").start();

  try {
    // Load the agent spec
    const agentName = options.agent || "greeter";
    const agentSpec = await specLoader.loadAgent(agentName);

    spinner.text = `Executing ${agentSpec.metadata.name} agent...`;

    // Execute the agent
    const result = await specExecutor.executeAgent(agentSpec, {
      input: { question },
      verbose: options.verbose,
    });

    spinner.succeed("Agent execution complete");

    // Display the result
    console.log(chalk.blue("FieldGuide:\n"));

    if (result.output.greeting) {
      console.log(result.output.greeting);
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
    }

    console.log();
  } catch (error) {
    spinner.fail("Execution failed");

    if (error instanceof Error) {
      console.error(chalk.red("\nError:"), error.message);

      if (options.verbose) {
        console.error(chalk.dim("\nStack trace:"));
        console.error(chalk.dim(error.stack));
      }
    }

    process.exit(1);
  }
}
