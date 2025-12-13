#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { config } from "dotenv";
import { askCommand } from "./commands/ask.js";
import { specsCommand } from "./commands/specs.js";

config();

const program = new Command();

program
  .name("fieldguide")
  .description("AI assistant for USDA PLANTS help documentation")
  .version("0.1.0");

program
  .command("ask")
  .description("Ask a question about PLANTS documentation")
  .argument("<question>", "Your question")
  .option("-v, --verbose", "Show detailed output")
  .option("-a --agent <name>", "Specify which agent to use", "greeter")
  .action(async (question: string, options) => {
    await askCommand(question, options);
  });

program
  .command("chat")
  .description("Start an interactive chat session")
  .action(async () => {
    console.log(chalk.blue("FieldGuide Chat"));
    console.log(chalk.gray("Type your questions. Ctrl+C to exit.\n"));

    // TODO: Implement interactive chat
    console.log(chalk.yellow("Interactive chat not yet implemented.\n"));
  });

program
  .command("index")
  .description("Index the PLANTS documentation")
  .option("-f, --file <path>", "Path to PDF file")
  .action(async (options) => {
    console.log(chalk.blue("FieldGuide:"), "Indexing documentation...");

    if (options.file) {
      console.log(chalk.gray("File:"), options.file);
    }

    // TODO: Implement PDF Indexing
    console.log(chalk.yellow("\nIndexing not yet implemented"));
    console.log(chalk.dim("Coming in Phase 1b: PDF Processing\n"));
  });

program
  .command("specs")
  .description("List available agent specification")
  .action(async () => {
    await specsCommand();
  });

program.parse();
