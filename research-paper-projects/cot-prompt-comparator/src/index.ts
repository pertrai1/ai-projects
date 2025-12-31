import { run } from "./runner.js";
import { analyze } from "./analyzer.js";
import { Command } from "commander";

async function main() {
  const program = new Command();

  program
    .option("--standard", "Include Standard Prompt")
    .option("--cot", "Include Chain-of-Thought Prompt")
    .option("--concise-cot", "Include Concise Chain-of-Thought Prompt")
    .option("--verbose-cot", "Include Verbose Chain-of-Thought Prompt")
    .option(
      "--reasoning-after-answer",
      "Include Reasoning After Answer Prompt",
    );

  program.parse(process.argv);

  const options = program.opts();
  const command = process.argv[2]; // Still check for 'analyze' command

  if (command === "analyze") {
    analyze();
  } else {
    await run(options);
  }

  console.log("Application finished.");
}

main();
