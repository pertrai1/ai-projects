import { Command } from "commander";
import chalk from "chalk";
import dotenv from "dotenv";

import { runPairwiseEval } from "./core/runPairwiseEval.js";
import { readInputMaybeFileOrStdin } from "./utils/readInput.js";

// Load environment variables from .env file
dotenv.config();

const VERSION = "0.1.0";

type Confidence = "high" | "medium" | "low";

type EvalResult = {
  winner: "A" | "B" | "TIE";
  scoreA: number;
  scoreB: number;
  confidence: Confidence;
  meta?: {
    k: number;
    temperature: number;
    model: string;
    criteria?: string[];
    // Any calibration diagnostics that could be computed later
    disagreement?: number;
  };
};

type RawEvalOptions = {
  prompt?: string;
  a?: string;
  b?: string;

  // I/O
  promptFile?: string;
  aFile?: string;
  bFile?: string;

  // Eval controls
  criteria?: string;
  model?: string;
  temperature?: string;
  k?: string;

  // Output
  json: boolean;
  verbose: boolean;
};

const DEFAULT_CRITERIA = [
  "helpfulness",
  "honesty",
  "harmlessness",
  "relevance",
  "accuracy",
  "detail",
];

function parseCSV(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function clampNumber(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function formatWinner(winner: EvalResult["winner"]): string {
  if (winner === "A") {
    return chalk.green("A wins");
  }
  if (winner === "B") {
    return chalk.green("B wins");
  }
  return chalk.yellow("It's a tie");
}

function formatConfidence(confidence: Confidence): string {
  if (confidence === "high") {
    return chalk.green(confidence);
  }
  if (confidence === "medium") {
    return chalk.yellow(confidence);
  }
  return chalk.red(confidence);
}

function printHuman(result: EvalResult) {
  console.log("");
  console.log(chalk.bold("Evaluation Result:"));
  console.log(`  Winner:     ${formatWinner(result.winner)}`);
  console.log(`  Score (A):  ${chalk.cyan(result.scoreA.toFixed(2))}`);
  console.log(`  Score (B):  ${chalk.cyan(result.scoreB.toFixed(2))}`);
  console.log(`  Confidence: ${formatConfidence(result.confidence)}`);

  if (result.meta) {
    console.log("");
    console.log(chalk.bold("Run settings:"));
    console.log(`  Model:       ${chalk.cyan(result.meta.model)}`);
    console.log(`  Temperature: ${chalk.cyan(result.meta.temperature)}`);
    console.log(`  k:           ${chalk.cyan(result.meta.k)}`);
    console.log(
      `  Criteria:    ${chalk.cyan(result.meta.criteria?.join(", ") || "N/A")}`,
    );
    if (typeof result.meta.disagreement === "number") {
      console.log(
        `  Disagreement: ${chalk.cyan(result.meta.disagreement.toFixed(4))}`,
      );
    }
  }

  console.log("");
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("fair-eval-cli")
    .description(
      "CLI tool for pairwise evaluation of text outputs using LLMs (MEC + BPC)",
    )
    .version(VERSION);

  program
    .command("eval")
    .description(
      "Run pairwise evaluation response A vs response B for a given prompt",
    )
    .option("--prompt <text>", "Prompt text")
    .option("--prompt-file <path>", "Read prompt from file (or '-' for stdin)")
    .option("--a <text>", "Response A text")
    .option("--a-file <path>", "Read response A from file (or '-' for stdin)")
    .option("--b <text>", "Response B text")
    .option("--b-file <path>", "Read response B from file (or '-' for stdin)")
    .option(
      "--criteria <csv>",
      `Comma-separated criteria (default: ${DEFAULT_CRITERIA.join(", ")})`,
      DEFAULT_CRITERIA.join(", "),
    )
    .option("--k <number>", "Evidence samples per position (default: 3)", "3")
    .option(
      "--temperature <number>",
      "Sampling temperature (default: 1.0)",
      "1.0",
    )
    .option("--model <name>", "Evaluator model id (default: gpt-4)", "gpt-4")
    .option("--json", "Output machine-readable JSON", false)
    .option("--verbose", "Include run settings / diagnostics", false)
    .action(async (rawOpts: RawEvalOptions) => {
      const opts = {
        prompt: rawOpts.prompt,
        promptFile: rawOpts.promptFile,
        a: rawOpts.a,
        aFile: rawOpts.aFile,
        b: rawOpts.b,
        bFile: rawOpts.bFile,
        criteria: rawOpts.criteria
          ? parseCSV(rawOpts.criteria)
          : parseCSV(DEFAULT_CRITERIA.join(", ")),
        k: clampNumber(Number(rawOpts.k || 3), 1, 20),
        temperature: clampNumber(Number(rawOpts.temperature || 1.0), 0.0, 2.0),
        model: rawOpts.model || "gpt-4",
        json: Boolean(rawOpts.json),
        verbose: Boolean(rawOpts.verbose),
      };

      // Input resolution:
      // - Prefer exlplicit text flags
      // - Else read from file if provided
      // - Support "-" for stdin in any *-file option
      const prompt = await readInputMaybeFileOrStdin(
        opts.prompt,
        opts.promptFile,
      );
      const a = await readInputMaybeFileOrStdin(opts.a, opts.aFile);
      const b = await readInputMaybeFileOrStdin(opts.b, opts.bFile);

      if (!prompt) {
        console.error(
          chalk.red("Error: Prompt is required. Use --prompt or --prompt-file"),
        );
        process.exitCode = 2;
        return;
      }

      if (!a || !b) {
        console.error(
          chalk.red(
            "Error: Both responses A and B are required. Use --a/--b or --a-file/--b-file",
          ),
        );
        process.exitCode = 2;
        return;
      }

      if (opts.criteria?.length === 0) {
        console.error(chalk.red("Error: criteria list is empty"));
        process.exitCode = 2;
        return;
      }

      // Run the core evaluator
      // It should internally do:
      // - MEC: evidence-first scoring, sampled k times per position
      // - BPC: evaluate both (A,B) and (B,A), aggregate results
      const result = (await runPairwiseEval({
        prompt,
        responseA: a,
        responseB: b,
        criteria: opts.criteria!,
        k: opts.k!,
        temperature: opts.temperature!,
        model: opts.model!,
        verbose: opts.verbose,
      })) as EvalResult;

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // Hide meta unless verbose is requested
        if (!opts.verbose) {
          const { meta, ...resultWithoutMeta } = result;
          printHuman(resultWithoutMeta as EvalResult);
        } else {
          printHuman(result);
        }
      }
    });

  // Default command if user omits "eval"
  program.action(() => {
    program.help();
  });

  try {
    await program.parseAsync(process.argv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`Fatal: ${message}`));
    process.exitCode = 1;
  }
}

void main();
