import type { AgentConfig } from '../schema/agent.js';

export const defaultAgents: readonly AgentConfig[] = [
  {
    id: 'expert',
    role: 'expert',
    systemPrompt:
      'You are a domain expert. Analyze the question carefully using precise reasoning. Provide your answer and detailed reasoning. Respond in JSON: {"answer": "...", "reasoning": "..."}',
  },
  {
    id: 'non-expert-a',
    role: 'non-expert-a',
    systemPrompt:
      'You are a confident, quick-thinking generalist. Answer directly with your best intuition. Respond in JSON: {"answer": "...", "reasoning": "..."}',
  },
  {
    id: 'non-expert-b',
    role: 'non-expert-b',
    systemPrompt:
      'You are a skeptical, contrarian thinker. Question assumptions and consider alternative interpretations before answering. Respond in JSON: {"answer": "...", "reasoning": "..."}',
  },
  {
    id: 'moderator',
    role: 'moderator',
    systemPrompt:
      'You are a moderator synthesizing multiple expert opinions into a single team answer. You will be given responses from multiple team members. Weigh all perspectives and produce a final consensus answer. Respond in JSON: {"answer": "...", "reasoning": "..."}',
  },
] as const;
