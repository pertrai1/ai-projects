import { describe, it, expect } from 'vitest';
import { runExperiment } from '../../src/experiment/runner.js';
import type { LLMClient } from '../../src/llm/client.js';
import type { AgentConfig } from '../../src/schema/agent.js';
import type { Task } from '../../src/schema/task.js';

const agents: AgentConfig[] = [
  { id: 'expert', role: 'expert', systemPrompt: 'Expert prompt' },
  { id: 'non-expert-a', role: 'non-expert-a', systemPrompt: 'Non-expert A prompt' },
  { id: 'non-expert-b', role: 'non-expert-b', systemPrompt: 'Non-expert B prompt' },
  { id: 'moderator', role: 'moderator', systemPrompt: 'Moderator prompt' },
];

const tasks: Task[] = [
  { id: 'math-001', question: 'What is 17 * 24?', correctAnswer: '408', type: 'math' },
  { id: 'trivia-001', question: 'Chemical symbol for gold?', correctAnswer: 'Au', type: 'trivia' },
];

function createMockClient(answerMap: Record<string, string>): LLMClient {
  return {
    async complete(system: string, _user: string) {
      for (const [key, answer] of Object.entries(answerMap)) {
        if (system.includes(key)) {
          return { answer, reasoning: `Reasoning for ${answer}` };
        }
      }
      return { answer: 'unknown', reasoning: 'fallback' };
    },
  };
}

describe('runExperiment', () => {
  it('produces a result for each task', async () => {
    const client = createMockClient({
      'Expert': '408',
      'Non-expert A': '408',
      'Non-expert B': '408',
      'Moderator': '408',
    });

    const result = await runExperiment({
      experimentId: 'test-exp',
      condition: 'expert-hidden',
      tasks,
      agents,
      client,
    });

    expect(result.taskResults).toHaveLength(2);
    expect(result.experimentId).toBe('test-exp');
    expect(result.condition).toBe('expert-hidden');
  });

  it('runs expert solo and scores against ground truth', async () => {
    const client = createMockClient({ 'Expert': '408', 'Non-expert': '412', 'Moderator': '410' });

    const result = await runExperiment({
      experimentId: 'test-exp',
      condition: 'expert-hidden',
      tasks: [tasks[0]!],
      agents,
      client,
    });

    const taskResult = result.taskResults[0]!;
    expect(taskResult.expertSolo.result.answer).toBe('408');
    expect(taskResult.expertSolo.score.correct).toBe(true);
  });

  it('runs all contributors in parallel and passes to moderator', async () => {
    const callLog: string[] = [];
    const client: LLMClient = {
      async complete(system: string, _user: string) {
        callLog.push(system.slice(0, 20));
        return { answer: '408', reasoning: 'test' };
      },
    };

    await runExperiment({
      experimentId: 'test-exp',
      condition: 'expert-hidden',
      tasks: [tasks[0]!],
      agents,
      client,
    });

    expect(callLog.length).toBeGreaterThanOrEqual(5);
  });

  it('scores team answer from moderator', async () => {
    const client: LLMClient = {
      async complete(_system: string, user: string) {
        if (user.includes('Team responses')) {
          return { answer: 'wrong', reasoning: 'bad consensus' };
        }
        return { answer: '408', reasoning: 'correct' };
      },
    };

    const result = await runExperiment({
      experimentId: 'test-exp',
      condition: 'expert-hidden',
      tasks: [tasks[0]!],
      agents,
      client,
    });

    const taskResult = result.taskResults[0]!;
    expect(taskResult.teamScore.correct).toBe(false);
  });

  it('throws if no expert agent found', async () => {
    const noExpert = agents.filter((a) => a.role !== 'expert');
    const client = createMockClient({});

    await expect(
      runExperiment({
        experimentId: 'test',
        condition: 'expert-hidden',
        tasks: [tasks[0]!],
        agents: noExpert,
        client,
      }),
    ).rejects.toThrow('No agent with role "expert" found');
  });

  it('throws if no moderator agent found', async () => {
    const noModerator = agents.filter((a) => a.role !== 'moderator');
    const client = createMockClient({});

    await expect(
      runExperiment({
        experimentId: 'test',
        condition: 'expert-hidden',
        tasks: [tasks[0]!],
        agents: noModerator,
        client,
      }),
    ).rejects.toThrow('No agent with role "moderator" found');
  });
});
