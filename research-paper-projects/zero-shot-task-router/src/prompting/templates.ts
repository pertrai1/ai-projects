import type { PromptTemplate } from "./promptTemplate.js";

const promptTemplates: PromptTemplate[] = [
  {
    id: "raw",
    description: "Return the input as the prompt without added text.",
    render: (input) => input,
  },
  {
    id: "summarize-minimal",
    description: "Minimal summarization instruction with the input appended.",
    render: (input) => `Summarize the following text:\n${input}`,
  },
  {
    id: "summarize-brief",
    description: "Single-sentence summary instruction.",
    render: (input) => `Summarize in one sentence:\n${input}`,
  },
  {
    id: "summarize-plain",
    description: "Bare summary label before the input.",
    render: (input) => `Summary:\n${input}`,
  },
  {
    id: "summarize-concise",
    description: "Concise summary instruction.",
    render: (input) => `Provide a concise summary:\n${input}`,
  },
  {
    id: "qa-minimal",
    description: "Minimal QA instruction with the input appended.",
    render: (input) => `Answer the question:\n${input}`,
  },
  {
    id: "translate-en-es",
    description: "English to Spanish translation instruction.",
    render: (input) => `Translate the following text to Spanish:\n${input}`,
  },
];

const templateIndex = new Map(
  promptTemplates.map((template) => [template.id, template]),
);

export const listPromptTemplates = (): PromptTemplate[] => [...promptTemplates];

export const getPromptTemplate = (id: string): PromptTemplate | undefined =>
  templateIndex.get(id);
