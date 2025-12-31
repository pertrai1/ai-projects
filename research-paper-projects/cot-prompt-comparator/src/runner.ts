import * as fs from "fs";
import * as path from "path";
import { GoogleGenAI } from "@google/genai";
import { standardPrompt } from "./prompts/standardPrompt.js";
import { chainOfThoughtPrompt } from "./prompts/chainOfThoughtPrompt.js";
import { conciseChainOfThoughtPrompt } from "./prompts/conciseChainOfThoughtPrompt.js";
import { verboseChainOfThoughtPrompt } from "./prompts/verboseChainOfThoughtPrompt.js";
import { reasoningAfterAnswerPrompt } from "./prompts/reasoningAfterAnswerPrompt.js";
import { evaluate, extractAnswer } from "./evaluator.js";

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

export const run = async () => {
  

  const results: any[] = [];
  for (const task of tasks) {
    const standard = standardPrompt(task.question);
    const cot = chainOfThoughtPrompt(task.question);
    const conciseCot = conciseChainOfThoughtPrompt(task.question);
    const verboseCot = verboseChainOfThoughtPrompt(task.question);
    const reasoningAfterAnswer = reasoningAfterAnswerPrompt(task.question);

    const standardResult = await genAI.models.generateContent({ model: "gemini-pro-latest", contents: [{ role: "user", parts: [{ text: standard }] }] });
    const cotResult = await genAI.models.generateContent({ model: "gemini-pro-latest", contents: [{ role: "user", parts: [{ text: cot }] }] });
    const conciseCotResult = await genAI.models.generateContent({ model: "gemini-pro-latest", contents: [{ role: "user", parts: [{ text: conciseCot }] }] });
    const verboseCotResult = await genAI.models.generateContent({ model: "gemini-pro-latest", contents: [{ role: "user", parts: [{ text: verboseCot }] }] });
    const reasoningAfterAnswerResult = await genAI.models.generateContent({ model: "gemini-pro-latest", contents: [{ role: "user", parts: [{ text: reasoningAfterAnswer }] }] });

    const standardResponse = standardResult;
    const cotResponse = cotResult;
    const conciseCotResponse = conciseCotResult;
    const verboseCotResponse = verboseCotResult;
    const reasoningAfterAnswerResponse = reasoningAfterAnswerResult;

    const standardOutput = standardResponse.text ?? "";
    const cotOutput = cotResponse.text ?? "";
    const conciseCotOutput = conciseCotResponse.text ?? "";
    const verboseCotOutput = verboseCotResponse.text ?? "";
    const reasoningAfterAnswerOutput = reasoningAfterAnswerResponse.text ?? "";

    const standardExtractedAnswer = extractAnswer(standardOutput);
    const cotExtractedAnswer = extractAnswer(cotOutput);
    const conciseCotExtractedAnswer = extractAnswer(conciseCotOutput);
    const verboseCotExtractedAnswer = extractAnswer(verboseCotOutput);
    const reasoningAfterAnswerExtractedAnswer = extractAnswer(
      reasoningAfterAnswerOutput,
    );

    const standardIsCorrect = evaluate(
      standardExtractedAnswer,
      task.expectedAnswer,
    );
    const cotIsCorrect = evaluate(cotExtractedAnswer, task.expectedAnswer);
    const conciseCotIsCorrect = evaluate(
      conciseCotExtractedAnswer,
      task.expectedAnswer,
    );
    const verboseCotIsCorrect = evaluate(
      verboseCotExtractedAnswer,
      task.expectedAnswer,
    );
    const reasoningAfterAnswerIsCorrect = evaluate(
      reasoningAfterAnswerExtractedAnswer,
      task.expectedAnswer,
    );

    results.push({
      taskId: task.id,
      promptType: "standard",
      question: task.question,
      modelOutput: standardOutput,
      extractedAnswer: standardExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: standardIsCorrect,
    });

    results.push({
      taskId: task.id,
      promptType: "cot",
      question: task.question,
      modelOutput: cotOutput,
      extractedAnswer: cotExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: cotIsCorrect,
    });

    results.push({
      taskId: task.id,
      promptType: "concise-cot",
      question: task.question,
      modelOutput: conciseCotOutput,
      extractedAnswer: conciseCotExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: conciseCotIsCorrect,
    });

    results.push({
      taskId: task.id,
      promptType: "verbose-cot",
      question: task.question,
      modelOutput: verboseCotOutput,
      extractedAnswer: verboseCotExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: verboseCotIsCorrect,
    });

    results.push({
      taskId: task.id,
      promptType: "reasoning-after-answer",
      question: task.question,
      modelOutput: reasoningAfterAnswerOutput,
      extractedAnswer: reasoningAfterAnswerExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: reasoningAfterAnswerIsCorrect,
    });
  }

  fs.writeFileSync(
    path.join(resultsDir, "output.json"),
    JSON.stringify(results, null, 2),
  );
};