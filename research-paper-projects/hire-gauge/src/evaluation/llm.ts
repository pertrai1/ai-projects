import OpenAI from 'openai';
import type { ModelConfig } from '../spec/schema.js';
import type { PromptTemplate } from './prompt.js';
import { renderUserPrompt } from './prompt.js';
import { validateOutput, type LLMOutput, type ValidationResult } from './validator.js';
import type { Logger } from 'pino';

export interface EvaluationResult {
  profileId: string;
  repetition: number;
  output: LLMOutput | null;
  rawResponse: string;
  success: boolean;
  retryCount: number;
  error?: string;
}

export interface LLMClient {
  evaluate(
    profileId: string,
    candidateDescription: string,
    repetition: number
  ): Promise<EvaluationResult>;
}

export function createLLMClient(
  config: ModelConfig,
  promptTemplate: PromptTemplate,
  logger: Logger
): LLMClient {
  if (config.provider !== 'openai') {
    throw new Error(`Unsupported provider: ${config.provider}. Only 'openai' is currently supported.`);
  }

  const client = new OpenAI();

  return {
    async evaluate(
      profileId: string,
      candidateDescription: string,
      repetition: number
    ): Promise<EvaluationResult> {
      const userPrompt = renderUserPrompt(promptTemplate, candidateDescription);
      let retryCount = 0;
      let lastResult: ValidationResult | null = null;

      while (retryCount <= config.max_retries) {
        try {
          const response = await client.chat.completions.create({
            model: config.name,
            temperature: config.temperature,
            messages: [
              { role: 'system', content: promptTemplate.systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
          });

          const rawResponse = response.choices[0]?.message?.content ?? '';
          lastResult = validateOutput(rawResponse);

          if (lastResult.success && lastResult.data) {
            return {
              profileId,
              repetition,
              output: lastResult.data,
              rawResponse,
              success: true,
              retryCount,
            };
          }

          logger.warn(
            { profileId, repetition, attempt: retryCount + 1, error: lastResult.error },
            'Invalid output, retrying'
          );
          retryCount++;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          logger.error({ profileId, repetition, attempt: retryCount + 1, error: errorMsg }, 'LLM call failed');
          lastResult = {
            success: false,
            error: errorMsg,
            rawResponse: '',
          };
          retryCount++;
        }
      }

      return {
        profileId,
        repetition,
        output: null,
        rawResponse: lastResult?.rawResponse ?? '',
        success: false,
        retryCount: retryCount - 1,
        error: lastResult?.error ?? 'Max retries exceeded',
      };
    },
  };
}
