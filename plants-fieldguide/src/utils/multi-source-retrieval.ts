/**
 * Multi-Source Retrieval System
 * Instead of using just ONE search strategy, execute MULTIPLE strategies
 * in parallel and combine the results. This is called "hybrid search" or
 * "multi-source retrieval."
 *
 * TRADITIONAL RAG:
 *   Query → Vector Search → Results → Answer
 *
 * MULTI-SOURCE RAG:
 *   Query → [Vector Search, Keyword Search, Filtered Search] → Fusion → Answer
 *
 * WHY THIS WORKS BETTER:
 * - Vector search: Finds semantically similar content
 * - Keyword search: Finds exact term matches (good for definitions)
 * - Section-filtered: Targets known information locations
 * - Query variations: Captures different phrasings
 *
 * By combining them, there is comprehensive coverage!
 */

import { type RetrievalStrategy } from "./adaptive-retrieval.js";
import { embeddingsGenerator } from "./embeddings.js";
import { vectorStore } from "./vector-store.js";
import type { SearchResult } from "../types/document.js";

// Different retrieval strategies we can use
export type SourceType =
  | "primary"
  | "keyword"
  | "section-filtered"
  | "expanded-query"
  | "alternative";

// A result with source tracking
export interface SourcedResult extends SearchResult {
  source: SourceType; // Which strategy found this
  sourceRank: number; // Rank within that strategy (0 = best)
}

// Combined results from multiple sources
export interface MultiSourceResults {
  results: SourcedResult[];
  strategies: {
    type: SourceType;
    count: number;
    avgScore: number;
  }[];
  fusionMethod: "RRF" | "score-based" | "simple";
  totalSources: number;
}

// Parameters for multi-source search
export interface MultiSourceParams {
  query: string;
  primaryStrategy: RetrievalStrategy;
  useKeywordBoost?: boolean; // Add keyword-based results
  useSectionFilter?: boolean; // Add section-filtered results
  useQueryExpansion?: boolean; // Add expanded query results
  fusionMethod?: "RRF" | "score-based" | "simple";
  verbose?: boolean;
}

/**
 * MultiSourceRetrieval Class
 * Orchestrates multiple retrieval strategies
 * This class manages executing different search approaches in parallel
 * and combining their results intelligently.
 */
export class MultiSourceRetrieval {
  /**
   * Execute multi-source retrieval
   * Parallel Execution Pattern
   * Run multiple searches concurrently (Promise.all) for speed,
   * then combine the results using a fusion algorithm.
   *
   * @param params - Multi-source search parameters
   */
  async search(params: MultiSourceParams): Promise<MultiSourceResults> {
    const {
      query,
      primaryStrategy,
      useKeywordBoost = true,
      useSectionFilter = false,
      useQueryExpansion = false,
      fusionMethod = "RRF",
      verbose = false,
    } = params;

    if (verbose) {
      console.log("\n[Multi-Source] Starting multi-source retrieval...");
      console.log(`[Multi-Source] Primary k=${primaryStrategy.k}`);
    }

    // Track all search promises for parallel execution
    const searchPromises: Promise<SourcedResult[]>[] = [];

    // STRATEGY 1: Primary adaptive search
    searchPromises.push(
      this.executePrimarySearch(query, primaryStrategy, verbose),
    );

    // STRATEGY 2: Keyword-boosted search (for exact term matches)
    if (useKeywordBoost) {
      if (verbose) {
        console.log("[Multi-Source] Adding keyword-boosted search");
      }
      searchPromises.push(
        this.executeKeywordSearch(
          query,
          Math.min(primaryStrategy.k, 5),
          verbose,
        ),
      );
    }

    // STRATEGY 3: Section-filtered search (if sections specified)
    if (
      useSectionFilter &&
      primaryStrategy.sections &&
      primaryStrategy.sections.length > 0
    ) {
      if (verbose) {
        console.log(
          `[Multi-Source] Adding section-filtered search: ${primaryStrategy.sections.join(", ")}`,
        );
      }
      searchPromises.push(
        this.executeSectionSearch(
          query,
          primaryStrategy.sections,
          Math.min(primaryStrategy.k, 5),
          verbose,
        ),
      );
    }

    // STRATEGY 4: Expanded query search (with synonyms)
    if (
      useQueryExpansion &&
      primaryStrategy.queryExpansions &&
      primaryStrategy.queryExpansions.length > 0
    ) {
      if (verbose) {
        console.log(`[Multi-Source] Adding expanded query search`);
      }
      searchPromises.push(
        this.executeExpandedSearch(
          query,
          primaryStrategy.queryExpansions,
          Math.min(primaryStrategy.k, 5),
          verbose,
        ),
      );
    }

    // Execute all searches in parallel
    const allResults = await Promise.all(searchPromises);

    // Flatten results from all sources
    const flatResults = allResults.flat();

    if (verbose) {
      console.log(
        `[Multi-Source] Collected ${flatResults.length} total results from ${searchPromises.length} sources`,
      );
    }

    // Fuse results using selected method
    const fusedResults = this.fuseResults(
      flatResults,
      fusionMethod,
      primaryStrategy.k,
      verbose,
    );

    // Calculate strategy statistics
    const strategies = this.calculateStrategyStats(flatResults);

    return {
      results: fusedResults,
      strategies,
      fusionMethod,
      totalSources: searchPromises.length,
    };
  }

