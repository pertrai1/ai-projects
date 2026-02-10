import { describe, it, expect } from 'vitest';
import { computeMetrics } from '../../src/metrics/compute.js';
import type { ExperimentResult } from '../../src/experiment/runner.js';

function makeTaskResult(
  taskId: string,
  expertAnswer: string,
  teamAnswer: string,
  correctAnswer: string,
) {
  const expertCorrect = expertAnswer.toLowerCase() === correctAnswer.toLowerCase();
  const teamCorrect = teamAnswer.toLowerCase() === correctAnswer.toLowerCase();

  return {
    taskId,
    expertSolo: {
      result: { agentId: 'expert', taskId, answer: expertAnswer, reasoning: '', raw: { answer: expertAnswer, reasoning: '' } },
      score: { correct: expertCorrect, given: expertAnswer, expected: correctAnswer, normalizedGiven: expertAnswer.toLowerCase(), normalizedExpected: correctAnswer.toLowerCase() },
    },
    teamResponses: [],
    moderatorResult: { agentId: 'moderator', taskId, answer: teamAnswer, reasoning: '', raw: { answer: teamAnswer, reasoning: '' } },
    teamScore: { correct: teamCorrect, given: teamAnswer, expected: correctAnswer, normalizedGiven: teamAnswer.toLowerCase(), normalizedExpected: correctAnswer.toLowerCase() },
  };
}

const tasksMap = new Map([
  ['math-001', '408'],
  ['trivia-001', 'Au'],
  ['logic-001', 'No'],
]);

describe('computeMetrics', () => {
  it('computes 100% accuracy when all correct', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-001',
      condition: 'expert-hidden',
      taskResults: [
        makeTaskResult('math-001', '408', '408', '408'),
        makeTaskResult('trivia-001', 'Au', 'Au', 'Au'),
      ],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.expertAccuracy).toBe(1);
    expect(metrics.teamAccuracy).toBe(1);
    expect(metrics.accuracyDelta).toBe(0);
  });

  it('computes negative delta when team underperforms expert', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-001',
      condition: 'expert-hidden',
      taskResults: [
        makeTaskResult('math-001', '408', 'wrong', '408'),
        makeTaskResult('trivia-001', 'Au', 'wrong', 'Au'),
      ],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.expertAccuracy).toBe(1);
    expect(metrics.teamAccuracy).toBe(0);
    expect(metrics.accuracyDelta).toBe(-1);
  });

  it('computes positive delta when team outperforms expert', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-001',
      condition: 'expert-hidden',
      taskResults: [
        makeTaskResult('math-001', 'wrong', '408', '408'),
        makeTaskResult('trivia-001', 'wrong', 'Au', 'Au'),
      ],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.expertAccuracy).toBe(0);
    expect(metrics.teamAccuracy).toBe(1);
    expect(metrics.accuracyDelta).toBe(1);
  });

  it('computes partial accuracy correctly', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-001',
      condition: 'expert-hidden',
      taskResults: [
        makeTaskResult('math-001', '408', '408', '408'),
        makeTaskResult('trivia-001', 'Au', 'wrong', 'Au'),
      ],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.expertAccuracy).toBe(1);
    expect(metrics.teamAccuracy).toBe(0.5);
    expect(metrics.accuracyDelta).toBe(-0.5);
  });

  it('handles empty task results', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-001',
      condition: 'expert-hidden',
      taskResults: [],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.totalTasks).toBe(0);
    expect(metrics.expertAccuracy).toBe(0);
    expect(metrics.teamAccuracy).toBe(0);
    expect(metrics.accuracyDelta).toBe(0);
  });

  it('includes per-task metrics', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-001',
      condition: 'expert-revealed',
      taskResults: [
        makeTaskResult('math-001', '408', 'wrong', '408'),
      ],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.taskMetrics).toHaveLength(1);
    expect(metrics.taskMetrics[0]!.taskId).toBe('math-001');
    expect(metrics.taskMetrics[0]!.expertCorrect).toBe(true);
    expect(metrics.taskMetrics[0]!.teamCorrect).toBe(false);
  });

  it('preserves experiment metadata', () => {
    const result: ExperimentResult = {
      experimentId: 'exp-custom',
      condition: 'expert-revealed',
      taskResults: [makeTaskResult('math-001', '408', '408', '408')],
    };

    const metrics = computeMetrics(result, tasksMap);
    expect(metrics.experimentId).toBe('exp-custom');
    expect(metrics.condition).toBe('expert-revealed');
  });
});
