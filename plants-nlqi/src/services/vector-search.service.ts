/**
 * Vector Search Service
 * Handles interactions with Pinecone vector database
 */

import { Pinecone, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';
import { PlantDocument, VectorSearchResult } from '../models';
import { logger } from '../utils/logger';

export interface VectorSearchConfig {
  apiKey: string;
  indexName: string;
  namespace?: string;
}

export class VectorSearchService {
  private client: Pinecone;
  private indexName: string;
  private namespace: string;

  constructor(config: VectorSearchConfig) {
    this.client = new Pinecone({ apiKey: config.apiKey });
    this.indexName = config.indexName;
    this.namespace = config.namespace || 'default';

    logger.info('Vector search service initialized', {
      indexName: this.indexName,
      namespace: this.namespace,
    });
  }

  /**
   * Upsert plant documents into Pinecone
   */
  async upsertPlants(documents: PlantDocument[]): Promise<void> {
    try {
      logger.info('Upserting plant documents', { count: documents.length });

      const index = this.client.index(this.indexName);

      // Convert to Pinecone record format
      const records: PineconeRecord<RecordMetadata>[] = documents.map((doc) => ({
        id: doc.id,
        values: doc.embedding!,
        metadata: {
          scientificName: doc.metadata.scientificName,
          commonNames: JSON.stringify(doc.metadata.commonNames),
          family: doc.metadata.family,
          states: JSON.stringify(doc.metadata.states),
          growthHabit: JSON.stringify(doc.metadata.growthHabit),
          duration: doc.metadata.duration,
          bloomPeriod: doc.metadata.bloomPeriod || '',
          nativeInStates: JSON.stringify(doc.metadata.nativeInStates),
          text: doc.text,
        },
      }));

      // Upsert in batches of 100 (Pinecone limit)
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await index.namespace(this.namespace).upsert(batch);
        logger.debug('Batch upserted', { start: i, count: batch.length });
      }

      logger.info('All plant documents upserted successfully');
    } catch (error) {
      logger.error('Error upserting plants', { error });
      throw new Error(`Failed to upsert plants: ${error}`);
    }
  }

  /**
   * Search for similar plants using vector similarity
   */
  async searchSimilar(
    queryEmbedding: number[],
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<VectorSearchResult[]> {
    try {
      logger.info('Searching for similar plants', { topK, filter });

      const index = this.client.index(this.indexName);

      const queryResponse = await index.namespace(this.namespace).query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter,
      });

      const results: VectorSearchResult[] = queryResponse.matches.map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata || {},
      }));

      logger.info('Search completed', { resultsCount: results.length });

      return results;
    } catch (error) {
      logger.error('Error searching vectors', { error });
      throw new Error(`Failed to search vectors: ${error}`);
    }
  }

  /**
   * Delete all vectors in the namespace (useful for reindexing)
   */
  async deleteAll(): Promise<void> {
    try {
      logger.warn('Deleting all vectors in namespace', { namespace: this.namespace });

      const index = this.client.index(this.indexName);
      await index.namespace(this.namespace).deleteAll();

      logger.info('All vectors deleted');
    } catch (error) {
      logger.error('Error deleting vectors', { error });
      throw new Error(`Failed to delete vectors: ${error}`);
    }
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<any> {
    try {
      const index = this.client.index(this.indexName);
      const stats = await index.describeIndexStats();

      logger.info('Index stats retrieved', { stats });
      return stats;
    } catch (error) {
      logger.error('Error getting index stats', { error });
      throw new Error(`Failed to get index stats: ${error}`);
    }
  }

  /**
   * Check if index exists and is ready
   */
  async isReady(): Promise<boolean> {
    try {
      const indexList = await this.client.listIndexes();
      const indexExists = indexList.indexes?.some((idx) => idx.name === this.indexName);

      if (!indexExists) {
        logger.warn('Index does not exist', { indexName: this.indexName });
        return false;
      }

      const indexDescription = await this.client.describeIndex(this.indexName);
      const isReady = indexDescription.status?.ready === true;

      logger.info('Index status checked', { indexName: this.indexName, ready: isReady });
      return isReady;
    } catch (error) {
      logger.error('Error checking index status', { error });
      return false;
    }
  }
}
