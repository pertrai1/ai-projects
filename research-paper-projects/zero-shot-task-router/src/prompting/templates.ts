import type { PromptTemplate } from "./promptTemplate.js";

const promptTemplates: PromptTemplate[] = [
  {
    id: "raw",
    description: "Return the input as the prompt without added text.",
    render: (input) => input,
  },
];

const templateIndex = new Map(promptTemplates.map((template) => [template.id, template]));

export const listPromptTemplates = (): PromptTemplate[] => [...promptTemplates];

export const getPromptTemplate = (id: string): PromptTemplate | undefined =>
  templateIndex.get(id);
