import { Command } from "commander";
import chalk from "chalk";
import dotenv from "dotenv";
import { buildPrompt } from "./prompting/promptPipeline.js";
import { listPromptTemplates } from "./prompting/templates.js";
import { OpenAiLanguageModelClient } from "./model/openaiClient.js";

// Load environment variables from .env file
dotenv.config({ quiet: true });

type CliOptions = {
  template: string;
  input: string;
  complete: boolean;
};

const program = new Command();

program
  .name("zero-shot-task-router")
  .description("Render a prompt template for zero-shot task experiments.")
  .requiredOption(
    "-i, --input <text>",
    "Input text to insert into the template.",
  )
  .option("-t, --template <id>", "Prompt template id.", "raw")
  .option("--complete", "Execute the prompt with the OpenAI client.")
  .action(async (options: CliOptions) => {
    try {
      const prompt = buildPrompt({
        templateId: options.template,
        input: options.input,
      });

      if (options.complete) {
        const client = new OpenAiLanguageModelClient(
          process.env["OPENAI_API_KEY"],
          process.env["OPENAI_BASE_URL"],
        );
        const completion = await client.complete(prompt);
        process.stdout.write(`${completion}\n`);
        return;
      }

      process.stdout.write(`${prompt}\n`);
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
