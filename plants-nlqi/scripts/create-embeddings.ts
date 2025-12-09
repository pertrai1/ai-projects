/**
 * Create Embeddings Script
 * Generates embeddings for sample plants and indexes them in Pinecone
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PlantRecord, PlantDocument } from '../src/models';
import { EmbeddingService } from '../src/services/embedding.service';
import { VectorSearchService } from '../src/services/vector-search.service';
import { plantToDocument } from '../src/utils/plant-document-helper';
import { logger } from '../src/utils/logger';

dotenv.config();

async function main() {
  logger.info('Starting embedding creation process');

  // Validate environment variables
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY not set in environment');
  }
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY not set in environment');
  }
  if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error('PINECONE_INDEX_NAME not set in environment');
  }

  // Initialize services
  const embeddingService = new EmbeddingService({
    apiKey: process.env.VOYAGE_API_KEY,
  });

  const vectorSearchService = new VectorSearchService({
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME,
  });

  // Check if Pinecone index is ready
  logger.info('Checking Pinecone index status...');
  const isReady = await vectorSearchService.isReady();
  if (!isReady) {
    throw new Error(
      `Pinecone index "${process.env.PINECONE_INDEX_NAME}" is not ready. Please create it first.`
    );
  }

  // Load sample plants
  logger.info('Loading sample plants...');
  const samplePlantsPath = join(__dirname, '../data/samples/sample-plants.json');
  const samplePlantsData = readFileSync(samplePlantsPath, 'utf-8');
  const plants: PlantRecord[] = JSON.parse(samplePlantsData);
  logger.info(`Loaded ${plants.length} sample plants`);

  // Convert to documents
  logger.info('Converting plants to documents...');
  const plantDocs = plants.map((plant) => plantToDocument(plant));

  // Generate embeddings
  logger.info('Generating embeddings...');
  const texts = plantDocs.map((doc) => doc.text);
  const embeddings = await embeddingService.embedTexts(texts);

  // Add embeddings to documents
  const documentsWithEmbeddings: PlantDocument[] = plantDocs.map((doc, index) => ({
    ...doc,
    embedding: embeddings[index],
  }));

  logger.info('Embeddings generated successfully');

  // Upsert to Pinecone
  logger.info('Indexing plants in Pinecone...');
  await vectorSearchService.upsertPlants(documentsWithEmbeddings);

  // Verify indexing
  logger.info('Verifying index...');
  const stats = await vectorSearchService.getStats();
  logger.info('Index stats:', stats);

  logger.info('✅ Embedding creation complete!');
  logger.info(`Successfully indexed ${plants.length} plants`);
}

main().catch((error) => {
  logger.error('Failed to create embeddings', { error });
  process.exit(1);
});
