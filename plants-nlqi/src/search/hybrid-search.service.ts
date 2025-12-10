/**
 * Hybrid Search Service
 * Combines vector similarity search with structured metadata filtering
 */

import { QueryIntent, PlantRecord, VectorSearchResult } from '../models';
import { VectorSearchService } from '../services/vector-search.service';
import { EmbeddingService } from '../services/embedding.service';
import { loadPlantsByIds } from '../utils/plant-loader';
import { logger } from '../utils/logger';

export interface HybridSearchConfig {
  voyageApiKey: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
}

export interface HybridSearchResult {
  plants: PlantRecord[];
  scores: Map<string, number>; // Plant ID -> relevance score
  searchStrategy: 'vector' | 'filtered' | 'hybrid';
  vectorResultCount: number;
  filteredResultCount: number;
}

export class HybridSearchService {
  private embeddingService: EmbeddingService;
  private vectorSearchService: VectorSearchService;

  constructor(config: HybridSearchConfig) {
    this.embeddingService = new EmbeddingService({
      apiKey: config.voyageApiKey,
    });

    this.vectorSearchService = new VectorSearchService({
      apiKey: config.pineconeApiKey,
      indexName: config.pineconeIndexName,
      namespace: config.pineconeNamespace,
    });

    logger.info('Hybrid search service initialized');
  }

  /**
   * Perform hybrid search using intent
   */
  async search(intent: QueryIntent, topK: number = 10): Promise<HybridSearchResult> {
    const startTime = Date.now();

    try {
      logger.info('Performing hybrid search', {
        queryType: intent.queryType,
        hasFilters: Object.keys(intent.filters).length > 0,
        topK,
      });

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.embedText(intent.semanticQuery);

      // Build Pinecone metadata filter
      const metadataFilter = this.buildMetadataFilter(intent.filters);

      // Perform vector search with filters
      const vectorResults = await this.vectorSearchService.searchSimilar(
        queryEmbedding,
        topK * 2, // Get more results to allow for filtering
        metadataFilter
      );

      logger.debug('Vector search completed', { resultsCount: vectorResults.length });

      // If we have specific plant IDs (from conversation context), prioritize them
      let finalResults = vectorResults;
      if (intent.filters.plantIds && intent.filters.plantIds.length > 0) {
        finalResults = this.prioritizeSpecificPlants(vectorResults, intent.filters.plantIds);
      }

      // Load full plant records
      const plantIds = finalResults.map((r) => r.id).slice(0, topK);
      const plants = loadPlantsByIds(plantIds);

      // Create score map
      const scores = new Map<string, number>();
      finalResults.forEach((result) => {
        scores.set(result.id, result.score);
      });

      // Post-filter plants that don't meet criteria (Pinecone metadata might be limited)
      const filteredPlants = this.postFilterPlants(plants, intent.filters);

      // Determine search strategy used
      const strategy = this.determineSearchStrategy(intent, metadataFilter);

      const duration = Date.now() - startTime;
      logger.info('Hybrid search completed', {
        resultsCount: filteredPlants.length,
        strategy,
        duration,
      });

      return {
        plants: filteredPlants,
        scores,
        searchStrategy: strategy,
        vectorResultCount: vectorResults.length,
        filteredResultCount: filteredPlants.length,
      };
    } catch (error) {
      logger.error('Error in hybrid search', { error });
      throw new Error(`Hybrid search failed: ${error}`);
    }
  }

  /**
   * Build Pinecone metadata filter from query filters
   */
  private buildMetadataFilter(filters: QueryIntent['filters']): Record<string, any> | undefined {
    const metadataFilter: Record<string, any> = {};

    // State filter
    if (filters.states && filters.states.length > 0) {
      // Pinecone uses $in operator for array matching
      // The states field in metadata is a JSON string, so we need to check if it contains the state
      // For now, we'll do post-filtering on states since metadata is stored as JSON string
      // This is a limitation of our current indexing strategy
    }

    // Growth habit filter
    if (filters.growthHabit && filters.growthHabit.length > 0) {
      // Similar issue - stored as JSON string in metadata
      // Will do post-filtering
    }

    // Duration filter
    if (filters.duration && filters.duration.length > 0) {
      metadataFilter.duration = { $in: filters.duration };
    }

    // Family filter (if we add this later)
    if (filters.scientificNames && filters.scientificNames.length > 0) {
      metadataFilter.scientificName = { $in: filters.scientificNames };
    }

    // Return undefined if no filters (more efficient)
    return Object.keys(metadataFilter).length > 0 ? metadataFilter : undefined;
  }

