import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMResponseSchema } from '../../src/llm/client.js';

describe('LLMResponseSchema', () => {
  it('parses valid response', () => {
    const result = LLMResponseSchema.safeParse({
      answer: '408',
      reasoning: 'I computed 17 * 24 = 408',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing answer', () => {
    const result = LLMResponseSchema.safeParse({
      reasoning: 'Some reasoning',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing reasoning', () => {
    const result = LLMResponseSchema.safeParse({
      answer: '408',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-string answer', () => {
    const result = LLMResponseSchema.safeParse({
      answer: 408,
      reasoning: 'Some reasoning',
    });
    expect(result.success).toBe(false);
  });
});

describe('LLMClient interface contract', () => {
  it('complete returns LLMResponse shape', async () => {
    const mockClient = {
      async complete(_system: string, _user: string) {
        return { answer: '408', reasoning: '17 * 24 = 408' };
      },
    };

    const result = await mockClient.complete('system', 'user');
    const validated = LLMResponseSchema.safeParse(result);
    expect(validated.success).toBe(true);
  });

  it('accepts system and user prompt strings', async () => {
    const systemPrompt = 'You are an expert.';
    const userPrompt = 'What is 2 + 2?';

    const mockClient = {
      async complete(system: string, user: string) {
        expect(system).toBe(systemPrompt);
        expect(user).toBe(userPrompt);
        return { answer: '4', reasoning: 'Basic addition' };
      },
    };

    await mockClient.complete(systemPrompt, userPrompt);
  });
});
