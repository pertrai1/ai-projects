import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { standardPrompt } from './prompts/standardPrompt.js';
import { chainOfThoughtPrompt } from './prompts/chainOfThoughtPrompt.js';
import { evaluate, extractAnswer } from './evaluator.js';

import * as dotenv from 'dotenv';

dotenv.config();

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tasks = JSON.parse(fs.readFileSync(path.resolve('./src/tasks.json'), 'utf-8'));
const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] as string);

const model = genAI.getGenerativeModel({ model: 'gemini-pro' });



const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

export const run = async () => {
  const results: any[] = [];
  for (const task of tasks) {
    const standard = standardPrompt(task.question);
    const cot = chainOfThoughtPrompt(task.question);

    const standardResult = await model.generateContent(standard);
    const cotResult = await model.generateContent(cot);

    const standardResponse = standardResult.response;
    const cotResponse = cotResult.response;

    const standardOutput = standardResponse.text();
    const cotOutput = cotResponse.text();

    const standardExtractedAnswer = extractAnswer(standardOutput);
    const cotExtractedAnswer = extractAnswer(cotOutput);

    const standardIsCorrect = evaluate(standardExtractedAnswer, task.expectedAnswer);
    const cotIsCorrect = evaluate(cotExtractedAnswer, task.expectedAnswer);

    results.push({
      taskId: task.id,
      promptType: 'standard',
      question: task.question,
      modelOutput: standardOutput,
      extractedAnswer: standardExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: standardIsCorrect,
    });

    results.push({
      taskId: task.id,
      promptType: 'cot',
      question: task.question,
      modelOutput: cotOutput,
      extractedAnswer: cotExtractedAnswer,
      expectedAnswer: task.expectedAnswer,
      isCorrect: cotIsCorrect,
    });
  }

  fs.writeFileSync(path.join(resultsDir, 'output.json'), JSON.stringify(results, null, 2));
};
