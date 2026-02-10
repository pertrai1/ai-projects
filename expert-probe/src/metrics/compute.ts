import type { ExperimentResult, TaskResult } from '../experiment/runner.js';

export interface TaskMetric {
  taskId: string;
  expertCorrect: boolean;
  teamCorrect: boolean;
  expertAnswer: string;
  teamAnswer: string;
  correctAnswer: string;
}

export interface ExperimentMetrics {
  experimentId: string;
  condition: string;
  totalTasks: number;
  expertCorrectCount: number;
  teamCorrectCount: number;
  expertAccuracy: number;
  teamAccuracy: number;
  accuracyDelta: number;
  taskMetrics: TaskMetric[];
}

export function computeMetrics(
  result: ExperimentResult,
  tasks: ReadonlyMap<string, string>,
): ExperimentMetrics {
  const taskMetrics: TaskMetric[] = result.taskResults.map((tr: TaskResult) => ({
    taskId: tr.taskId,
    expertCorrect: tr.expertSolo.score.correct,
    teamCorrect: tr.teamScore.correct,
    expertAnswer: tr.expertSolo.result.answer,
    teamAnswer: tr.moderatorResult.answer,
    correctAnswer: tasks.get(tr.taskId) ?? 'unknown',
  }));

  const totalTasks = taskMetrics.length;
  const expertCorrectCount = taskMetrics.filter((m) => m.expertCorrect).length;
  const teamCorrectCount = taskMetrics.filter((m) => m.teamCorrect).length;

  const expertAccuracy = totalTasks > 0 ? expertCorrectCount / totalTasks : 0;
  const teamAccuracy = totalTasks > 0 ? teamCorrectCount / totalTasks : 0;
  const accuracyDelta = teamAccuracy - expertAccuracy;

  return {
    experimentId: result.experimentId,
    condition: result.condition,
    totalTasks,
    expertCorrectCount,
    teamCorrectCount,
    expertAccuracy,
    teamAccuracy,
    accuracyDelta,
    taskMetrics,
  };
}
