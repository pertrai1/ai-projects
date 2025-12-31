export const verboseChainOfThoughtPrompt = (question: string): string => {
  return `Question: ${question}\nLet's think step by step, explaining each calculation in detail.`;
};

