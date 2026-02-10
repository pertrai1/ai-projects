import { describe, it, expect } from 'vitest';
import { buildAgentPrompt, buildModeratorPrompt } from '../../src/prompts/builder.js';
import type { AgentConfig } from '../../src/schema/agent.js';
import type { Task } from '../../src/schema/task.js';

const expertAgent: AgentConfig = {
  id: 'expert',
  role: 'expert',
  systemPrompt: 'You are a domain expert.',
};

const nonExpertA: AgentConfig = {
  id: 'non-expert-a',
  role: 'non-expert-a',
  systemPrompt: 'You are a confident generalist.',
};

const moderator: AgentConfig = {
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

describe('buildAgentPrompt', () => {
  it('includes task question in user prompt', () => {
    const result = buildAgentPrompt(expertAgent, task, 'expert-hidden');
    expect(result.userPrompt).toContain('What is 17 * 24?');
  });

  it('uses agent systemPrompt as base', () => {
    const result = buildAgentPrompt(expertAgent, task, 'expert-hidden');
    expect(result.systemPrompt).toContain('You are a domain expert.');
  });

  it('does not add expert markers in expert-hidden condition', () => {
    const result = buildAgentPrompt(expertAgent, task, 'expert-hidden');
    expect(result.systemPrompt).not.toContain('identified as the domain expert');
  });

  it('adds expert marker for expert in expert-revealed condition', () => {
    const result = buildAgentPrompt(expertAgent, task, 'expert-revealed');
    expect(result.systemPrompt).toContain('identified as the domain expert');
  });

  it('adds deference note for non-expert in expert-revealed condition', () => {
    const result = buildAgentPrompt(nonExpertA, task, 'expert-revealed');
    expect(result.systemPrompt).toContain('designated domain expert');
    expect(result.systemPrompt).toContain('deferring');
  });

  it('does not add deference note for non-expert in expert-hidden condition', () => {
    const result = buildAgentPrompt(nonExpertA, task, 'expert-hidden');
    expect(result.systemPrompt).not.toContain('designated domain expert');
  });
});

describe('buildModeratorPrompt', () => {
  const agentResponses = [
    { agentId: 'expert', role: 'expert', response: { answer: '408', reasoning: '17*24=408' } },
    { agentId: 'non-expert-a', role: 'non-expert-a', response: { answer: '412', reasoning: 'Rough estimate' } },
    { agentId: 'non-expert-b', role: 'non-expert-b', response: { answer: '408', reasoning: 'Checked twice' } },
  ] as const;

  it('includes all agent responses in user prompt', () => {
    const result = buildModeratorPrompt(moderator, task, agentResponses, 'expert-hidden');
    expect(result.userPrompt).toContain('408');
    expect(result.userPrompt).toContain('412');
    expect(result.userPrompt).toContain('17*24=408');
    expect(result.userPrompt).toContain('Rough estimate');
  });

  it('includes task question', () => {
    const result = buildModeratorPrompt(moderator, task, agentResponses, 'expert-hidden');
    expect(result.userPrompt).toContain('What is 17 * 24?');
  });

  it('does not add expert weighting in expert-hidden condition', () => {
    const result = buildModeratorPrompt(moderator, task, agentResponses, 'expert-hidden');
    expect(result.systemPrompt).not.toContain('Heavily weight');
  });

  it('adds expert weighting in expert-revealed condition', () => {
    const result = buildModeratorPrompt(moderator, task, agentResponses, 'expert-revealed');
    expect(result.systemPrompt).toContain('Heavily weight');
  });

  it('identifies agent roles in user prompt', () => {
    const result = buildModeratorPrompt(moderator, task, agentResponses, 'expert-hidden');
    expect(result.userPrompt).toContain('expert (expert)');
    expect(result.userPrompt).toContain('non-expert-a (non-expert-a)');
  });
});
