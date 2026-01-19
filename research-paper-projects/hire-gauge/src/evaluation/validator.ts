import { z } from 'zod';

export const LLMOutputSchema = z.object({
  score: z.number().min(0).max(10),
  justification: z.string().min(1),
});

export type LLMOutput = z.infer<typeof LLMOutputSchema>;

export interface ValidationResult {
  success: boolean;
  data?: LLMOutput;
  error?: string;
  rawResponse: string;
}

export function validateOutput(rawResponse: string): ValidationResult {
  const trimmed = rawResponse.trim();

  let parsed: unknown;
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'No JSON object found in response',
        rawResponse,
      };
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    return {
      success: false,
      error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
      rawResponse,
    };
  }

  const result = LLMOutputSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return {
      success: false,
      error: `Schema validation failed: ${errors}`,
      rawResponse,
    };
  }

  return {
    success: true,
    data: result.data,
    rawResponse,
  };
}
