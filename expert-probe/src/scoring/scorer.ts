import { z } from 'zod';

export const ScoreResultSchema = z.object({
  correct: z.boolean(),
  given: z.string(),
  expected: z.string(),
  normalizedGiven: z.string(),
  normalizedExpected: z.string(),
});
export type ScoreResult = z.infer<typeof ScoreResultSchema>;

export function normalizeAnswer(answer: string): string {
  let normalized = answer.trim().toLowerCase();
  normalized = normalized.replace(/^(the|a|an)\s+/i, '');
  normalized = normalized.replace(/[.!?,;:]+$/, '');
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
}

export function scoreAnswer(given: string, expected: string): ScoreResult {
  const normalizedGiven = normalizeAnswer(given);
  const normalizedExpected = normalizeAnswer(expected);
  return {
    correct: normalizedGiven === normalizedExpected,
    given,
    expected,
    normalizedGiven,
    normalizedExpected,
  };
}
