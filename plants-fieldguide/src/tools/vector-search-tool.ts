import { embeddingsGenerator } from "../utils/embeddings";
import { vectorStore } from "../utils/vector-store";
import type { SearchResult } from "../types/document";

export interface VectorSearchInput {
  query: string;
  k?: number;
}

export async function vectorSearchTool(
  input: VectorSearchInput,
): Promise<SearchResult[]> {
  const { query, k = 5 } = input;

  // Load vector store if not already loaded
  try {
    const stats = vectorStore.getStats();
    if (stats.numChunks === 0) {
      await vectorStore.load("plants-help");
    }
  } catch (error) {
    throw new Error(
      'Vector store not found. Please run "fieldguide index" first to create the index.',
    );
  }

  // Generate embedding for query
  const queryEmbedding = await embeddingsGenerator.generateEmbedding(query);

  // Search vector store
  const results = await vectorStore.search(queryEmbedding, k);

  return results;
}

export default vectorSearchTool;
