import chalk from "chalk";
import { specLoader } from "../utils/spec-loader.js";

export async function specsCommand(): Promise<void> {
  console.log(chalk.blue("FieldGuide:"), "Available Specifications\n");

  try {
    const specs = await specLoader.listSpecs();

    // Display agents
    if (specs.agents.length > 0) {
      console.log(chalk.bold("Agents:"));
      for (const name of specs.agents) {
        const spec = await specLoader.loadAgent(name);
        console.log(
          chalk.green(` -- ${name}`),
          chalk.dim(`- ${spec.metadata.description}`),
        );
      }
      console.log();
    } else {
      console.log(chalk.yellow("No agents found\n"));
    }

    // Display tools
    if (specs.tools.length > 0) {
      console.log(chalk.bold("Tools:"));
      for (const name of specs.tools) {
        const spec = await specLoader.loadTool(name);
        console.log(
          chalk.cyan(`  -- ${name}`),
          chalk.dim(`- ${spec.metadata.description}`),
        );
      }
      console.log();
    }

    // Display workflows
    if (specs.workflows.length > 0) {
      console.log(chalk.bold("Workflows:"));
      for (const name of specs.workflows) {
        const spec = await specLoader.loadWorkflow(name);
        console.log(
          chalk.magenta(` -- ${name}`),
          chalk.dim(`- ${spec.metadata.description}`),
        );
      }
      console.log();
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red("Error loading specs:"), error.message);
    }
    process.exit(1);
  }
}
