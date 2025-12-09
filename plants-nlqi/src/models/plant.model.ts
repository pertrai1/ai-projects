/**
 * Plant Record Model
 * Represents a plant from the USDA PLANTS Database
 */

export interface PlantRecord {
  id: string;
  scientificName: string;
  commonNames: string[];
  symbol: string; // USDA PLANTS unique symbol (e.g., "QUAL" for Quercus alba)
  family: string;
  duration: 'Annual' | 'Perennial' | 'Biennial';
  growthHabit: GrowthHabit[];
  nativeStatus: NativeStatusEntry[];
  distribution: Distribution;
  characteristics: PlantCharacteristics;
  conservationStatus?: string;
  images?: string[];
  description?: string;
}

export type GrowthHabit =
  | 'Tree'
  | 'Shrub'
  | 'Subshrub'
  | 'Forb/herb'
  | 'Graminoid'
  | 'Vine'
  | 'Nonvascular';

export interface NativeStatusEntry {
  state: string; // Two-letter state code (e.g., "NC")
  status: 'Native' | 'Introduced' | 'Both';
}

export interface Distribution {
  states: string[]; // Array of state codes
  counties?: Map<string, string[]>; // State code -> array of county names
  regions?: string[]; // e.g., "Southeast", "Northeast"
}

export interface PlantCharacteristics {
  height?: HeightRange;
  bloomPeriod?: string; // e.g., "Spring", "Late Spring to Early Summer"
  fruitPeriod?: string;
  flowerColor?: string[];
  sunRequirements?: SunRequirement[];
  waterNeeds?: WaterRequirement;
  soilTexture?: SoilTexture[];
  phRange?: PHRange;
  hardinessZones?: string[]; // e.g., ["4a", "4b", "5a", "5b", "6a", "6b"]
  wildlifeValue?: WildlifeValue[];
  toxicity?: string;
  fireResistance?: 'Low' | 'Medium' | 'High';
}

export interface HeightRange {
  min: number; // in feet
  max: number; // in feet
  unit: 'feet' | 'meters';
}

export type SunRequirement = 'Full Sun' | 'Partial Shade' | 'Full Shade';

export type WaterRequirement = 'Low' | 'Medium' | 'High';

export type SoilTexture = 'Sand' | 'Loam' | 'Clay' | 'Silt';

export interface PHRange {
  min: number; // e.g., 5.5
  max: number; // e.g., 7.5
}

export type WildlifeValue =
  | 'Pollinators'
  | 'Birds'
  | 'Mammals'
  | 'Butterflies'
  | 'Hummingbirds'
  | 'Bees';

/**
 * Simplified plant data for embedding/search
 */
export interface PlantDocument {
  id: string;
  text: string; // Rich text description for embedding
  metadata: PlantMetadata;
  embedding?: number[];
}

export interface PlantMetadata {
  scientificName: string;
  commonNames: string[];
  family: string;
  states: string[];
  growthHabit: string[];
  duration: string;
  bloomPeriod?: string;
  nativeInStates: string[]; // States where it's native
}
