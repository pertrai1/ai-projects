import { getPromptTemplate } from "./templates.js";

export type PromptRequest = {
  templateId: string;
  input: string;
};

export const buildPrompt = ({ templateId, input }: PromptRequest): string => {
  const template = getPromptTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  return template.render(input);
};
