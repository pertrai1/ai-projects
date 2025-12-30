export type PromptTemplate = {
  id: string;
  description: string;
  render: (input: string) => string;
};
