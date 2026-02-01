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
import {
  CodeChunk,
  RetrievedChunk,
  QueryIntent,
  RetrievalStrategies,
  RetrievalStrategy,
} from '../types/index.js';
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

    // 2. Optionally expand the query with detected entities to broaden recall for
    // intents like ARCHITECTURE or USAGE.
    const expandedQuery = this.expandQuery(query, intent, strategy);

    // 3. Apply strategy-aware filters (e.g., imports-only for DEPENDENCY).
    const filterFn = this.buildFilter(strategy, intent);

    // 4. Execute the search with the adaptive 'k' parameter and filters.
    const initialResults = await this.vectorStore.search(expandedQuery, strategy.k, filterFn);

    // 5. Add contextual results (module overviews, neighboring chunks, error paths).
    const withContext = this.applyContextExpansion(initialResults.results, strategy);

    // 6. Re-rank and deduplicate based on strategy-specific signals.
    const reranked = this.rerankAndDedup(withContext, strategy, intent);

    return {
      ...initialResults,
      results: reranked,
      strategy: 'hybrid', // Indicate adaptive retrieval was used
    };
  }

  /**
   * Query expansion is deliberately lightweight: we append high-confidence
   * entity names to the query for broader recall when the strategy allows it.
   */
  private expandQuery(original: string, intent: QueryIntent, strategy: RetrievalStrategy): string {
    if (!strategy.expand_query || !intent.entities?.length) return original;

    const entityTokens = intent.entities
      .filter(e => e.confidence > 0.5)
      .map(e => e.value)
      .join(' ');

    const expanded = `${original} ${entityTokens}`;
    console.log(`[AdaptiveRetriever] Expanded query -> "${expanded}"`);
    return expanded;
  }

  /**
   * Build a filter function that can be passed into the vector store search.
   */
  private buildFilter(strategy: RetrievalStrategy, intent: QueryIntent) {
    if (!strategy.filter_by_imports && !strategy.exact_function_match && !strategy.exact_name_match) {
      return undefined;
    }

    const targetNames = (intent.entities || []).map(e => e.value.toLowerCase());

    return (chunk: CodeChunk) => {
      if (strategy.filter_by_imports && (!chunk.metadata.imports || chunk.metadata.imports.length === 0)) {
        return false;
      }

      if ((strategy.exact_function_match || strategy.exact_name_match) && targetNames.length > 0) {
        const scope = chunk.metadata.scopeName?.toLowerCase();
        if (!scope || !targetNames.some(name => scope === name)) {
          return false;
        }
      }

      return true;
    };
  }

  /**
   * Add extra context based on strategy flags.
   * - Module overview: include the first chunk of relevant files.
   * - Error paths: include neighboring chunks that contain error handling.
   */
  private applyContextExpansion(results: RetrievedChunk[], strategy: RetrievalStrategy): RetrievedChunk[] {
    const enriched: RetrievedChunk[] = [...results];

    const allChunks = this.vectorStore.getAllChunks();
    const chunkByFile = new Map<string, CodeChunk[]>();
    for (const chunk of allChunks) {
      const list = chunkByFile.get(chunk.metadata.filePath) || [];
      list.push(chunk);
      chunkByFile.set(chunk.metadata.filePath, list);
    }
    // Keep predictable ordering for neighbor lookups
    chunkByFile.forEach(list => list.sort((a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex));

    // Module overview: add the first chunk for each file already in results
    if (strategy.include_module_overview) {
      const files = new Set(results.map(r => r.metadata.filePath));
      for (const file of files) {
        const fileChunks = chunkByFile.get(file);
        if (fileChunks && fileChunks.length > 0) {
          const overview = fileChunks[0];
          enriched.push(this.toRetrievedChunk(overview, 0.35, 'module-overview'));
        }
      }
    }

    // Error paths: add immediate neighbors around chunks that mention errors
    if (strategy.include_error_paths) {
      for (const hit of results) {
        if (!/error|fail|exception|catch|throw/i.test(hit.content)) continue;

        const fileChunks = chunkByFile.get(hit.metadata.filePath);
        if (!fileChunks) continue;

        const idx = hit.metadata.chunkIndex;
        const neighbors = [idx - 1, idx + 1].filter(i => i >= 0 && i < fileChunks.length);
        for (const n of neighbors) {
          enriched.push(this.toRetrievedChunk(fileChunks[n], 0.30, 'neighbor'));
        }
      }
    }

    return enriched;
  }

  /**
   * Re-rank using simple, interpretable signals and drop duplicates.
   */
  private rerankAndDedup(chunks: RetrievedChunk[], strategy: RetrievalStrategy, intent: QueryIntent): RetrievedChunk[] {
    const targetNames = (intent.entities || []).map(e => e.value.toLowerCase());

    const scored = chunks.map(chunk => {
      const signals: Record<string, number> = {};
      let score = chunk.relevanceScore ?? 0;

      // Exact name matches get a strong boost for LOCATION/IMPLEMENTATION
      if ((strategy.exact_name_match || strategy.exact_function_match) && targetNames.length > 0) {
        const scope = chunk.metadata.scopeName?.toLowerCase();
        if (scope && targetNames.some(name => scope === name)) {
          signals.exact_name_match = 0.25;
          score += 0.25;
        }
      }

      // Example/test files boosted for USAGE
      if (strategy.boost_examples) {
        if (/test|spec|example|demo/i.test(chunk.metadata.filePath)) {
          signals.example_file = 0.15;
          score += 0.15;
        }
      }

      // Error handling boost for DEBUGGING
      if (strategy.include_error_paths && /try|catch|error|fail|throw/i.test(chunk.content)) {
        signals.error_context = 0.1;
        score += 0.1;
      }

      return {
        ...chunk,
        relevanceScore: Number(score.toFixed(3)),
        rankingSignals: signals,
      };
    });

    // Deduplicate by chunk id while keeping highest scoring copy
    const deduped = new Map<string, RetrievedChunk>();
    for (const chunk of scored) {
      const existing = deduped.get(chunk.id);
      if (!existing || (chunk.relevanceScore ?? 0) > (existing.relevanceScore ?? 0)) {
        deduped.set(chunk.id, chunk);
      }
    }

    return Array.from(deduped.values()).sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }

  /**
   * Helper to convert a CodeChunk into a RetrievedChunk with a seed score.
   */
  private toRetrievedChunk(chunk: CodeChunk, score: number, retrievalMethod: string): RetrievedChunk {
    return {
      ...chunk,
      relevanceScore: score,
      retrievalMethod,
    };
  }
}
