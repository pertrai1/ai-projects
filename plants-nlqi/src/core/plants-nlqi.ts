/**
 * Plants NLQI (Natural Language Query Interface)
 * Main orchestrator that combines all services for end-to-end query processing
 */

import { QueryResult, QueryMetadata, PlantMatch } from '../models';
import { ClaudeService } from '../services/claude.service';
import { EmbeddingService } from '../services/embedding.service';
import { VectorSearchService } from '../services/vector-search.service';
import { loadPlantsByIds } from '../utils/plant-loader';
import { logger } from '../utils/logger';

export interface PlantsNLQIConfig {
  anthropicApiKey: string;
  voyageApiKey: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
}

export class PlantsNLQI {
  private claudeService: ClaudeService;
  private embeddingService: EmbeddingService;
  private vectorSearchService: VectorSearchService;

  constructor(config: PlantsNLQIConfig) {
    logger.info('Initializing PlantsNLQI');

    this.claudeService = new ClaudeService({
      apiKey: config.anthropicApiKey,
    });

    this.embeddingService = new EmbeddingService({
      apiKey: config.voyageApiKey,
    });

    this.vectorSearchService = new VectorSearchService({
      apiKey: config.pineconeApiKey,
      indexName: config.pineconeIndexName,
      namespace: config.pineconeNamespace,
    });

    logger.info('PlantsNLQI initialized successfully');
  }

  /**
   * Process a natural language query and return results
   */
  async query(userQuery: string, topK: number = 5): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      logger.info('Processing query', { query: userQuery, topK });

      // Step 1: Convert query to embedding
      logger.debug('Step 1: Generating query embedding');
      const queryEmbedding = await this.embeddingService.embedText(userQuery);

      // Step 2: Search for similar plants in vector database
      logger.debug('Step 2: Searching vector database');
      const searchResults = await this.vectorSearchService.searchSimilar(queryEmbedding, topK);

      // Step 3: Load full plant records
      logger.debug('Step 3: Loading plant records');
      const plantIds = searchResults.map((result) => result.id);
      const plants = loadPlantsByIds(plantIds);

      // Create plant matches with scores
      const plantMatches: PlantMatch[] = plants.map((plant, index) => {
        const searchResult = searchResults.find((r) => r.id === plant.id);
        return {
          plant,
          score: searchResult?.score || 0,
        };
      });

      // Step 4: Generate natural language response with Claude
      logger.debug('Step 4: Generating response with Claude');
      const answer = await this.claudeService.generateResponse(userQuery, plants);

      // Calculate metadata
      const searchTime = Date.now() - startTime;
      const metadata: QueryMetadata = {
        totalResults: plants.length,
        searchTime,
        searchType: 'vector',
      };

      const result: QueryResult = {
        query: userQuery,
        answer,
        plants: plantMatches,
        metadata,
      };

      logger.info('Query processed successfully', {
        duration: searchTime,
        resultsCount: plants.length,
      });

      return result;
    } catch (error) {
      logger.error('Error processing query', { error, query: userQuery });
      throw new Error(`Failed to process query: ${error}`);
    }
  }

  /**
   * Test all service connections
   */
  async healthCheck(): Promise<{
    claude: boolean;
    pinecone: boolean;
    overall: boolean;
  }> {
    logger.info('Running health check');

    try {
      // Test Claude connection
      const claudeHealthy = await this.claudeService.testConnection();

      // Test Pinecone connection
      const pineconeHealthy = await this.vectorSearchService.isReady();

      const overall = claudeHealthy && pineconeHealthy;

      logger.info('Health check complete', {
        claude: claudeHealthy,
        pinecone: pineconeHealthy,
        overall,
      });

      return {
        claude: claudeHealthy,
        pinecone: pineconeHealthy,
        overall,
      };
    } catch (error) {
      logger.error('Health check failed', { error });
      return {
        claude: false,
        pinecone: false,
        overall: false,
      };
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats() {
    return await this.vectorSearchService.getStats();
  }
}
