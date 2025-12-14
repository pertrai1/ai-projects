#!/usr/bin/env node
import { config } from "dotenv";

config();

import { Command } from "commander";
import chalk from "chalk";
import { askSmartCommand } from "./commands/ask-smart";
import { searchAdaptiveCommand } from "./commands/search-adaptive";
import { askSynthesizedCommand } from "./commands/ask-synthesized";
import { chatCommand } from "./commands/chat";
import { specsCommand } from "./commands/specs";
import { indexCommand } from "./commands/index";
import { debugCommand } from "./commands/debug";

const program = new Command();

program
  .name("fieldguide")
  .description("AI assistant for USDA PLANTS documentation")
  .version("0.1.0");

// Main ask command - uses intelligent routing
program
  .command("ask")
  .description("Ask a question about PLANTS documentation")
  .argument("<question>", "Your question")
  .option("-v, --verbose", "Show detailed routing information")
  .option("-r, --show-routing", "Show routing decision only (educational mode)")
  .action(async (question: string, options) => {
    await askSmartCommand(question, options);
  });

// Adaptive Search Command - dynamically adjust based on query characteristics.
// - See what retrieval strategy would be chosen
// - Compare adaptive vs traditional fixed k=5 search
// - Understand impact of k, query expansion, and filters
program
  .command("search-adaptive")
  .description("Demonstrate adaptive retrieval strategies (Phase 2 Step 2)")
  .argument("<query>", "Search query")
  .option("-v, --verbose", "Show detailed strategy information")
  .option("-s, --show-strategy", "Show strategy only (educational mode)")
  .option("-c, --compare", "Compare adaptive vs fixed search")
  .action(async (query: string, options) => {
    await searchAdaptiveCommand(query, options);
  });

// Ask Synthesized Command
// Combines:
// - Query routing
// - Adaptive retrieval
// - Multi-source retrieval
// - Response synthesis
program
  .command("ask-synthesized")
  .description("Ask using complete Phase 2 pipeline (Steps 1-3)")
  .argument("<question>", "Your question")
  .option("-v, --verbose", "Show detailed pipeline information")
  .option("-s, --show-sources", "Show which retrieval sources contributed")
  .option(
    "-f, --fusion-method <method>",
    "Fusion method: RRF, score-based, or simple",
    "RRF",
  )
  .action(async (question: string, options) => {
    await askSynthesizedCommand(question, options);
  });

// Interactive Chat Command
// Multi-turn conversational interface with memory!
// - Remembers previous questions and answers
// - Understands follow-up questions
// - Tracks conversation context (topics, entities)
// - Session statistics and management
program
  .command("chat")
  .description("Start interactive chat session (Phase 2 Step 4)")
  .option("-v, --verbose", "Show detailed pipeline information")
  .option("-c, --show-context", "Show conversation context after each answer")
  .action(async (options) => {
    await chatCommand(options);
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