  /**
   * Execute primary adaptive search
   */
  private async executePrimarySearch(
    query: string,
    strategy: RetrievalStrategy,
    verbose: boolean,
  ): Promise<SourcedResult[]> {
    const queryEmbedding = await embeddingsGenerator.generateEmbedding(query);
    const results = await vectorStore.search(queryEmbedding, strategy.k);

    return results.map((result, index) => ({
      ...result,
      source: "primary" as SourceType,
      sourceRank: index,
    }));
  }

  /**
   * Execute keyword-boosted search
   * Keyword Search for Exact Matches
   * For queries with specific terms (like "FACW"), want to ensure
   * exact matches rank highly. This search emphasizes exact term presence.
   *
   * Implementation note: In a full system, this would use BM25 or similar.
   * For now, simulate by doing a regular search but marking it differently.
   */
  private async executeKeywordSearch(
    query: string,
    k: number,
    verbose: boolean,
  ): Promise<SourcedResult[]> {
    // In a production system, this would use a keyword index (BM25, Elasticsearch, etc.)
    // For now, simulate by searching with a slightly modified query
    const keywordQuery = query
      .split(" ")
      .filter((word) => word.length > 3)
      .join(" ");

    const queryEmbedding =
      await embeddingsGenerator.generateEmbedding(keywordQuery);
    const results = await vectorStore.search(queryEmbedding, k);

    return results.map((result, index) => ({
      ...result,
      source: "keyword" as SourceType,
      sourceRank: index,
    }));
  }

  /**
   * Execute section-filtered search
   * Targeted Search in Specific Sections
   * When information known is likely in specific sections
   * (e.g., procedures in "user-guide"), we search those sections specifically.
   */
  private async executeSectionSearch(
    query: string,
    sections: string[],
    k: number,
    verbose: boolean,
  ): Promise<SourcedResult[]> {
    const queryEmbedding = await embeddingsGenerator.generateEmbedding(query);
    // Get more results, then filter by section
    const results = await vectorStore.search(queryEmbedding, k * 2);

    // Filter to specified sections
    const filtered = results.filter((result) => {
      const chunkSection = result.chunk.metadata.section?.toLowerCase();
      if (!chunkSection) return false;
      return sections.some((section) =>
        chunkSection.includes(section.toLowerCase()),
      );
    });

    return filtered.slice(0, k).map((result, index) => ({
      ...result,
      source: "section-filtered" as SourceType,
      sourceRank: index,
    }));
  }

  /**
   * Execute expanded query search
   * Searching with synonyms captures variations in terminology.
   */
  private async executeExpandedSearch(
    query: string,
    expansions: string[],
    k: number,
    verbose: boolean,
  ): Promise<SourcedResult[]> {
    const expandedQuery = [query, ...expansions].join(" ");
    const queryEmbedding =
      await embeddingsGenerator.generateEmbedding(expandedQuery);
    const results = await vectorStore.search(queryEmbedding, k);

    return results.map((result, index) => ({
      ...result,
      source: "expanded-query" as SourceType,
      sourceRank: index,
    }));
  }

  /**
   * Fuse results from multiple sources
   * Result Fusion Algorithms
   * When combining results from different sources:
   * 1. Remove duplicates
   * 2. Re-rank based on combined evidence
   * 3. Take top-k overall
   *
   * Three fusion methods:
   * - RRF (Reciprocal Rank Fusion): Based on ranking position
   * - Score-based: Based on similarity scores
   * - Simple: Deduplicate and take highest scores
   */
  private fuseResults(
    results: SourcedResult[],
    method: "RRF" | "score-based" | "simple",
    k: number,
    verbose: boolean,
  ): SourcedResult[] {
    if (method === "RRF") {
      return this.fuseRRF(results, k, verbose);
    } else if (method === "score-based") {
      return this.fuseScoreBased(results, k, verbose);
    } else {
      return this.fuseSimple(results, k, verbose);
    }
  }