  /**
   * Post-filter plants based on criteria that can't be done in Pinecone
   */
  private postFilterPlants(plants: PlantRecord[], filters: QueryIntent['filters']): PlantRecord[] {
    let filtered = plants;

    // Filter by states
    if (filters.states && filters.states.length > 0) {
      filtered = filtered.filter((plant) => {
        return filters.states!.some((state) => plant.distribution.states.includes(state));
      });
    }

    // Filter by native status
    if (filters.nativeStatus) {
      filtered = filtered.filter((plant) => {
        if (filters.nativeStatus === 'native') {
          return plant.nativeStatus.some((ns) => ns.status === 'Native');
        } else if (filters.nativeStatus === 'introduced') {
          return plant.nativeStatus.some((ns) => ns.status === 'Introduced');
        }
        return true; // 'both'
      });
    }

    // Filter by growth habit
    if (filters.growthHabit && filters.growthHabit.length > 0) {
      filtered = filtered.filter((plant) => {
        return filters.growthHabit!.some((habit) => plant.growthHabit.includes(habit));
      });
    }

    // Filter by duration
    if (filters.duration && filters.duration.length > 0) {
      filtered = filtered.filter((plant) => filters.duration!.includes(plant.duration));
    }

    // Filter by characteristics
    if (filters.characteristics) {
      filtered = this.filterByCharacteristics(filtered, filters.characteristics);
    }

    // Filter by wildlife value
    if (filters.wildlifeValue && filters.wildlifeValue.length > 0) {
      filtered = filtered.filter((plant) => {
        if (!plant.characteristics.wildlifeValue) return false;
        return filters.wildlifeValue!.some((value) =>
          plant.characteristics.wildlifeValue!.includes(value as any)
        );
      });
    }

    return filtered;
  }

  /**
   * Filter plants by characteristics
   */
  private filterByCharacteristics(
    plants: PlantRecord[],
    characteristics: NonNullable<QueryIntent['filters']['characteristics']>
  ): PlantRecord[] {
    let filtered = plants;

    // Water needs
    if (characteristics.waterNeeds) {
      filtered = filtered.filter(
        (plant) => plant.characteristics.waterNeeds === characteristics.waterNeeds
      );
    }

    // Sun requirements
    if (characteristics.sunRequirements && characteristics.sunRequirements.length > 0) {
      filtered = filtered.filter((plant) => {
        if (!plant.characteristics.sunRequirements) return false;
        return characteristics.sunRequirements!.some((req) =>
          plant.characteristics.sunRequirements!.includes(req as any)
        );
      });
    }

    // Bloom period
    if (characteristics.bloomPeriod && characteristics.bloomPeriod.length > 0) {
      filtered = filtered.filter((plant) => {
        if (!plant.characteristics.bloomPeriod) return false;
        // Check if any requested period matches (partial match on bloom period string)
        return characteristics.bloomPeriod!.some((period) =>
          plant.characteristics.bloomPeriod!.includes(period)
        );
      });
    }

    // Height range
    if (characteristics.heightMin !== undefined || characteristics.heightMax !== undefined) {
      filtered = filtered.filter((plant) => {
        if (!plant.characteristics.height) return false;
        const plantHeight = plant.characteristics.height;

        if (
          characteristics.heightMin !== undefined &&
          plantHeight.max < characteristics.heightMin
        ) {
          return false;
        }

        if (
          characteristics.heightMax !== undefined &&
          plantHeight.min > characteristics.heightMax
        ) {
          return false;
        }

        return true;
      });
    }

    // Evergreen
    if (characteristics.evergreen !== undefined) {
      filtered = filtered.filter((plant) => {
        // Check if it's in Ericaceae or other evergreen families, or has relevant keywords
        const isEvergreen =
          plant.description?.toLowerCase().includes('evergreen') ||
          plant.family === 'Aquifoliaceae'; // Holly family
        return characteristics.evergreen ? isEvergreen : !isEvergreen;
      });
    }

    // Drought tolerant
    if (characteristics.droughtTolerant !== undefined) {
      filtered = filtered.filter((plant) => {
        const isDroughtTolerant = plant.characteristics.waterNeeds === 'Low';
        return characteristics.droughtTolerant ? isDroughtTolerant : !isDroughtTolerant;
      });
    }

    return filtered;
  }

  /**
   * Prioritize specific plant IDs (from conversation context)
   */
  private prioritizeSpecificPlants(
    results: VectorSearchResult[],
    plantIds: string[]
  ): VectorSearchResult[] {
    const plantIdSet = new Set(plantIds);
    const prioritized: VectorSearchResult[] = [];
    const others: VectorSearchResult[] = [];

    for (const result of results) {
      if (plantIdSet.has(result.id)) {
        // Boost score for plants from context
        prioritized.push({ ...result, score: result.score * 1.2 });
      } else {
        others.push(result);
      }
    }

    // Return prioritized plants first, then others
    return [...prioritized, ...others].sort((a, b) => b.score - a.score);
  }

  /**
   * Determine which search strategy was used
   */
  private determineSearchStrategy(
    intent: QueryIntent,
    metadataFilter: Record<string, any> | undefined
  ): 'vector' | 'filtered' | 'hybrid' {
    const hasFilters = Object.keys(intent.filters).length > 0;
    console.log('Metadata filters', metadataFilter);

    if (!hasFilters) {
      return 'vector';
    } else if (hasFilters && !intent.semanticQuery) {
      return 'filtered';
    } else {
      return 'hybrid';
    }
  }
}
