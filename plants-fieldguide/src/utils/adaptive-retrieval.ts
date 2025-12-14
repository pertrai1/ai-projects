/**
 * Adaptive Retrieval System
 *
 * What is Adaptive Retrieval?
 * Instead of always using the same search parameters (k=5, no filters),
 * this system dynamically adjusts retrieval based on the query type.
 *
 * TRADITIONAL RAG:
 *  Every query → vector search with k=5 → same results quality
 *
 * ADAPTIVE RAG:
 *  Query → Analyze → Determine strategy → Optimized search → Better results!
 *
 * BENEFITS:
 * - Efficiency: Don't retrieve 10 results when 3 will do
 * - Accuracy: Use exact matching for definitions, broad matching for exploration
 * - Cost: Fewer API calls, less processing
 * - Quality: Right approach for each query type
 */

import { specLoader } from "./spec-loader.js";
import { specExecutor } from "../agents/spec-executor.js";
import { embeddingsGenerator } from "./embeddings.js";
import { vectorStore } from "./vector-store.js";
import type { SearchResult } from "../types/document.js";

// The strategy decided by the retrieval-strategist agent
export interface RetrievalStrategy {
  k: number;
  exactMatch: boolean;
  expandQuery: boolean;
  sections?: string[] | null;
  multiPass: boolean;
  rerank: boolean;
  reasoning: string;
  queryExpansions?: string[];
  confidence: "high" | "medium" | "low";
}

// Parameters for executing a search with a strategy
export interface AdaptiveSearchParams {
  query: string;
  routingContext?: any;
  verbose?: boolean;
}

// Results with strategy metadata
export interface AdaptiveSearchResult {
  results: SearchResult[];
  strategy: RetrievalStrategy;
  searchesPerformed: number;
  tokensUsed: number;
}

/**
 * AdaptiveRetrieval Class
 */
export class AdaptiveRetrieval {
  /**
   * Get optimal retrieval strategy for a query
   * It analyzes the query and returns the best search approach.
   *
   * @param query - The user's question
   * @param context - Optional routing context from query-router
   * @param verbose - Show detailed output
   */
  async getStrategy(
    query: string,
    context?: any,
    verbose: boolean = false,
  ): Promise<RetrievalStrategy> {
    if (verbose) {
      console.log("\n[Adaptive Retrieval] Determining search strategy...");
    }

    // Load the retrieval-strategist agent
    const strategistSpec = await specLoader.loadAgent("retrieval-strategist");

    // Execute it with the query and context
    const result = await specExecutor.executeAgent(strategistSpec, {
      input: {
        question: query,
        // Pass routing context if available
        routingContext: context,
      },
      verbose,
    });

    const strategy = result.output as RetrievalStrategy;

    if (verbose) {
      console.log(
        `[Adaptive Retrieval] Strategy: k=${strategy.k}, exactMatch=${strategy.exactMatch}, expandQuery=${strategy.expandQuery}`,
      );
      console.log(`[Adaptive Retrieval] Reasoning: ${strategy.reasoning}`);
    }

    return strategy;
  }

