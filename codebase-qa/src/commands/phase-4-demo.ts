/**
 * Phase 4 Demo: end-to-end ask flow (ingest -> route -> retrieve -> synthesize)
 * using mock components. Purpose: illustrate citation plumbing before adding a
 * real LLM.
 */
import fs from 'fs';
import path from 'path';
import { ingestCodebase } from '../scripts/ingest-codebase.js';
import { QueryRouter } from '../agents/query-router.js';
import { AdaptiveRetriever } from '../retrieval/adaptive-retriever.js';
import { ResponseSynthesizer } from '../agents/response-synthesizer.js';

interface DemoQuery {
  query: string;
  note?: string;
}

export async function runPhase4Demo() {
  console.log('\nRunning Phase 4 Demo (mock synthesis with citations)');
  console.log('----------------------------------------------------');

  const datasetPath = path.resolve(process.cwd(), 'evaluations/datasets/phase4-demo-queries.json');
  const queries: DemoQuery[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  console.log(`Loaded ${queries.length} demo queries.`);

  const { vectorStore } = await ingestCodebase('./', { maxFiles: 150, strategy: 'semantic-with-lookahead' });
  const router = new QueryRouter();
  const retriever = await AdaptiveRetriever.create(vectorStore);
  const synthesizer = new ResponseSynthesizer();

  for (const q of queries) {
    console.log(`\nQ: "${q.query}" ${q.note ? `(${q.note})` : ''}`);
    const intent = await router.routeQuery(q.query);
    const search = await retriever.retrieve(q.query, intent);
    const answer = await synthesizer.synthesize(q.query, intent, search.results);

    console.log(`Intent: ${intent.type} (conf ${intent.confidence.toFixed(2)})`);
    console.log('Answer:');
    console.log(answer.content);
    console.log('Citations:');
    answer.citations.forEach(c =>
      console.log(` - ${c.filePath}:${c.startLine}-${c.endLine} (score ${c.relevance.toFixed(2)})`)
    );
  }

  console.log('\nPhase 4 demo complete. Manually inspect answers/citations to assess faithfulness.');
}
