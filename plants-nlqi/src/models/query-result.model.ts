/**
 * Query Result Models
 * Represents the results of a plant query
 */

import { PlantRecord } from './plant.model';

export interface QueryResult {
  query: string;
  answer: string;
  plants: PlantMatch[];
  metadata: QueryMetadata;
}

export interface PlantMatch {
  plant: PlantRecord;
  score: number; // Relevance score (0-1)
  matchReason?: string; // Why this plant matched
}

export interface QueryMetadata {
  totalResults: number;
  searchTime: number; // in milliseconds
  searchType: 'vector' | 'hybrid' | 'structured';
  filtersApplied?: QueryFilters;
}

export interface QueryFilters {
  states?: string[];
  nativeStatus?: 'native' | 'introduced' | 'both';
  bloomPeriod?: string;
  growthHabit?: string[];
  sunRequirements?: string[];
  waterNeeds?: string;
  hardinessZones?: string[];
  wildlifeValue?: string[];
}

/**
 * Vector search result from Pinecone
 */
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

/**
 * Response from the LLM
 */
export interface LLMResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
