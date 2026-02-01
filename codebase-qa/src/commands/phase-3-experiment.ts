/**
 * Phase 3 Experiment: Adaptive Retrieval
 *
 * This experiment tests the end-to-end flow from query intent classification
 * to dynamic parameter selection in the AdaptiveRetriever.
 */
import { QueryRouter } from '../agents/query-router.js';
import { AdaptiveRetriever } from '../retrieval/adaptive-retriever.js';
import { VectorStore, SearchResults } from '../vector-store/vector-store.js';
import { Embedder } from '../vector-store/embedding.js';
import { CodeChunk } from '../types/index.js';
import * as fs from 'fs';
import * as path from 'path';

// --- Mock VectorStore for testing ---
// We create a mock VectorStore to intercept the parameters sent by the
// AdaptiveRetriever. This allows us to verify that the correct `k` value
// is being used for each intent without needing a real vector index.
class MockVectorStore extends VectorStore {
  constructor(embedder: Embedder) {
    super(embedder);
    this.mockChunks = this.buildMockChunks();
  }

  private mockChunks: CodeChunk[];

  // Override the search method to simply log the `k` value and return mock results.
  async search(query: string, k: number): Promise<SearchResults> {
    console.log(`[MockVectorStore] Received search with k=${k}`);
    
    // Return a small deterministic set of chunks so we can observe
    // context expansion and re-ranking in the retriever.
    const results = this.mockChunks.slice(0, k).map((chunk, idx) => ({
      ...chunk,
      relevanceScore: 0.6 - idx * 0.05,
      retrievalMethod: 'mock',
    }));

    return {
      results,
      query,
      searchTime: 0,
      strategy: 'hybrid', // Conforms to the required type
    };
  }
  
  // Prevent base class methods from being called
  async index(): Promise<void> {}
  async indexBatch(): Promise<void> {}

  getAllChunks() {
    return this.mockChunks;
  }

  private buildMockChunks() {
    return [
      {
        id: 'src/auth.ts#login#0',
        content: 'export function login() { try { authenticate(); } catch (error) { handle(error); } }',
        metadata: {
          filePath: 'src/auth.ts',
          fileName: 'auth.ts',
          startLine: 1,
          endLine: 6,
          scopeName: 'login',
          scopeType: 'function' as const,
          functionSignature: 'login(): Promise<void>',
          imports: ['import { authenticate } from "./client";'],
          dependencies: ['./client'],
          isExported: true,
          chunkIndex: 0,
        },
      },
      {
        id: 'src/auth.ts#client#1',
        content: 'export function authenticate() { return true; }',
        metadata: {
          filePath: 'src/auth.ts',
          fileName: 'auth.ts',
          startLine: 8,
          endLine: 12,
          scopeName: 'authenticate',
          scopeType: 'function' as const,
          functionSignature: 'authenticate(): boolean',
          imports: [],
          dependencies: [],
          isExported: true,
          chunkIndex: 1,
        },
      },
      {
        id: 'tests/auth.spec.ts#login#0',
        content: 'it("logs in", async () => { await login(); })',
        metadata: {
          filePath: 'tests/auth.spec.ts',
          fileName: 'auth.spec.ts',
          startLine: 1,
          endLine: 4,
          scopeName: 'login test',
          scopeType: 'function' as const,
          functionSignature: 'login test',
          imports: ['import { login } from "../src/auth";'],
          dependencies: ['../src/auth'],
          isExported: false,
          chunkIndex: 0,
        },
      },
    ];
  }
}

interface TestCase {
  query: string;
  expectedIntent: string;
}

export async function phase3Experiment() {
  console.log('Running Phase 3 Experiment: Adaptive Retrieval');
  console.log('------------------------------------------------');

  // 1. Initialize components
  const router = new QueryRouter();
  // Use a default mock embedder for the vector store
  const mockEmbedder = new Embedder({ dimension: 384, model: 'mock' });
  const mockVectorStore = new MockVectorStore(mockEmbedder);
  
  // The retriever is created asynchronously to load strategies
  const retriever = await AdaptiveRetriever.create(mockVectorStore);

  // 2. Load test cases
  const testCasesPath = path.resolve(process.cwd(), 'evaluations/datasets/intent-test-cases.json');
  let testCases: TestCase[] = [];
  try {
    const content = fs.readFileSync(testCasesPath, 'utf-8');
    testCases = JSON.parse(content);
  } catch (error) {
    console.error('Failed to load test cases:', error);
    return;
  }

  console.log(`Loaded ${testCases.length} test cases.`);

  // 3. Run each test case through the system
  for (const testCase of testCases) {
    console.log(`\n---`);
    console.log(`Query: "${testCase.query}"`);
    
    // a. Get intent from the router
    const intent = await router.routeQuery(testCase.query);
    console.log(`[QueryRouter] Detected Intent: ${intent.type}`);
    
    // b. Pass query and intent to the retriever
    // The retriever will then use the mock vector store, logging the `k` value.
    const retrieval = await retriever.retrieve(testCase.query, intent);

    console.log(`[AdaptiveRetriever] Returned ${retrieval.results.length} chunks after expansion + rerank:`);
    retrieval.results.slice(0, 3).forEach((chunk, idx) => {
      console.log(
        `  ${idx + 1}. ${chunk.metadata.filePath}::${chunk.metadata.scopeName ?? 'N/A'} ` +
        `(score=${chunk.relevanceScore}, method=${chunk.retrievalMethod})`
      );
    });
  }

  console.log('\n------------------------------------------------');
  console.log('Phase 3 Experiment Complete.');
  console.log('Check the logs above to verify that the `k` value changed based on the detected intent.');
}
