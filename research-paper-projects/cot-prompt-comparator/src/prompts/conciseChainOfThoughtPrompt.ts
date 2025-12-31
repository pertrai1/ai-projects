export const conciseChainOfThoughtPrompt = (question: string): string => {
  return `Question: ${question}\nBriefly, what is the reasoning?`;
};
