/**
 * Adaptive Retriever (Phase 3)
 * 
 * The core engine of "Smart Retrieval". It dynamically adjusts retrieval
 * parameters based on the classified query intent. This moves beyond a
 * one-size-fits-all search to a more nuanced, context-aware approach.
 * 
 * TEACHING CONCEPT:
 * This module demonstrates how to operationalize intent-based routing. Instead
 * of hardcoding `k=10`, we load a configuration file (a "spec") that maps
 * intents like 'ARCHITECTURE' or 'LOCATION' to specific parameters. This makes
 * the system's logic transparent, configurable, and easy to experiment with.
 */

import { VectorStore, SearchResults } from '../vector-store/vector-store.js';
import { QueryIntent, RetrievalStrategies, RetrievalStrategy } from '../types/index.js';
import { loadRetrievalStrategies } from '../utils/spec-loader.js';

// Define a default strategy for fallback cases.
const DEFAULT_STRATEGY: RetrievalStrategy = {
  k: 10,
  description: "A fallback strategy for general queries.",
};

export class AdaptiveRetriever {
  private vectorStore: VectorStore;
  private strategies: RetrievalStrategies;

  /**
   * The constructor is private because loading strategies is an async operation.
   * Use the static `create` method to instantiate the retriever.
   */
  private constructor(vectorStore: VectorStore, strategies: RetrievalStrategies) {
    this.vectorStore = vectorStore;
    this.strategies = strategies;
  }

  /**
   * Asynchronously creates and initializes an AdaptiveRetriever instance.
   * This pattern is used to handle the async loading of strategies before
   * the retriever is ready to be used.
   *
   * @param vectorStore The vector store instance to search against.
   * @returns A promise that resolves to a new AdaptiveRetriever instance.
   */
  public static async create(vectorStore: VectorStore): Promise<AdaptiveRetriever> {
    const strategies = await loadRetrievalStrategies();
    return new AdaptiveRetriever(vectorStore, strategies);
  }

  /**
   * Execute retrieval based on the query's classified intent.
   * It looks up the appropriate strategy from the loaded specs, applies
   * its parameters to the search, and performs any post-processing.
   */
  async retrieve(query: string, intent: QueryIntent): Promise<SearchResults> {
    // 1. Select the strategy based on the intent, with a fallback to the default.
    const strategy = this.strategies[intent.type] || DEFAULT_STRATEGY;
    
    console.log(`[AdaptiveRetriever] Intent: '${intent.type}'. Using strategy: '${strategy.description}' (k=${strategy.k})`);

    // 2. TODO: Implement filter logic based on strategy flags.
    // For now, we only use `k`. The other flags from the YAML are placeholders
    // for future enhancements.
    
    // 3. Execute the search with the adaptive 'k' parameter.
    const results = await this.vectorStore.search(query, strategy.k);
    
    // 4. TODO: Implement post-processing and context expansion.

    // For now, we return the direct results.
    return {
      ...results,
      strategy: 'hybrid', // Indicate a smart strategy was used
    };
  }
}