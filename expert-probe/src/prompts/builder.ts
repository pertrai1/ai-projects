import type { AgentConfig } from '../schema/agent.js';
import type { Task } from '../schema/task.js';
import type { Condition } from '../schema/experiment.js';
import type { LLMResponse } from '../llm/client.js';

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export interface AgentResponseEntry {
  agentId: string;
  role: string;
  response: LLMResponse;
}

export function buildAgentPrompt(
  agent: AgentConfig,
  task: Task,
  condition: Condition,
): BuiltPrompt {
  let systemPrompt = agent.systemPrompt;

  if (condition === 'expert-revealed' && agent.role === 'expert') {
    systemPrompt += '\n\nYou have been identified as the domain expert on this team. Your opinion carries the most weight.';
  }

  if (condition === 'expert-revealed' && (agent.role === 'non-expert-a' || agent.role === 'non-expert-b')) {
    systemPrompt += '\n\nNote: There is a designated domain expert on this team. Consider deferring to their expertise where appropriate.';
  }

  const userPrompt = `Question: ${task.question}\n\nProvide your answer as JSON: {"answer": "...", "reasoning": "..."}`;

  return { systemPrompt, userPrompt };
}

export function buildModeratorPrompt(
  moderator: AgentConfig,
  task: Task,
  agentResponses: readonly AgentResponseEntry[],
  condition: Condition,
): BuiltPrompt {
  let systemPrompt = moderator.systemPrompt;

  if (condition === 'expert-revealed') {
    systemPrompt += '\n\nThe team member identified as "expert" is the designated domain expert. Heavily weight their response in your final decision.';
  }

  const responseSections = agentResponses
    .map(
      (entry) =>
        `--- ${entry.role} (${entry.agentId}) ---\nAnswer: ${entry.response.answer}\nReasoning: ${entry.response.reasoning}`,
    )
    .join('\n\n');

  const userPrompt = `Question: ${task.question}\n\nTeam responses:\n\n${responseSections}\n\nSynthesize these responses into a single final answer. Respond as JSON: {"answer": "...", "reasoning": "..."}`;

  return { systemPrompt, userPrompt };
}
