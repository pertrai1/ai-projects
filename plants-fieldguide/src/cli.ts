#!/usr/bin/env node
import { config } from "dotenv";

config();

import { Command } from "commander";
import chalk from "chalk";
import { askCommand } from "./commands/ask";
import { specsCommand } from "./commands/specs";
import { indexCommand } from "./commands/index";
import { debugCommand } from "./commands/debug";

const program = new Command();

program
  .name("fieldguide")
  .description("AI assistant for USDA PLANTS documentation")
  .version("0.1.0");

program
  .command("ask")
  .description("Ask a question about PLANTS documentation")
  .argument("<question>", "Your question")
  .option("-v, --verbose", "Show detailed output")
  .option("-a, --agent <name>", "Use a specific agent")
  .option(
    "-w, --workflow <name>",
    "Use a specific workflow (default: question-answering)",
  )
  .option(
    "-d, --direct",
    "Show direct search results without AI interpretation",
  )
  .action(async (question: string, options) => {
    await askCommand(question, options);
  });

program
  .command("chat")
  .description("Start an interactive chat session")
  .action(async () => {
    console.log(chalk.blue("FieldGuide Chat"));
    console.log(chalk.gray("Type your questions. Ctrl+C to exit.\n"));

    console.log(chalk.yellow("Interactive chat not yet implemented"));
    console.log(chalk.dim("Coming in Phase 2\n"));
  });

program
  .command("index")
  .description("Index the PLANTS documentation")
  .option(
    "-f, --file <path>",
    "Path to PDF file",
    "./PLANTS_Help_Document_2022.pdf",
  )
  .option("--chunk-size <size>", "Chunk size in characters", "1000")
  .option("--chunk-overlap <overlap>", "Chunk overlap in characters", "200")
  .option("-v, --verbose", "Show detailed output")
  .action(async (options) => {
    await indexCommand({
      ...options,
      chunkSize: parseInt(options.chunkSize),
      chunkOverlap: parseInt(options.chunkOverlap),
    });
  });

program
  .command("debug")
  .description("Debug PDF processing and show estimates")
  .option(
    "-f, --file <path>",
    "Path to PDF file",
    "./PLANTS_Help_Document_2022.pdf",
  )
  .action(async (options) => {
    await debugCommand(options.file);
  });

program
  .command("specs")
  .description("List available agent specifications")
  .action(async () => {
    await specsCommand();
  });

program.parse();