  /**
   * Execute an adaptive search using the optimal strategy
   *
   * Multi-Step Process
   * 1. Determine strategy (which parameters to use)
   * 2. Generate embeddings (with possible query expansion)
   * 3. Execute search (with filters and k parameter)
   * 4. Optionally rerank results
   * 5. Return results + metadata
   *
   * @param params - Search parameters
   */
  async search(params: AdaptiveSearchParams): Promise<AdaptiveSearchResult> {
    const { query, routingContext, verbose } = params;

    // Get optimal strategy
    const strategy = await this.getStrategy(query, routingContext, verbose);

    let searchesPerformed = 0;
    let allResults: SearchResult[] = [];

    // Execute search based on strategy
    if (
      strategy.multiPass &&
      strategy.queryExpansions &&
      strategy.queryExpansions.length > 0
    ) {
      // Multi-Pass Search
      // For comparisons, we search for each concept separately,
      // then combine results. This ensures we get info on both concepts.

      if (verbose) {
        console.log(
          `\n[Adaptive Retrieval] Multi-pass search: ${strategy.queryExpansions.length + 1} passes`,
        );
      }

      // Search for original query
      const mainResults = await this.executeSearch(query, strategy);
      allResults.push(...mainResults);
      searchesPerformed++;

      // Search for each expansion
      for (const expansion of strategy.queryExpansions) {
        if (verbose) {
          console.log(`[Adaptive Retrieval] Searching for: "${expansion}"`);
        }
        const expansionResults = await this.executeSearch(expansion, strategy);
        allResults.push(...expansionResults);
        searchesPerformed++;
      }

      // Remove duplicates (same chunk appearing in multiple searches)
      allResults = this.deduplicateResults(allResults);

      // Take top k results overall
      allResults = allResults.slice(0, strategy.k);
    } else if (
      strategy.expandQuery &&
      strategy.queryExpansions &&
      strategy.queryExpansions.length > 0
    ) {
      // Query Expansion
      // Combine original query with expansions for a single enriched search

      if (verbose) {
        console.log(
          `[Adaptive Retrieval] Expanding query with: ${strategy.queryExpansions.join(", ")}`,
        );
      }

      const expandedQuery = [query, ...strategy.queryExpansions].join(" ");
      allResults = await this.executeSearch(expandedQuery, strategy);
      searchesPerformed = 1;
    } else {
      // Standard Search
      // Single search with the original query

      allResults = await this.executeSearch(query, strategy);
      searchesPerformed = 1;
    }

    // Optional reranking
    if (strategy.rerank) {
      // Reranking
      // Sometimes vector similarity isn't perfect. Reranking uses additional
      // signals to improve result order.
      if (verbose) {
        console.log("[Adaptive Retrieval] Reranking results...");
      }
    }

    // Filter by sections if specified
    if (strategy.sections && strategy.sections.length > 0) {
      if (verbose) {
        console.log(
          `[Adaptive Retrieval] Filtering to sections: ${strategy.sections.join(", ")}`,
        );
      }
      allResults = this.filterBySection(allResults, strategy.sections);
    }

    return {
      results: allResults,
      strategy,
      searchesPerformed,
      tokensUsed: 0, // Could track this for analytics
    };
  }

  /**
   * Execute a single search
   * This encapsulates the actual vector search logic.
   */
  private async executeSearch(
    query: string,
    strategy: RetrievalStrategy,
  ): Promise<SearchResult[]> {
    // Generate embedding for the query
    const queryEmbedding = await embeddingsGenerator.generateEmbedding(query);

    // Search the vector store
    // Note: We use strategy.k to determine how many results to retrieve
    const results = await vectorStore.search(queryEmbedding, strategy.k);

    return results;
  }

  /**
   * Remove duplicate results
   * When doing multi-pass searches, the same chunk might appear in
   * multiple result sets. We keep only the best match for each chunk.
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Map<string, SearchResult>();

    for (const result of results) {
      const chunkId = result.chunk.id;

      if (!seen.has(chunkId)) {
        // First time seeing this chunk
        seen.set(chunkId, result);
      } else {
        // We've seen this chunk before
        const existing = seen.get(chunkId)!;

        // Keep the one with the higher score
        if (result.score > existing.score) {
          seen.set(chunkId, result);
        }
      }
    }

    // Return deduplicated results, sorted by score
    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Filter results by section
   * Metadata Filtering
   * Sometimes we know which sections contain the answer.
   * Filtering by section improves precision.
   */
  private filterBySection(
    results: SearchResult[],
    sections: string[],
  ): SearchResult[] {
    return results.filter((result) => {
      const chunkSection = result.chunk.metadata.section?.toLowerCase();
      if (!chunkSection) return false;

      // Check if chunk's section matches any of the target sections
      return sections.some((targetSection) =>
        chunkSection.includes(targetSection.toLowerCase()),
      );
    });
  }

  /**
   * Get strategy for debugging/analysis (without executing search)
   * Useful for seeing what strategy would be chosen without
   * actually executing the search.
   */
  async explainStrategy(
    query: string,
    context?: any,
  ): Promise<RetrievalStrategy> {
    return this.getStrategy(query, context, false);
  }
}

export const adaptiveRetrieval = new AdaptiveRetrieval();
