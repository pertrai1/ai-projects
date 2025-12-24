import { SchemaDocLoader } from "./schema-doc-loader.js";
import type { DocumentChunk, ScoredChunk } from "../types/index.js";

/**
 * Simple BM25 implementation for document ranking
 * BM25 parameters:
 * - k1 = 1.5 (term frequency saturation)
 * - b = 0.75 (length normalization)
 */
class BM25Scorer {
  private k1 = 1.5;
  private b = 0.75;
  private avgDocLength: number;
  private documentFrequencies: Map<string, number>;
  private totalDocuments: number;

  constructor(documents: DocumentChunk[]) {
    this.totalDocuments = documents.length;

    // Calculate average document length
    const totalLength = documents.reduce(
      (sum, doc) => sum + doc.tokens,
      0
    );
    this.avgDocLength = totalLength / this.totalDocuments;

    // Calculate document frequencies (DF) for each term
    this.documentFrequencies = new Map();
    for (const doc of documents) {
      const terms = new Set(this.tokenize(doc.content));
      for (const term of terms) {
        this.documentFrequencies.set(
          term,
          (this.documentFrequencies.get(term) || 0) + 1
        );
      }
    }
  }

  /**
   * Calculate BM25 score for a document given a query
   */
  score(query: string, document: DocumentChunk): number {
    const queryTerms = this.tokenize(query);
    const docTerms = this.tokenize(document.content);

    // Count term frequencies in document
    const termFrequencies = new Map<string, number>();
    for (const term of docTerms) {
      termFrequencies.set(term, (termFrequencies.get(term) || 0) + 1);
    }

    let score = 0;

    for (const term of queryTerms) {
      const tf = termFrequencies.get(term) || 0;
      if (tf === 0) continue;

      const df = this.documentFrequencies.get(term) || 0;
      if (df === 0) continue;

      // IDF component: log((N - df + 0.5) / (df + 0.5))
      const idf = Math.log(
        (this.totalDocuments - df + 0.5) / (df + 0.5)
      );

      // TF component with BM25 normalization
      const docLength = document.tokens;
      const normalizedTF =
        (tf * (this.k1 + 1)) /
        (tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength)));

      score += idf * normalizedTF;
    }

    return score;
  }

  /**
   * Tokenize text into terms for BM25
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((token) => token.length > 2); // Filter short tokens
  }
}

/**
 * Retrieves relevant schema documentation chunks for a given question
 */
export class SchemaDocRetriever {
  private loader: SchemaDocLoader;
  private topK: number;
  private relevanceThreshold: number;

  constructor(
    docsBaseDir: string = "./data/schemas",
    topK: number = 5,
    relevanceThreshold: number = 0.3
  ) {
    this.loader = new SchemaDocLoader(docsBaseDir);
    this.topK = topK;
    this.relevanceThreshold = relevanceThreshold;
  }

  /**
   * Retrieve top-K most relevant documentation chunks for a question
   */
  async retrieve(
    question: string,
    database: string,
    topK?: number
  ): Promise<ScoredChunk[]> {
    const k = topK || this.topK;

    // Load all documentation chunks for the database
    const chunks = await this.loader.loadDocumentation(database);

    if (chunks.length === 0) {
      console.warn(`No documentation found for database '${database}'`);
      return [];
    }

    // Initialize BM25 scorer
    const scorer = new BM25Scorer(chunks);

    // Score each chunk
    const scored: ScoredChunk[] = chunks.map((chunk) => ({
      chunk,
      score: scorer.score(question, chunk),
    }));

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score);

    // Filter by relevance threshold and take top-K
    const filtered = scored.filter(
      (item) => item.score >= this.relevanceThreshold
    );

    const topResults = filtered.slice(0, k);

    // Expand with related tables mentioned in retrieved chunks
    const expanded = this.expandWithRelatedTables(topResults, chunks);

    return expanded.slice(0, k);
  }

  /**
   * Expand retrieved chunks to include related table overviews
   * This ensures we have context about tables mentioned in retrieved chunks
   */
  private expandWithRelatedTables(
    scoredChunks: ScoredChunk[],
    allChunks: DocumentChunk[]
  ): ScoredChunk[] {
    const expanded = [...scoredChunks];
    const includedTables = new Set<string>();

    // Track which tables are already included
    for (const { chunk } of scoredChunks) {
      includedTables.add(chunk.table);
    }

    // Find related tables mentioned in retrieved chunks
    const relatedTables = new Set<string>();
    for (const { chunk } of scoredChunks) {
      for (const relatedTable of chunk.relatedTables) {
        if (!includedTables.has(relatedTable)) {
          relatedTables.add(relatedTable);
        }
      }
    }

    // Add overview chunks for related tables (with lower score)
    for (const tableName of relatedTables) {
      const overviewChunk = allChunks.find(
        (chunk) =>
          chunk.table === tableName && chunk.chunkType === "overview"
      );

      if (overviewChunk) {
        expanded.push({
          chunk: overviewChunk,
          score: 0.1, // Low score to indicate it's a related table, not directly relevant
        });
        includedTables.add(tableName);
      }
    }

    // Sort again to maintain order
    expanded.sort((a, b) => b.score - a.score);

    return expanded;
  }

  /**
   * Clear the documentation cache
   */
  clearCache(): void {
    this.loader.clearCache();
  }

  /**
   * Set configuration
   */
  setConfig(options: {
    topK?: number;
    relevanceThreshold?: number;
  }): void {
    if (options.topK !== undefined) {
      this.topK = options.topK;
    }
    if (options.relevanceThreshold !== undefined) {
      this.relevanceThreshold = options.relevanceThreshold;
    }
  }
}
