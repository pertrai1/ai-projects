import { Command } from "commander";
import chalk from "chalk";
import dotenv from "dotenv";
import { buildPrompt } from "./prompting/promptPipeline.js";
import { listPromptTemplates } from "./prompting/templates.js";
import { OpenAiLanguageModelClient } from "./model/openaiClient.js";
import { resolveInput } from "./utils/readInput.js";

// Load environment variables from .env file
dotenv.config({ quiet: true });

type CliOptions = {
  template?: string;
  templates?: string;
  input?: string;
  inputFile?: string;
  complete: boolean;
};

const program = new Command();

program
  .name("zero-shot-task-router")
  .description("Render a prompt template for zero-shot task experiments.")
  .option("-i, --input <text>", "Input text to insert into the template.")
  .option(
    "-f, --input-file <path>",
    "Read input from file (or '-' for stdin).",
  )
  .option("-t, --template <id>", "Prompt template id.")
  .option(
    "--templates <ids>",
    "Comma-separated template ids to run in order.",
  )
  .option("--complete", "Execute the prompt with the OpenAI client.")
  .action(async (options: CliOptions) => {
    try {
      if (options.template && options.templates) {
        throw new Error("Use either --template or --templates, not both.");
      }

      const input = await resolveInput(options.input, options.inputFile);
      if (!input) {
        throw new Error("Input is required. Use --input or --input-file.");
      }

      const templateIds = options.templates
        ? options.templates
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [options.template ?? "raw"];

      const isMulti = templateIds.length > 1;
      const client = options.complete
        ? new OpenAiLanguageModelClient(
            process.env["OPENAI_API_KEY"],
            process.env["OPENAI_BASE_URL"],
          )
        : null;

      for (const templateId of templateIds) {
        const prompt = buildPrompt({ templateId, input });
        const output = client ? await client.complete(prompt) : prompt;

        if (isMulti) {
          process.stdout.write(`=== ${templateId} ===\n`);
        }
        process.stdout.write(`${output}\n`);
        if (isMulti) {
          process.stdout.write("\n");
        }
      }
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
