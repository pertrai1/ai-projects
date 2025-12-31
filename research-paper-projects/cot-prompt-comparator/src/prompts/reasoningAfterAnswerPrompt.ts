export const reasoningAfterAnswerPrompt = (question: string): string => {
  return `Question: ${question}\nAnswer:\nNow, explain your reasoning.`;
};

