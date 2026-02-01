/**
 * Simple ingestion pipeline for Phase 3 experiments.
 *
 * - Discovers code files under a target directory
 * - Chunks them with semantic chunking (includes imports)
 * - Embeds with the mock embedder
 * - Indexes into the in-memory vector store
 *
 * This keeps the focus on retrieval experiments without needing external
 * services. Swap the embedder config when moving to real embeddings.
 */
import { discoverCodeFiles, readFiles } from '../utils/file-discovery.js';
import { chunkCodebase } from '../retrieval/code-chunker.js';
import { Embedder } from '../vector-store/embedding.js';
import { VectorStore } from '../vector-store/vector-store.js';

export interface IngestionResult {
  vectorStore: VectorStore;
  totalChunks: number;
  avgChunkSize: number;
  filesIndexed: number;
}

export async function ingestCodebase(
  basePath: string,
  options: { maxFiles?: number; strategy?: 'semantic' | 'semantic-with-lookahead' | 'fixed' } = {}
): Promise<IngestionResult> {
  const { maxFiles = 200, strategy = 'semantic-with-lookahead' } = options;

  const files = discoverCodeFiles(basePath, { extensions: ['.ts', '.tsx', '.js', '.jsx'] })
    .slice(0, maxFiles);

  if (files.length === 0) {
    throw new Error(`No code files found under ${basePath}`);
  }

  const contents = readFiles(files.map(f => f.path));

  const { chunks, statistics } = await chunkCodebase(contents, {
    strategy,
    maxTokens: 900,
  });

  const embedder = new Embedder({ dimension: 128, model: 'mock' });
  const vectorStore = new VectorStore(embedder);
  await vectorStore.indexBatch(chunks);

  console.log(`\n✓ Ingested ${files.length} files -> ${chunks.length} chunks`);
  console.log(`  Avg chunk size: ${statistics.avgChunkSize} chars | Avg tokens: ${statistics.avgTokensPerChunk}`);

  return {
    vectorStore,
    totalChunks: chunks.length,
    avgChunkSize: statistics.avgChunkSize,
    filesIndexed: files.length,
  };
}
