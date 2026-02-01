/**
 * Phase 3 Ablation: compare baseline vs adaptive retrieval on real chunks.
 *
 * Baseline: k=10, no filters, no expansion.
 * Adaptive: strategy-driven parameters from retrieval-strategies.yaml.
 *
 * Outputs a compact table showing how often adaptive changes the top result
 * and increases diversity (unique files) for broader intents.
 */
import fs from 'fs';
import path from 'path';
import { QueryRouter } from '../agents/query-router.js';
import { AdaptiveRetriever } from '../retrieval/adaptive-retriever.js';
import { ingestCodebase } from '../scripts/ingest-codebase.js';
import { VectorStore } from '../vector-store/vector-store.js';
import { CodeChunk } from '../types/index.js';

interface AblationQuery {
  query: string;
  note?: string;
}

export async function runPhase3Ablation() {
  console.log('\nRunning Phase 3 Ablation (baseline vs adaptive)');
  console.log('------------------------------------------------');

  // 1) Ingest this repo (src + docs TS/JS) using semantic-with-lookahead chunking.
  const { vectorStore } = await ingestCodebase('./', { maxFiles: 150, strategy: 'semantic-with-lookahead' });

  // 2) Load ablation queries.
  const datasetPath = path.resolve(process.cwd(), 'evaluations/datasets/phase3-ablation-queries.json');
  const queries: AblationQuery[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  console.log(`Loaded ${queries.length} ablation queries.`);

  const router = new QueryRouter();
  const retriever = await AdaptiveRetriever.create(vectorStore);

  // 3) Run both baselines per query.
  for (const q of queries) {
    const intent = await router.routeQuery(q.query);
    const baseline = await runBaseline(vectorStore, q.query);
    const adaptive = await retriever.retrieve(q.query, intent);

    const overlap = intersection(
      baseline.results.map(r => r.metadata.filePath),
      adaptive.results.map(r => r.metadata.filePath)
    );

    const topBaseline = baseline.results[0]?.metadata.filePath ?? '—';
    const topAdaptive = adaptive.results[0]?.metadata.filePath ?? '—';

    console.log(`\nQ: "${q.query}"`);
    console.log(`   intent=${intent.type} | note=${q.note ?? ''}`);
    console.log(`   baseline top: ${topBaseline}`);
    console.log(`   adaptive top: ${topAdaptive}`);
    console.log(`   overlap(files): ${overlap.length}, baseline unique: ${uniqueCount(baseline.results)}, adaptive unique: ${uniqueCount(adaptive.results)}`);
  }

  console.log('\nDone. Use these observations to update PHASE-3-REFLECTIONS.md.');
}

async function runBaseline(vectorStore: VectorStore, query: string) {
  // Baseline: fixed k=10, no filters/expansion.
  return vectorStore.search(query, 10);
}

function intersection(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return Array.from(new Set(a.filter(x => setB.has(x))));
}

function uniqueCount(results: { metadata: CodeChunk['metadata'] }[]): number {
  return new Set(results.map(r => r.metadata.filePath)).size;
}
