import OpenAI from 'openai';
import { z } from 'zod';

export const LLMResponseSchema = z.object({
  answer: z.string(),
  reasoning: z.string(),
});
export type LLMResponse = z.infer<typeof LLMResponseSchema>;

export interface LLMClientConfig {
  model: string;
  temperature: number;
  maxRetries?: number;
}

export interface LLMClient {
  complete(systemPrompt: string, userPrompt: string): Promise<LLMResponse>;
}

export function createLLMClient(config: LLMClientConfig): LLMClient {
  const client = new OpenAI();
  const maxRetries = config.maxRetries ?? 2;

  return {
    async complete(
      systemPrompt: string,
      userPrompt: string,
    ): Promise<LLMResponse> {
      let lastError: unknown = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await client.chat.completions.create({
            model: config.model,
            temperature: config.temperature,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
          });

          const raw = response.choices[0]?.message?.content ?? '';
          const parsed = JSON.parse(raw) as unknown;
          const result = LLMResponseSchema.parse(parsed);
          return result;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error(`LLM call failed after ${maxRetries + 1} attempts`);
    },
  };
}
