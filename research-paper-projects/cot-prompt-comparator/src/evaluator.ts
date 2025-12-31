  // Helper to clean up extracted answer
  const cleanAnswer = (answer: string, expectedAnswer: string): string => {
    let cleaned = answer.trim();
    // Remove all markdown bolding
    cleaned = cleaned.replace(/\*\*/g, '');
    // Remove leading/trailing quotes
    cleaned = cleaned.replace(/^"|"$/g, '');
    // Remove dollar signs
    cleaned = cleaned.replace(/\$/g, '');
    // Remove trailing punctuation (.,!?)
    cleaned = cleaned.replace(/[\.,!?]$/, '');

    // If expected answer is purely numeric, try to extract only the numeric part from cleaned string
    if (!isNaN(Number(expectedAnswer))) {
      const numericMatch = cleaned.match(/(-?\d+(\.\d+)?)/); // Match integers or decimals
      if (numericMatch && numericMatch[1]) {
        return numericMatch[1];
      }
    }

    // Remove common trailing units/words that might not be in expectedAnswer
    cleaned = cleaned.replace(/\s*(seats|teddy bears|dollars|money|word|sequence|days|person|items)\s*$/i, '');

    return cleaned.trim();
  };

export const extractAnswer = (modelOutput: string, expectedAnswer: string): string | undefined => {
  // 1. Look for explicit "Answer:" or "The final answer is:" prefixes
  const answerPrefixRegex = /(?:The final answer is|Answer|Result):\s*(.*?)(?:\n|$)/i;
  let match = modelOutput.match(answerPrefixRegex);
  if (match && match[1]) {
    return cleanAnswer(match[1], expectedAnswer);
  }

  // 2. Look for bolded text (e.g., **answer**)
  const boldedTextRegex = /\*\*(.*?)\*\*/;
  match = modelOutput.match(boldedTextRegex);
  if (match && match[1]) {
    return cleanAnswer(match[1], expectedAnswer);
  }

  // 3. Fallback: Extract the last non-empty line
  const lines = modelOutput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length > 0) {
    return cleanAnswer(lines[lines.length - 1]!, expectedAnswer);
  }

  return undefined;
};

export const evaluate = (extractedAnswer: string | undefined, expectedAnswer: string): boolean => {
  if (extractedAnswer === undefined) {
    return false;
  }
  return extractedAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
};
