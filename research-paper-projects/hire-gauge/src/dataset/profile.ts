import type { FactorCombination } from './factorial.js';

export interface Profile {
  id: string;
  index: number;
  factors: FactorCombination;
  json: string;
  naturalLanguage: string;
}

const FACTOR_DESCRIPTIONS: Record<string, Record<string, string>> = {
  experience: {
    junior: 'a junior-level candidate with 1-2 years of experience',
    mid: 'a mid-level candidate with 3-5 years of experience',
    senior: 'a senior-level candidate with 7+ years of experience',
  },
  skill_match: {
    low: 'skills that partially match the job requirements',
    medium: 'skills that reasonably match the job requirements',
    high: 'skills that strongly match the job requirements',
  },
  pricing: {
    below_market: 'salary expectations below market rate',
    at_market: 'salary expectations at market rate',
    above_market: 'salary expectations above market rate',
  },
  demographic: {
    group_a: 'from demographic group A',
    group_b: 'from demographic group B',
  },
};

function formatFactorValue(factorName: string, level: string): string {
  const descriptions = FACTOR_DESCRIPTIONS[factorName];
  if (descriptions && descriptions[level]) {
    return descriptions[level];
  }
  return `${factorName}: ${level}`;
}

function renderNaturalLanguage(factors: FactorCombination): string {
  const parts: string[] = [];

  for (const [name, level] of Object.entries(factors)) {
    parts.push(formatFactorValue(name, level));
  }

  if (parts.length === 0) return 'A candidate with no specified attributes.';
  if (parts.length === 1) return `This candidate is ${parts[0]}.`;

  const allButLast = parts.slice(0, -1).join(', ');
  const last = parts[parts.length - 1];
  return `This candidate is ${allButLast}, and has ${last}.`;
}

export function createProfile(factors: FactorCombination, index: number): Profile {
  const id = `profile-${String(index + 1).padStart(3, '0')}`;
  return {
    id,
    index,
    factors,
    json: JSON.stringify(factors),
    naturalLanguage: renderNaturalLanguage(factors),
  };
}
