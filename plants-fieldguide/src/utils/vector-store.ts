import hnswlib from "hnswlib-node";

const { HierarchicalNSW } = hnswlib;
import fs from "fs/promises";
import path from "path";
import type { DocumentChunk, SearchResult } from "../types/document.js";

export class VectorStore {
  private index: InstanceType<typeof HierarchicalNSW> | null = null;
  private chunks: DocumentChunk[] = [];
  private dimension: number;
  private storePath: string;

  constructor(
    dimension: number = 1536,
    storePath: string = "./data/embeddings",
  ) {
    this.dimension = dimension;
    this.storePath = storePath;
  }

  /**
   * Initialize the vector index
   */
  async initialize(maxElements: number = 10000): Promise<void> {
    this.index = new HierarchicalNSW("cosine", this.dimension);
    this.index.initIndex(maxElements);
  }

  /**
   * Add chunks with embeddings to the store
   */
  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    if (!this.index) {
      await this.initialize();
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      if (!chunk.embedding) {
        throw new Error(`Chunk ${chunk.id} has no embedding`);
      }

      this.index!.addPoint(chunk.embedding, i);
      this.chunks.push(chunk);
    }
  }

  /**
   * Search for similar chunks
   */
  async search(
    queryEmbedding: number[],
    k: number = 5,
  ): Promise<SearchResult[]> {
    if (!this.index) {
      throw new Error("Vector store not initialized");
    }

    const result = this.index.searchKnn(queryEmbedding, k);

    return result.neighbors.map((idx: number, rank: number) => ({
      chunk: this.chunks[idx],
      score: 1 - result.distances[rank], // Convert distance to similarity
      rank,
    }));
  }

  /**
   * Save index to disk
   */
  async save(name: string = "plants-help"): Promise<void> {
    if (!this.index) {
      throw new Error("No index to save");
    }

    await fs.mkdir(this.storePath, { recursive: true });

    // Save index
    const indexPath = path.join(this.storePath, `${name}.index`);
    this.index.writeIndex(indexPath);

    // Save chunks metadata
    const chunksPath = path.join(this.storePath, `${name}.chunks.json`);
    await fs.writeFile(chunksPath, JSON.stringify(this.chunks, null, 2));

    console.log(`Saved vector store to ${this.storePath}`);
  }

  /**
   * Load index from disk
   */
  async load(name: string = "plants-help"): Promise<void> {
    const indexPath = path.join(this.storePath, `${name}.index`);
    const chunksPath = path.join(this.storePath, `${name}.chunks.json`);

    // Check if files exist
    try {
      await fs.access(indexPath);
      await fs.access(chunksPath);
    } catch {
      throw new Error(`Vector store not found at ${this.storePath}`);
    }

    // Load index
    this.index = new HierarchicalNSW("cosine", this.dimension);
    this.index.readIndex(indexPath);

    // Load chunks
    const chunksData = await fs.readFile(chunksPath, "utf-8");
    this.chunks = JSON.parse(chunksData);

    console.log(`Loaded ${this.chunks.length} chunks from ${this.storePath}`);
  }

  /**
   * Get statistics about the store
   */
  getStats(): {
    numChunks: number;
    dimension: number;
    sections: string[];
  } {
    const sections = new Set(
      this.chunks
        .map((c) => c.metadata.section)
        .filter((s): s is string => s !== undefined),
    );

    return {
      numChunks: this.chunks.length,
      dimension: this.dimension,
      sections: Array.from(sections),
    };
  }
}

export const vectorStore = new VectorStore();
