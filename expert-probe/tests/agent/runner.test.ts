import { describe, it, expect } from 'vitest';
import { runAgent, runModerator } from '../../src/agent/runner.js';
import type { LLMClient } from '../../src/llm/client.js';
import type { AgentConfig } from '../../src/schema/agent.js';
import type { Task } from '../../src/schema/task.js';

const mockClient: LLMClient = {
  async complete(_system: string, _user: string) {
    return { answer: '408', reasoning: '17 * 24 = 408' };
  },
};

const expertAgent: AgentConfig = {
  id: 'expert',
  role: 'expert',
  systemPrompt: 'You are a domain expert.',
};

const moderatorAgent: AgentConfig = {
  id: 'moderator',
  role: 'moderator',
  systemPrompt: 'You are a moderator.',
};

const task: Task = {
  id: 'math-001',
  question: 'What is 17 * 24?',
  correctAnswer: '408',
  type: 'math',
};

describe('runAgent', () => {
  it('returns an AgentResult with correct shape', async () => {
    const result = await runAgent(mockClient, expertAgent, task, 'expert-hidden');
    expect(result.agentId).toBe('expert');
    expect(result.taskId).toBe('math-001');
    expect(result.answer).toBe('408');
    expect(result.reasoning).toBe('17 * 24 = 408');
  });

  it('preserves raw LLM response', async () => {
    const result = await runAgent(mockClient, expertAgent, task, 'expert-hidden');
    expect(result.raw).toEqual({ answer: '408', reasoning: '17 * 24 = 408' });
  });

  it('passes condition through to prompt builder', async () => {
    let capturedSystem = '';
    const capturingClient: LLMClient = {
      async complete(system: string, _user: string) {
        capturedSystem = system;
        return { answer: '408', reasoning: 'test' };
      },
    };

    await runAgent(capturingClient, expertAgent, task, 'expert-revealed');
    expect(capturedSystem).toContain('identified as the domain expert');
  });

  it('propagates LLM errors', async () => {
    const failingClient: LLMClient = {
      async complete() {
        throw new Error('API rate limit');
      },
    };

    await expect(runAgent(failingClient, expertAgent, task, 'expert-hidden')).rejects.toThrow(
      'API rate limit',
    );
  });
});

describe('runModerator', () => {
  const agentResponses = [
    { agentId: 'expert', role: 'expert', response: { answer: '408', reasoning: 'Computed' } },
    { agentId: 'non-expert-a', role: 'non-expert-a', response: { answer: '412', reasoning: 'Guessed' } },
  ] as const;

  it('returns an AgentResult for the moderator', async () => {
    const result = await runModerator(mockClient, moderatorAgent, task, agentResponses, 'expert-hidden');
    expect(result.agentId).toBe('moderator');
    expect(result.taskId).toBe('math-001');
    expect(result.answer).toBe('408');
  });

  it('passes agent responses to moderator prompt', async () => {
    let capturedUser = '';
    const capturingClient: LLMClient = {
      async complete(_system: string, user: string) {
        capturedUser = user;
        return { answer: '408', reasoning: 'Consensus' };
      },
    };

    await runModerator(capturingClient, moderatorAgent, task, agentResponses, 'expert-hidden');
    expect(capturedUser).toContain('412');
    expect(capturedUser).toContain('Guessed');
  });
});
