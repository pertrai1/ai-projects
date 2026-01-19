import type { ExperimentSpec } from '../spec/schema.js';
import type { Profile } from '../dataset/profile.js';
import type { ProfileVariance, VarianceSummary } from './variance.js';

export interface MainEffect {
  factor: string;
  levels: { level: string; meanScore: number; count: number }[];
  effectSize: number;
  description: string;
}

export interface InteractionEffect {
  factors: [string, string];
  cells: { [key: string]: { meanScore: number; count: number } };
  effectSize: number;
  description: string;
}

export interface Metrics {
  mainEffects: MainEffect[];
  interactionEffects: InteractionEffect[];
  varianceSummary: VarianceSummary;
  perProfileStats: ProfileVariance[];
  totalEvaluations: number;
  successfulEvaluations: number;
  failedEvaluations: number;
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeMainEffects(
  spec: ExperimentSpec,
  profiles: Profile[],
  scoresByProfile: Map<string, number>
): MainEffect[] {
  const effects: MainEffect[] = [];

  for (const [factorName, factor] of Object.entries(spec.factors)) {
    const levelScores: Map<string, number[]> = new Map();
    for (const level of factor.levels) {
      levelScores.set(level, []);
    }

    for (const profile of profiles) {
      const level = profile.factors[factorName];
      const score = scoresByProfile.get(profile.id);
      if (level && score !== undefined) {
        levelScores.get(level)?.push(score);
      }
    }

    const levels = factor.levels.map((level) => {
      const scores = levelScores.get(level) ?? [];
      return {
        level,
        meanScore: calculateMean(scores),
        count: scores.length,
      };
    });

    const meanScores = levels.map((l) => l.meanScore);
    const effectSize = meanScores.length >= 2 ? Math.max(...meanScores) - Math.min(...meanScores) : 0;

    const sortedByScore = [...levels].sort((a, b) => b.meanScore - a.meanScore);
    const description = `${factorName}: ${sortedByScore[0]?.level} scores highest (${sortedByScore[0]?.meanScore.toFixed(2)})`;

    effects.push({ factor: factorName, levels, effectSize, description });
  }

  effects.sort((a, b) => b.effectSize - a.effectSize);
  return effects;
}

export function computeInteractionEffects(
  spec: ExperimentSpec,
  profiles: Profile[],
  scoresByProfile: Map<string, number>
): InteractionEffect[] {
  const effects: InteractionEffect[] = [];
  const factorNames = Object.keys(spec.factors);

  const demographicFactor = factorNames.find(
    (f) => f.toLowerCase().includes('demographic') || f.toLowerCase().includes('group')
  );

  if (!demographicFactor) {
    return effects;
  }

  for (const otherFactor of factorNames) {
    if (otherFactor === demographicFactor) continue;

    const cells: { [key: string]: { scores: number[]; meanScore: number; count: number } } = {};
    const demoLevels = spec.factors[demographicFactor].levels;
    const otherLevels = spec.factors[otherFactor].levels;

    for (const demoLevel of demoLevels) {
      for (const otherLevel of otherLevels) {
        cells[`${demoLevel}|${otherLevel}`] = { scores: [], meanScore: 0, count: 0 };
      }
    }

    for (const profile of profiles) {
      const demoLevel = profile.factors[demographicFactor];
      const otherLevel = profile.factors[otherFactor];
      const score = scoresByProfile.get(profile.id);
      if (demoLevel && otherLevel && score !== undefined) {
        const key = `${demoLevel}|${otherLevel}`;
        cells[key].scores.push(score);
      }
    }

    for (const cell of Object.values(cells)) {
      cell.meanScore = calculateMean(cell.scores);
      cell.count = cell.scores.length;
    }

    const effectSize = computeDifferenceInDifferences(cells, demoLevels, otherLevels);

    const cellsOutput: { [key: string]: { meanScore: number; count: number } } = {};
    for (const [key, value] of Object.entries(cells)) {
      cellsOutput[key] = { meanScore: value.meanScore, count: value.count };
    }

    const description =
      Math.abs(effectSize) > 0.1
        ? `${demographicFactor} × ${otherFactor}: effect size ${effectSize.toFixed(3)} suggests differential treatment`
        : `${demographicFactor} × ${otherFactor}: minimal interaction (${effectSize.toFixed(3)})`;

    effects.push({
      factors: [demographicFactor, otherFactor],
      cells: cellsOutput,
      effectSize,
      description,
    });
  }

  effects.sort((a, b) => Math.abs(b.effectSize) - Math.abs(a.effectSize));
  return effects;
}

function computeDifferenceInDifferences(
  cells: { [key: string]: { scores: number[]; meanScore: number; count: number } },
  demoLevels: string[],
  otherLevels: string[]
): number {
  if (demoLevels.length < 2 || otherLevels.length < 2) return 0;

  const [demoA, demoB] = demoLevels;
  const [otherLow, otherHigh] = [otherLevels[0], otherLevels[otherLevels.length - 1]];

  const cellALow = cells[`${demoA}|${otherLow}`]?.meanScore ?? 0;
  const cellAHigh = cells[`${demoA}|${otherHigh}`]?.meanScore ?? 0;
  const cellBLow = cells[`${demoB}|${otherLow}`]?.meanScore ?? 0;
  const cellBHigh = cells[`${demoB}|${otherHigh}`]?.meanScore ?? 0;

  const diffA = cellAHigh - cellALow;
  const diffB = cellBHigh - cellBLow;

  return diffA - diffB;
}

export function computeMetrics(
  spec: ExperimentSpec,
  profiles: Profile[],
  varianceSummary: VarianceSummary,
  totalEvaluations: number,
  failedCount: number
): Metrics {
  const scoresByProfile = new Map<string, number>();
  for (const pv of varianceSummary.profileVariances) {
    scoresByProfile.set(pv.profileId, pv.mean);
  }

  return {
    mainEffects: computeMainEffects(spec, profiles, scoresByProfile),
    interactionEffects: computeInteractionEffects(spec, profiles, scoresByProfile),
    varianceSummary,
    perProfileStats: varianceSummary.profileVariances,
    totalEvaluations,
    successfulEvaluations: totalEvaluations - failedCount,
    failedEvaluations: failedCount,
  };
}
