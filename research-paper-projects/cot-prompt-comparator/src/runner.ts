import * as fs from "fs";
import * as path from "path";
import { GoogleGenAI } from "@google/genai";
import { standardPrompt } from "./prompts/standardPrompt.js";
import { chainOfThoughtPrompt } from "./prompts/chainOfThoughtPrompt.js";
import { conciseChainOfThoughtPrompt } from "./prompts/conciseChainOfThoughtPrompt.js";
import { verboseChainOfThoughtPrompt } from "./prompts/verboseChainOfThoughtPrompt.js";
import { reasoningAfterAnswerPrompt } from "./prompts/reasoningAfterAnswerPrompt.js";
import { evaluate, extractAnswer } from "./evaluator.js";
import chalk from "chalk";

import "dotenv/config";


import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tasks = JSON.parse(
  fs.readFileSync(path.resolve("./src/tasks.json"), "utf-8"),
);
const genAI = new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] as string });

const resultsDir = path.join(__dirname, "results");
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Concurrency limiter helper function
async function pLimit(concurrency: number, tasks: (() => Promise<any>)[]) {
  let currentIndex = 0; // Index for the next task to pick from `tasks`

  // Worker function that picks a task, runs it, and then picks another
  const worker = async () => {
    while (currentIndex < tasks.length) {
      const taskIndex = currentIndex++; // Get current index and increment for next worker
      const taskFn = tasks[taskIndex];

      if (taskFn) { // Explicitly check if taskFn is defined
        try {
          await taskFn();
        } catch (error) {
          // Errors are already handled within the taskFn (API call) itself
          // so we don't need to re-throw or log here unless for specific pLimit errors
        }
      }
    }
  };

  // Create 'concurrency' number of workers
  const workers = Array(concurrency).fill(null).map(worker);

  // Wait for all workers to complete
  await Promise.all(workers);
}

export const run = async (cliOptions: { [key: string]: boolean }) => {
  const allApiCallPromises: (() => Promise<any>)[] = [];
  const taskResults: any[] = [];

  const availablePromptTypes = [
    { name: "standard", fn: standardPrompt, cliFlag: "standard" },
    { name: "cot", fn: chainOfThoughtPrompt, cliFlag: "cot" },
    { name: "concise-cot", fn: conciseChainOfThoughtPrompt, cliFlag: "conciseCot" },
    { name: "verbose-cot", fn: verboseChainOfThoughtPrompt, cliFlag: "verboseCot" },
    { name: "reasoning-after-answer", fn: reasoningAfterAnswerPrompt, cliFlag: "reasoningAfterAnswer" },
  ];

  // Determine which prompt types to run based on CLI options
  let promptTypesToRun = availablePromptTypes;
  const anyPromptFlagProvided = Object.values(cliOptions).some(value => value === true);

  if (anyPromptFlagProvided) {
    promptTypesToRun = availablePromptTypes.filter(pt => cliOptions[pt.cliFlag]);
  }

  if (promptTypesToRun.length === 0 && anyPromptFlagProvided) {
    console.warn(chalk.yellow("No valid prompt type flags provided. Running all prompt types by default."));
    promptTypesToRun = availablePromptTypes;
  } else if (promptTypesToRun.length === 0 && !anyPromptFlagProvided) {
    // This case should ideally not happen if anyPromptFlagProvided logic is correct,
    // but as a safeguard, if no flags were provided and no types are selected, run all.
    promptTypesToRun = availablePromptTypes;
  }

  for (const task of tasks) {
    taskResults.push({
      taskId: task.id,
      question: task.question,
      expectedAnswer: task.expectedAnswer,
      promptResults: [],
    });

    const currentTaskResult = taskResults[taskResults.length - 1];

    for (const promptType of promptTypesToRun) {
      allApiCallPromises.push(async () => {
        console.log(
          `Processing task ID: ${task.id} - Question: ${task.question} - Prompt: ${promptType.name}`,
        );
        try {
          const promptText = promptType.fn(task.question);
          const modelResult = await genAI.models.generateContent({
            model: "gemini-pro-latest",
            contents: [{ role: "user", parts: [{ text: promptText }] }],
          });
          const modelOutput = modelResult.text ?? "";
          const extractedAnswer = extractAnswer(modelOutput, task.expectedAnswer);
          const isCorrect = evaluate(extractedAnswer, task.expectedAnswer);

          currentTaskResult.promptResults.push({
            promptType: promptType.name,
            modelOutput,
            extractedAnswer,
            isCorrect,
          });

          console.log(chalk.blue(`  Prompt Type: ${getDescriptivePromptName(promptType.name)}`));
          console.log(chalk.yellow(`    Model Output: ${modelOutput}`));
          console.log(chalk.yellow(`    Extracted Answer: ${extractedAnswer}`));
          console.log(chalk.green(`    Expected Answer: ${task.expectedAnswer}`));
          console.log(isCorrect ? chalk.green(`    Correct: Yes`) : chalk.red(`    Correct: No`));
          console.log(""); // Add a blank line for readability
        } catch (error: any) {
          console.error(
            chalk.red(
              `API Error for task ${task.id}, prompt ${promptType.name}:`,
              error.message,
            ),
          );
          currentTaskResult.promptResults.push({
            promptType: promptType.name,
            modelOutput: "ERROR",
            extractedAnswer: "ERROR",
            isCorrect: false,
            error: error.message,
          });
        }
      });
    }
  }

  function getDescriptivePromptName(promptName: string): string {
    switch (promptName) {
      case "standard":
        return "Standard Prompt";
      case "cot":
        return "Chain-of-Thought";
      case "concise-cot":
        return "Concise Chain-of-Thought";
      case "verbose-cot":
        return "Verbose Chain-of-Thought";
      case "reasoning-after-answer":
        return "Reasoning After Answer";
      default:
        return promptName;
    }
  }

  // Execute all API calls with a concurrency limit of 4
  await pLimit(4, allApiCallPromises);

  fs.writeFileSync(
    path.join(resultsDir, "output.json"),
    JSON.stringify(taskResults, null, 2),
  );
};