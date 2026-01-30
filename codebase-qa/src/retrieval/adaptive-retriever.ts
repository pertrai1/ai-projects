/**
 * Adaptive Retriever (Phase 3)
 * 
 * The core engine of "Smart Retrieval".
 * 
 * TEACHING CONCEPT:
 * In a standard RAG, you always search with `k=10` and no filters.
 * In Adaptive RAG, we change parameters based on intent.
 * 
 * - Need a definition? -> Strict filter, low k
 * - Need examples? -> Filter for .test.ts or 'example', medium k
 * - Need architecture? -> No filter, high k
 */

import { VectorStore, SearchResults } from '../vector-store/vector-store.js';
import { QueryIntent, QueryIntentType, CodeChunk } from '../types/index.js';

export interface RetrievalConfig {
  k: number;
  minScore: number;
  filter?: (chunk: CodeChunk) => boolean;
  strategyName: string;
}

export class AdaptiveRetriever {
  private vectorStore: VectorStore;

  constructor(vectorStore: VectorStore) {
    this.vectorStore = vectorStore;
  }

  /**
   * Execute retrieval based on intent
   */
  async retrieve(query: string, intent: QueryIntent): Promise<SearchResults> {
    const config = this.getStrategyForIntent(intent);
    
    console.log(`[AdaptiveRetriever] Strategy: ${config.strategyName} (k=${config.k})`);
    
    // Execute search with adaptive parameters
    const results = await this.vectorStore.search(query, config.k, config.filter);
    
    // Post-processing (filtering by score)
    const filteredResults = results.results.filter(r => r.relevanceScore >= config.minScore);
    
    return {
      ...results,
      results: filteredResults,
      strategy: 'hybrid' // indicating we used smart logic
    };
  }

  /**
   * THE BRAIN: Mapping Intent -> Search Strategy
   */
  private getStrategyForIntent(intent: QueryIntent): RetrievalConfig {
    switch (intent.type) {
      case 'LOCATION':
        return {
          k: 3, // Very focused
          minScore: 0.85, // High precision required
          strategyName: 'Targeted Lookup',
          // If we have entities, we could filter by them here
          // For now, we rely on vector similarity + high threshold
        };

      case 'IMPLEMENTATION':
        return {
          k: 8,
          minScore: 0.7,
          strategyName: 'Implementation Search',
          // Prefer source files, avoid tests/mocks
          filter: (chunk) => !chunk.metadata.filePath.includes('.test.') && !chunk.metadata.filePath.includes('mock')
        };

      case 'USAGE':
        return {
          k: 10,
          minScore: 0.65,
          strategyName: 'Usage/Example Search',
          // Prefer tests and documentation
          filter: (chunk) => chunk.metadata.filePath.includes('.test.') || chunk.metadata.filePath.endsWith('.md')
        };
        
      case 'ARCHITECTURE':
        return {
          k: 20, // Broad context
          minScore: 0.6,
          strategyName: 'Broad Architectural Scan',
          // No filter - get everything
        };
        
      case 'DEBUGGING':
        return {
          k: 12,
          minScore: 0.65,
          strategyName: 'Error Path Search',
          // No specific filter, but strategy implies we might look for 'error' keywords in future
        };
        
      case 'DEPENDENCY':
        return {
          k: 5,
          minScore: 0.75,
          strategyName: 'Dependency Trace',
          // Prefer files with imports
          filter: (chunk) => chunk.metadata.imports && chunk.metadata.imports.length > 0
        };

      default:
        return {
          k: 10,
          minScore: 0.7,
          strategyName: 'Standard Default'
        };
    }
  }
}
