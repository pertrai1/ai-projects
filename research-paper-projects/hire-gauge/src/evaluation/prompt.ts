import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface PromptTemplate {
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

export function loadPromptTemplate(version: string, promptsDir: string = 'prompts'): PromptTemplate {
  const filePath = join(promptsDir, `${version}.txt`);

  if (!existsSync(filePath)) {
    throw new Error(`Prompt template not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const parts = content.split('---USER---');

  if (parts.length !== 2) {
    throw new Error(`Invalid prompt template format in ${filePath}. Expected "---USER---" separator.`);
  }

  return {
    version,
    systemPrompt: parts[0].trim(),
    userPromptTemplate: parts[1].trim(),
  };
}

export function renderUserPrompt(template: PromptTemplate, candidateDescription: string): string {
  return template.userPromptTemplate.replace('{{CANDIDATE}}', candidateDescription);
}
