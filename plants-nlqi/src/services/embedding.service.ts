/**
 * Embedding Service
 * Converts text to vector embeddings using Voyage AI
 */

import { VoyageAIClient } from 'voyageai';
import { logger } from '../utils/logger';

export interface EmbeddingServiceConfig {
  apiKey: string;
  model?: string;
}

export class EmbeddingService {
  private client: VoyageAIClient;
  private model: string;

  constructor(config: EmbeddingServiceConfig) {
    this.client = new VoyageAIClient({ apiKey: config.apiKey });
    this.model = config.model || 'voyage-3';

    logger.info('Embedding service initialized', { model: this.model });
  }

  /**
   * Generate embedding for a single text
   */
  async embedText(text: string): Promise<number[]> {
    try {
      logger.debug('Generating embedding', { textLength: text.length });

      const response = await this.client.embed({
        input: text,
        model: this.model,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding returned from Voyage AI');
      }

      const embedding = response.data[0].embedding;

      if (!embedding) {
        throw new Error('Embedding data is undefined');
      }

      logger.debug('Embedding generated', { dimensions: embedding.length });

      return embedding;
    } catch (error) {
      logger.error('Error generating embedding', { error });
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    try {
      logger.info('Generating batch embeddings', { count: texts.length });

      const response = await this.client.embed({
        input: texts,
        model: this.model,
      });

      if (!response.data || response.data.length !== texts.length) {
        throw new Error('Embedding count mismatch');
      }

      const embeddings = response.data.map((item) => {
        if (!item.embedding) {
          throw new Error('Embedding data is undefined in batch response');
        }
        return item.embedding;
      });
      logger.info('Batch embeddings generated', { count: embeddings.length });

      return embeddings;
    } catch (error) {
      logger.error('Error generating batch embeddings', { error });
      throw new Error(`Failed to generate batch embeddings: ${error}`);
    }
  }

  /**
   * Get the dimension size of embeddings for this model
   */
  getDimensions(): number {
    // Voyage-3 produces 1024-dimensional embeddings
    // Voyage-2 produces 1024-dimensional embeddings
    return 1024;
  }
}
