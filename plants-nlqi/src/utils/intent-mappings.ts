/**
 * Intent Mapping Constants
 * Mappings and constants for parsing natural language to structured filters
 */

import { StateMapping, BloomPeriodFilter, WaterNeedsFilter, SunRequirementFilter } from '../models';

/**
 * US State mappings for normalization
 */
export const STATE_MAPPINGS: StateMapping[] = [
  {
    fullName: 'Alabama',
    abbreviation: 'AL',
    aliases: ['alabama', 'al', 'a.l.', 'ala'],
  },
  {
    fullName: 'Florida',
    abbreviation: 'FL',
    aliases: ['florida', 'fl', 'f.l.', 'fla'],
  },
  {
    fullName: 'Georgia',
    abbreviation: 'GA',
    aliases: ['georgia', 'ga', 'g.a.'],
  },
  {
    fullName: 'Kentucky',
    abbreviation: 'KY',
    aliases: ['kentucky', 'ky', 'k.y.', 'ken'],
  },
  {
    fullName: 'Louisiana',
    abbreviation: 'LA',
    aliases: ['louisiana', 'la', 'l.a.'],
  },
  {
    fullName: 'Maryland',
    abbreviation: 'MD',
    aliases: ['maryland', 'md', 'm.d.'],
  },
  {
    fullName: 'Mississippi',
    abbreviation: 'MS',
    aliases: ['mississippi', 'ms', 'm.s.', 'miss'],
  },
  {
    fullName: 'North Carolina',
    abbreviation: 'NC',
    aliases: ['north carolina', 'nc', 'n.c.', 'n. carolina'],
  },
  {
    fullName: 'South Carolina',
    abbreviation: 'SC',
    aliases: ['south carolina', 'sc', 's.c.', 's. carolina'],
  },
  {
    fullName: 'Tennessee',
    abbreviation: 'TN',
    aliases: ['tennessee', 'tn', 't.n.', 'tenn'],
  },
  {
    fullName: 'Texas',
    abbreviation: 'TX',
    aliases: ['texas', 'tx', 't.x.', 'tex'],
  },
  {
    fullName: 'Virginia',
    abbreviation: 'VA',
    aliases: ['virginia', 'va', 'v.a.'],
  },
  {
    fullName: 'West Virginia',
    abbreviation: 'WV',
    aliases: ['west virginia', 'wv', 'w.v.', 'w. virginia'],
  },
];

/**
 * Normalize state name to abbreviation
 */
export function normalizeStateName(input: string): string | null {
  const normalized = input.toLowerCase().trim();

  for (const mapping of STATE_MAPPINGS) {
    if (mapping.aliases.includes(normalized)) {
      return mapping.abbreviation;
    }
  }

  return null;
}

/**
 * Water needs keyword mappings
 */
export const WATER_NEEDS_MAP: Record<string, WaterNeedsFilter> = {
  // Low water
  drought: 'Low',
  'drought-tolerant': 'Low',
  'drought tolerant': 'Low',
  dry: 'Low',
  xeric: 'Low',
  'low water': 'Low',
  'little water': 'Low',

  // Medium water
  moderate: 'Medium',
  medium: 'Medium',
  average: 'Medium',
  normal: 'Medium',

  // High water
  wet: 'High',
  moist: 'High',
  'high water': 'High',
  'water-loving': 'High',
  hydrophytic: 'High',
};

/**
 * Sun requirements keyword mappings
 */
export const SUN_REQUIREMENTS_MAP: Record<string, SunRequirementFilter[]> = {
  'full sun': ['Full Sun'],
  sun: ['Full Sun'],
  sunny: ['Full Sun'],

  shade: ['Full Shade', 'Partial Shade'],
  shady: ['Full Shade', 'Partial Shade'],
  'shade-loving': ['Full Shade', 'Partial Shade'],
  'shade tolerant': ['Full Shade', 'Partial Shade'],

  'partial shade': ['Partial Shade'],
  'part shade': ['Partial Shade'],
  'dappled shade': ['Partial Shade'],

  'full shade': ['Full Shade'],
  'deep shade': ['Full Shade'],
};

/**
 * Bloom period keyword mappings
 */
export const BLOOM_PERIOD_MAP: Record<string, BloomPeriodFilter[]> = {
  spring: ['Spring', 'Late Spring'],
  'early spring': ['Spring'],
  'late spring': ['Late Spring'],

  summer: ['Early Summer', 'Summer', 'Late Summer'],
  'early summer': ['Early Summer'],
  midsummer: ['Summer'],
  'late summer': ['Late Summer'],

  fall: ['Fall'],
  autumn: ['Fall'],

  winter: ['Winter'],
};

/**
 * Growth habit keyword mappings
 */
export const GROWTH_HABIT_MAP: Record<string, string> = {
  tree: 'Tree',
  trees: 'Tree',

  shrub: 'Shrub',
  shrubs: 'Shrub',
  bush: 'Shrub',
  bushes: 'Shrub',

  wildflower: 'Forb/herb',
  wildflowers: 'Forb/herb',
  flower: 'Forb/herb',
  flowers: 'Forb/herb',
  forb: 'Forb/herb',
  herb: 'Forb/herb',
  herbaceous: 'Forb/herb',

  grass: 'Graminoid',
  grasses: 'Graminoid',
  sedge: 'Graminoid',
  rush: 'Graminoid',

  vine: 'Vine',
  vines: 'Vine',
  climber: 'Vine',
};

/**
 * Wildlife value keyword mappings
 */
export const WILDLIFE_VALUE_MAP: Record<string, string> = {
  pollinator: 'Pollinators',
  pollinators: 'Pollinators',

  butterfly: 'Butterflies',
  butterflies: 'Butterflies',

  bee: 'Bees',
  bees: 'Bees',

  bird: 'Birds',
  birds: 'Birds',

  hummingbird: 'Hummingbirds',
  hummingbirds: 'Hummingbirds',
  hummer: 'Hummingbirds',

  mammal: 'Mammals',
  mammals: 'Mammals',
  wildlife: 'Mammals',
};

/**
 * Duration keyword mappings
 */
export const DURATION_MAP: Record<string, string> = {
  annual: 'Annual',
  annuals: 'Annual',

  perennial: 'Perennial',
  perennials: 'Perennial',

  biennial: 'Biennial',
  biennials: 'Biennial',
};

/**
 * Common characteristic keywords
 */
export const CHARACTERISTIC_KEYWORDS = {
  evergreen: ['evergreen', 'year-round foliage', 'non-deciduous'],
  droughtTolerant: ['drought', 'drought-tolerant', 'xeric', 'dry conditions'],
  shadeTolerant: ['shade', 'shade-tolerant', 'shade-loving'],
  fireResistant: ['fire-resistant', 'fire resistant', 'fire safe'],
  toxic: ['toxic', 'poisonous', 'dangerous'],
  native: ['native', 'indigenous', 'endemic'],
};
