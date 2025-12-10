/**
 * Intent Model
 * Structures for understanding user query intent
 */

export type QueryType =
  | 'identification' // "What is this plant?"
  | 'characteristics' // "Tell me about oak trees"
  | 'location' // "What plants grow in NC?"
  | 'recommendation' // "Show me drought-tolerant plants"
  | 'comparison' // "Compare these two plants"
  | 'general'; // General questions

export interface QueryIntent {
  queryType: QueryType;
  filters: QueryFilters;
  semanticQuery: string; // Refined query for vector search
  confidence: number; // 0-1, how confident we are about the intent
  originalQuery: string; // Original user query
}

export interface QueryFilters {
  // Location filters
  states?: string[]; // State codes: ["NC", "VA"]
  nativeStatus?: 'native' | 'introduced' | 'both';

  // Plant type filters
  growthHabit?: GrowthHabitFilter[];
  duration?: DurationFilter[];

  // Characteristic filters
  characteristics?: CharacteristicFilters;

  // Wildlife and ecological filters
  wildlifeValue?: WildlifeValueFilter[];

  // Specific plant references
  plantIds?: string[]; // Reference specific plants by ID
  scientificNames?: string[]; // Reference by scientific name
}

export type GrowthHabitFilter =
  | 'Tree'
  | 'Shrub'
  | 'Subshrub'
  | 'Forb/herb'
  | 'Graminoid'
  | 'Vine'
  | 'Nonvascular';

export type DurationFilter = 'Annual' | 'Perennial' | 'Biennial';

export interface CharacteristicFilters {
  // Height
  heightMin?: number; // in feet
  heightMax?: number; // in feet

  // Bloom timing
  bloomPeriod?: BloomPeriodFilter[];

  // Light requirements
  sunRequirements?: SunRequirementFilter[];

  // Water requirements
  waterNeeds?: WaterNeedsFilter;

  // Soil
  soilTexture?: SoilTextureFilter[];
  phMin?: number;
  phMax?: number;

  // Hardiness
  hardinessZones?: string[]; // ["6a", "6b", "7a"]

  // Colors
  flowerColor?: string[];

  // Special characteristics
  evergreen?: boolean;
  droughtTolerant?: boolean;
  shadeTolerant?: boolean;
  fireResistant?: boolean;
  toxic?: boolean;
}

export type BloomPeriodFilter =
  | 'Spring'
  | 'Late Spring'
  | 'Early Summer'
  | 'Summer'
  | 'Late Summer'
  | 'Fall'
  | 'Winter';

export type SunRequirementFilter = 'Full Sun' | 'Partial Shade' | 'Full Shade';

export type WaterNeedsFilter = 'Low' | 'Medium' | 'High';

export type SoilTextureFilter = 'Sand' | 'Loam' | 'Clay' | 'Silt';

export type WildlifeValueFilter =
  | 'Pollinators'
  | 'Birds'
  | 'Mammals'
  | 'Butterflies'
  | 'Hummingbirds'
  | 'Bees';

/**
 * Mapping of natural language terms to structured filters
 */
export interface CharacteristicMapping {
  // Common terms → filter values
  synonyms: Map<string, string[]>;

  // Bloom period mappings
  bloomPeriodMap: Map<string, BloomPeriodFilter[]>;

  // Water needs mappings
  waterNeedsMap: Map<string, WaterNeedsFilter>;

  // Sun requirements mappings
  sunRequirementsMap: Map<string, SunRequirementFilter[]>;
}

/**
 * State name normalization mappings
 */
export interface StateMapping {
  fullName: string; // "North Carolina"
  abbreviation: string; // "NC"
  aliases: string[]; // ["NC", "N.C.", "north carolina"]
}

/**
 * Result of intent parsing with metadata
 */
export interface IntentParseResult {
  intent: QueryIntent;
  parsingTime: number; // milliseconds
  rawResponse?: string; // Raw LLM response for debugging
  warnings?: string[]; // Any parsing warnings or ambiguities
}
