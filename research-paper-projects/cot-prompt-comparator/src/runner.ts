import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { standardPrompt } from './prompts/standardPrompt.js';
import { chainOfThoughtPrompt } from './prompts/chainOfThoughtPrompt.js';
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
  for (const task of tasks) {
    const standard = standardPrompt(task.question);
    const cot = chainOfThoughtPrompt(task.question);

    const standardResult = await model.generateContent(standard);
    const cotResult = await model.generateContent(cot);

    const standardResponse = standardResult.response;
    const cotResponse = cotResult.response;

    fs.writeFileSync(path.join(resultsDir, `${task.id}-standard.txt`), standardResponse.text());
    fs.writeFileSync(path.join(resultsDir, `${task.id}-cot.txt`), cotResponse.text());
  }
};
