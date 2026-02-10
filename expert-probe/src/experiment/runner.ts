import { z } from 'zod';
import type { Task } from '../schema/task.js';
import type { AgentConfig } from '../schema/agent.js';
import type { Condition } from '../schema/experiment.js';
import type { LLMClient } from '../llm/client.js';
import { runAgent, runModerator } from '../agent/runner.js';
import type { AgentResult } from '../agent/runner.js';
import { scoreAnswer } from '../scoring/scorer.js';
import type { ScoreResult } from '../scoring/scorer.js';
import type { AgentResponseEntry } from '../prompts/builder.js';

export const TaskResultSchema = z.object({
  taskId: z.string(),
  expertSolo: z.object({
    result: z.custom<AgentResult>(),
    score: z.custom<ScoreResult>(),
  }),
  teamResponses: z.array(z.custom<AgentResult>()),
  moderatorResult: z.custom<AgentResult>(),
  teamScore: z.custom<ScoreResult>(),
});
export type TaskResult = z.infer<typeof TaskResultSchema>;

export const ExperimentResultSchema = z.object({
  experimentId: z.string(),
  condition: z.string(),
  taskResults: z.array(z.custom<TaskResult>()),
});
export type ExperimentResult = z.infer<typeof ExperimentResultSchema>;

export interface ExperimentRunConfig {
  experimentId: string;
  condition: Condition;
  tasks: readonly Task[];
  agents: readonly AgentConfig[];
  client: LLMClient;
}

export async function runExperiment(config: ExperimentRunConfig): Promise<ExperimentResult> {
  const expert = config.agents.find((a) => a.role === 'expert');
  const moderator = config.agents.find((a) => a.role === 'moderator');
  const contributors = config.agents.filter((a) => a.role !== 'moderator');

  if (!expert) throw new Error('No agent with role "expert" found');
  if (!moderator) throw new Error('No agent with role "moderator" found');

  const taskResults: TaskResult[] = [];

  for (const task of config.tasks) {
    const expertSoloResult = await runAgent(config.client, expert, task, config.condition);
    const expertSoloScore = scoreAnswer(expertSoloResult.answer, task.correctAnswer);

    const teamResponses = await Promise.all(
      contributors.map((agent) => runAgent(config.client, agent, task, config.condition)),
    );

    const agentResponseEntries: AgentResponseEntry[] = teamResponses.map((r) => {
      const agent = config.agents.find((a) => a.id === r.agentId);
      return {
        agentId: r.agentId,
        role: agent?.role ?? 'unknown',
        response: r.raw,
      };
    });

    const moderatorResult = await runModerator(
      config.client,
      moderator,
      task,
      agentResponseEntries,
      config.condition,
    );
    const teamScore = scoreAnswer(moderatorResult.answer, task.correctAnswer);

    taskResults.push({
      taskId: task.id,
      expertSolo: { result: expertSoloResult, score: expertSoloScore },
      teamResponses,
      moderatorResult,
      teamScore,
    });
  }

  return {
    experimentId: config.experimentId,
    condition: config.condition,
    taskResults,
  };
}
