import { z } from 'zod';
import type { AgentConfig } from '../schema/agent.js';
import type { Task } from '../schema/task.js';
import type { Condition } from '../schema/experiment.js';
import type { LLMClient, LLMResponse } from '../llm/client.js';
import { buildAgentPrompt, buildModeratorPrompt } from '../prompts/builder.js';
import type { AgentResponseEntry } from '../prompts/builder.js';

export const AgentResultSchema = z.object({
  agentId: z.string(),
  taskId: z.string(),
  answer: z.string(),
  reasoning: z.string(),
  raw: z.object({
    answer: z.string(),
    reasoning: z.string(),
  }),
});
export type AgentResult = z.infer<typeof AgentResultSchema>;

export async function runAgent(
  client: LLMClient,
  agent: AgentConfig,
  task: Task,
  condition: Condition,
): Promise<AgentResult> {
  const prompt = buildAgentPrompt(agent, task, condition);
  const response = await client.complete(prompt.systemPrompt, prompt.userPrompt);

  return {
    agentId: agent.id,
    taskId: task.id,
    answer: response.answer,
    reasoning: response.reasoning,
    raw: response,
  };
}

export async function runModerator(
  client: LLMClient,
  moderator: AgentConfig,
  task: Task,
  agentResponses: readonly AgentResponseEntry[],
  condition: Condition,
): Promise<AgentResult> {
  const prompt = buildModeratorPrompt(moderator, task, agentResponses, condition);
  const response = await client.complete(prompt.systemPrompt, prompt.userPrompt);

  return {
    agentId: moderator.id,
    taskId: task.id,
    answer: response.answer,
    reasoning: response.reasoning,
    raw: response,
  };
}
