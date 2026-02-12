/**
 * Phase 4 Demo: end-to-end ask flow with Stage 2 validation integrated!
 *
 * Pipeline: ingest -> route -> retrieve -> synthesize -> VALIDATE
 *
 * Now shows validation scores and catches hallucinations in the mock responses.
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

    // STAGE 2: Show validation results!
    if (answer.validation) {
      const v = answer.validation;
      const statusIcon = v.passed ? '✓' : '✗';
      const recommendIcon = v.recommendation === 'accept' ? '✓' :
                           v.recommendation === 'review' ? '⚠' : '✗';

      console.log(`\nValidation:`);
      console.log(` ${statusIcon} Passed: ${v.passed}`);
      console.log(` ${recommendIcon} Recommendation: ${v.recommendation.toUpperCase()}`);
      console.log(` 📊 Faithfulness Score: ${v.faithfulnessScore.toFixed(2)}/1.0`);

      if (v.issues.length > 0) {
        console.log(` Issues:`);
        v.issues.forEach(issue => {
          const icon = issue.severity === 'error' ? '✗' :
                      issue.severity === 'warning' ? '⚠' : 'ℹ';
          console.log(`   ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
        });
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('Phase 4 demo complete with Stage 2 validation integrated!');
  console.log('Notice: Each answer now includes a faithfulness score and validation.');
}
