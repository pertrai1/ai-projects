import type { ExperimentSpec } from '../spec/schema.js';
import type { Profile } from './profile.js';
import { createProfile } from './profile.js';

export interface FactorCombination {
  [factorName: string]: string;
}

function cartesianProduct(factors: Record<string, string[]>): FactorCombination[] {
  const factorNames = Object.keys(factors);
  if (factorNames.length === 0) return [{}];

  const [firstFactor, ...restFactors] = factorNames;
  const firstLevels = factors[firstFactor];
  const restFactorsObj = Object.fromEntries(restFactors.map((f) => [f, factors[f]]));
  const restCombinations = cartesianProduct(restFactorsObj);

  const result: FactorCombination[] = [];
  for (const level of firstLevels) {
    for (const rest of restCombinations) {
      result.push({ [firstFactor]: level, ...rest });
    }
  }
  return result;
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  const random = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateProfiles(spec: ExperimentSpec): Profile[] {
  const factorLevels: Record<string, string[]> = {};
  for (const [name, factor] of Object.entries(spec.factors)) {
    factorLevels[name] = factor.levels;
  }

  const combinations = cartesianProduct(factorLevels);
  const shuffled = seededShuffle(combinations, spec.seed);

  return shuffled.map((combo, index) => createProfile(combo, index));
}

export function getExpectedProfileCount(spec: ExperimentSpec): number {
  return Object.values(spec.factors).reduce((acc, factor) => acc * factor.levels.length, 1);
}
