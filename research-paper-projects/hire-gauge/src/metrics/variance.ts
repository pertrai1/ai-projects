import type { EvaluationResult } from '../evaluation/llm.js';

export interface ProfileVariance {
  profileId: string;
  scores: number[];
  mean: number;
  stdDev: number;
  isUnstable: boolean;
}

export interface VarianceSummary {
  profileVariances: ProfileVariance[];
  overallMeanVariance: number;
  maxVariance: number;
  unstableCount: number;
  unstableProfiles: string[];
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function computeVariance(
  results: EvaluationResult[],
  maxVarianceThreshold: number
): VarianceSummary {
  const byProfile = new Map<string, number[]>();

  for (const result of results) {
    if (result.success && result.output) {
      const scores = byProfile.get(result.profileId) ?? [];
      scores.push(result.output.score);
      byProfile.set(result.profileId, scores);
    }
  }

  const profileVariances: ProfileVariance[] = [];

  for (const [profileId, scores] of byProfile) {
    const mean = calculateMean(scores);
    const stdDev = calculateStdDev(scores, mean);
    profileVariances.push({
      profileId,
      scores,
      mean,
      stdDev,
      isUnstable: stdDev > maxVarianceThreshold,
    });
  }

  profileVariances.sort((a, b) => a.profileId.localeCompare(b.profileId));

  const allStdDevs = profileVariances.map((p) => p.stdDev);
  const overallMeanVariance = calculateMean(allStdDevs);
  const maxVariance = allStdDevs.length > 0 ? Math.max(...allStdDevs) : 0;
  const unstableProfiles = profileVariances.filter((p) => p.isUnstable).map((p) => p.profileId);

  return {
    profileVariances,
    overallMeanVariance,
    maxVariance,
    unstableCount: unstableProfiles.length,
    unstableProfiles,
  };
}