  /**
   * Reciprocal Rank Fusion (RRF)
   * RRF combines rankings from different sources without needing to normalize scores.
   * Formula: score = sum(1 / (k + rank)) for all sources that found the item
   * Where k is a constant (typically 60)
   *
   * - Rank 1 gets score 1/61 = 0.016
   * - Rank 2 gets score 1/62 = 0.015
   * - If item appears in multiple sources, scores add up
   * - Items found by multiple sources rank higher (consensus!)
   */
  private fuseRRF(
    results: SourcedResult[],
    k: number,
    verbose: boolean,
  ): SourcedResult[] {
    const K_CONSTANT = 60; // RRF constant
    const scoreMap = new Map<
      string,
      { result: SourcedResult; rrfScore: number; sources: SourceType[] }
    >();

    for (const result of results) {
      const chunkId = result.chunk.id;
      const rrfScore = 1 / (K_CONSTANT + result.sourceRank);

      if (scoreMap.has(chunkId)) {
        // This chunk was found by multiple sources - boost it!
        const existing = scoreMap.get(chunkId)!;
        existing.rrfScore += rrfScore;
        existing.sources.push(result.source);
      } else {
        scoreMap.set(chunkId, {
          result,
          rrfScore,
          sources: [result.source],
        });
      }
    }

    // Sort by RRF score (higher is better)
    const fused = Array.from(scoreMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, k)
      .map((item) => item.result);

    if (verbose) {
      const multiSource = Array.from(scoreMap.values()).filter(
        (item) => item.sources.length > 1,
      ).length;
      console.log(
        `[Multi-Source] RRF fusion: ${multiSource}/${scoreMap.size} chunks found by multiple sources`,
      );
    }

    return fused;
  }

  /**
   * Score-based fusion
   * Weighted Score Combination
   * Combine similarity scores from different sources with weights.
   * Primary source might get weight 1.0, others get 0.5, etc.
   */
  private fuseScoreBased(
    results: SourcedResult[],
    k: number,
    verbose: boolean,
  ): SourcedResult[] {
    const scoreMap = new Map<
      string,
      { result: SourcedResult; totalScore: number }
    >();

    // Weights for different sources
    const weights: Record<SourceType, number> = {
      primary: 1.0,
      keyword: 0.8,
      "section-filtered": 0.7,
      "expanded-query": 0.6,
      alternative: 0.5,
    };

    for (const result of results) {
      const chunkId = result.chunk.id;
      const weight = weights[result.source] || 0.5;
      const weightedScore = result.score * weight;

      if (scoreMap.has(chunkId)) {
        scoreMap.get(chunkId)!.totalScore += weightedScore;
      } else {
        scoreMap.set(chunkId, {
          result,
          totalScore: weightedScore,
        });
      }
    }

    return Array.from(scoreMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, k)
      .map((item) => item.result);
  }

  /**
   * Simple fusion - deduplicate and take highest scores
   */
  private fuseSimple(
    results: SourcedResult[],
    k: number,
    verbose: boolean,
  ): SourcedResult[] {
    const seen = new Map<string, SourcedResult>();

    for (const result of results) {
      const chunkId = result.chunk.id;

      if (!seen.has(chunkId)) {
        seen.set(chunkId, result);
      } else {
        const existing = seen.get(chunkId)!;
        if (result.score > existing.score) {
          seen.set(chunkId, result);
        }
      }
    }

    return Array.from(seen.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  /**
   * Calculate statistics about which strategies contributed
   */
  private calculateStrategyStats(results: SourcedResult[]): {
    type: SourceType;
    count: number;
    avgScore: number;
  }[] {
    const stats = new Map<SourceType, { count: number; totalScore: number }>();

    for (const result of results) {
      if (!stats.has(result.source)) {
        stats.set(result.source, { count: 0, totalScore: 0 });
      }
      const stat = stats.get(result.source)!;
      stat.count++;
      stat.totalScore += result.score;
    }

    return Array.from(stats.entries()).map(([type, { count, totalScore }]) => ({
      type,
      count,
      avgScore: totalScore / count,
    }));
  }
}

export const multiSourceRetrieval = new MultiSourceRetrieval();
