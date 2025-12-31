export const extractAnswer = (modelOutput: string): string | undefined => {
  const match = modelOutput.match(/(\d+)$/);
  return match ? match[1] : "";
};

export const evaluate = (extractedAnswer: string | undefined, expectedAnswer: string): boolean => {
  if (extractedAnswer === undefined) {
    return false;
  }
  return extractedAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
};
