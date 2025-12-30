import { Command } from "commander";
import chalk from "chalk";
import { buildPrompt } from "./prompting/promptPipeline.js";
import { listPromptTemplates } from "./prompting/templates.js";

type CliOptions = {
  template: string;
  input: string;
};

const program = new Command();

program
  .name("zero-shot-task-router")
  .description("Render a prompt template for zero-shot task experiments.")
  .requiredOption("-i, --input <text>", "Input text to insert into the template.")
  .option("-t, --template <id>", "Prompt template id.", "raw")
  .action((options: CliOptions) => {
    try {
      const prompt = buildPrompt({
        templateId: options.template,
        input: options.input,
      });

      process.stdout.write(prompt);
    } catch (error) {
      const templates = listPromptTemplates()
        .map((template) => template.id)
        .join(", ");
      const message = error instanceof Error ? error.message : "Unknown error";

      console.error(chalk.red(message));
      console.error(chalk.yellow(`Available templates: ${templates}`));
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
